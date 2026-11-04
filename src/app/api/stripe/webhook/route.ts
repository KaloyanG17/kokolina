import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { env } from "@/lib/env";
import { notifyAdminOfOrder, sendOrderConfirmation } from "@/lib/email";
import { stripe } from "@/lib/stripe";
import { serviceClient } from "@/lib/supabase/server";

/**
 * Stripe calls this after payment. It verifies the signature, records the
 * order once (keyed by session id), lowers stock and sends the emails.
 */
export async function POST(req: Request) {
  const s = stripe();
  const db = serviceClient();
  if (!s || !env.stripeWebhookSecret || !db) {
    return NextResponse.json({ error: "Webhook not configured" }, { status: 503 });
  }

  const payload = await req.text();
  const signature = req.headers.get("stripe-signature") ?? "";
  let event;
  try {
    event = s.webhooks.constructEvent(payload, signature, env.stripeWebhookSecret);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type !== "checkout.session.completed") return NextResponse.json({ received: true });

  const session = event.data.object;
  if (session.payment_status !== "paid") return NextResponse.json({ received: true });

  // Line items carry the authoritative names and amounts Stripe charged
  const lineItems = await s.checkout.sessions.listLineItems(session.id, {
    limit: 100,
    expand: ["data.price.product"],
  });
  const meta: [string, string, number, number][] = (() => {
    try {
      return JSON.parse(session.metadata?.items ?? "[]");
    } catch {
      return [];
    }
  })();
  const items = lineItems.data.map((li, i) => {
    // Slug, size and picture were set on the Stripe product at checkout; the session metadata is a fallback
    const product = li.price?.product;
    const p = product && typeof product === "object" && "metadata" in product ? product : null;
    return {
      slug: p?.metadata?.slug ?? meta[i]?.[0] ?? "",
      size: p?.metadata?.size ?? meta[i]?.[1] ?? "",
      name: li.description ?? "",
      qty: li.quantity ?? 1,
      unitAmount: (li.price?.unit_amount ?? 0) / 100,
      image: p?.images?.[0] ?? null,
    };
  });

  const email = session.customer_details?.email ?? null;
  const { data: inserted, error } = await db
    .from("orders")
    .upsert(
      {
        stripe_session_id: session.id,
        stripe_payment_intent: typeof session.payment_intent === "string" ? session.payment_intent : null,
        email,
        name: session.customer_details?.name ?? null,
        amount_total_cents: session.amount_total ?? 0,
        currency: session.currency ?? "eur",
        items,
        shipping: session.collected_information?.shipping_details ?? session.customer_details?.address ?? null,
      },
      { onConflict: "stripe_session_id", ignoreDuplicates: true },
    )
    .select("id");

  if (error) {
    Sentry.captureException(error, { extra: { session: session.id } });
    // A non 2xx makes Stripe retry later
    return NextResponse.json({ error: "Could not record order" }, { status: 500 });
  }

  // Already recorded on an earlier delivery of this event: do nothing twice
  if (!inserted?.length) return NextResponse.json({ received: true, duplicate: true });

  for (const item of items) {
    if (item.slug) await db.rpc("decrement_stock", { p_slug: item.slug, p_qty: item.qty });
  }

  const total = (session.amount_total ?? 0) / 100;
  const reference = session.id.slice(-10).toUpperCase();
  try {
    if (email) await sendOrderConfirmation(email, { reference, items, total });
    await notifyAdminOfOrder({ reference, email: email ?? "unknown", total, itemCount: items.reduce((n, i) => n + i.qty, 0) });
  } catch (e) {
    Sentry.captureException(e, { extra: { session: session.id, step: "order emails" } });
  }

  return NextResponse.json({ received: true });
}
