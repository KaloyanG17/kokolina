import { NextResponse } from "next/server";
import type Stripe from "stripe";
import * as Sentry from "@sentry/nextjs";
import type { SupabaseClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";
import { notifyAdminOfOrder, sendOrderConfirmation } from "@/lib/email";
import { stripe } from "@/lib/stripe";
import { serviceClient } from "@/lib/supabase/server";

type OrderItem = { slug: string; size: string; name: string; qty: number; unitAmount: number; image: string | null };

/**
 * Stripe calls this after payment and after refunds. It verifies the signature,
 * records each order once (keyed by session id), keeps stock per size in step
 * and sends the emails. Subscribe the endpoint to checkout.session.completed
 * and charge.refunded.
 */
export async function POST(req: Request) {
  const s = stripe();
  const db = serviceClient();
  if (!s || !env.stripeWebhookSecret || !db) {
    return NextResponse.json({ error: "Webhook not configured" }, { status: 503 });
  }

  const payload = await req.text();
  const signature = req.headers.get("stripe-signature") ?? "";
  let event: Stripe.Event;
  try {
    event = s.webhooks.constructEvent(payload, signature, env.stripeWebhookSecret);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") return recordOrder(s, db, event.data.object);
  if (event.type === "charge.refunded") return recordRefund(db, event.data.object);
  return NextResponse.json({ received: true });
}

async function recordOrder(s: Stripe, db: SupabaseClient, session: Stripe.Checkout.Session) {
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
  const items: OrderItem[] = lineItems.data.map((li, i) => {
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

  // Inside leg for free hemming, asked at checkout when the bag holds jeans
  const inseamRaw = session.custom_fields?.find((f) => f.key === "inseam")?.numeric?.value;
  const inseam = inseamRaw ? Number.parseInt(inseamRaw, 10) : NaN;
  const inseamCm = Number.isFinite(inseam) && inseam >= 40 && inseam <= 130 ? inseam : null;
  const lang = session.metadata?.lang === "en" ? "en" : "bg";

  const email = session.customer_details?.email ?? null;
  const base = {
    stripe_session_id: session.id,
    stripe_payment_intent: typeof session.payment_intent === "string" ? session.payment_intent : null,
    email,
    name: session.customer_details?.name ?? null,
    amount_total_cents: session.amount_total ?? 0,
    currency: session.currency ?? "eur",
    items,
    // The courier needs the phone number with the address
    shipping: {
      ...(session.collected_information?.shipping_details ?? { address: session.customer_details?.address ?? null }),
      phone: session.customer_details?.phone ?? null,
    },
  };
  const insert = (row: object) =>
    db.from("orders").upsert(row, { onConflict: "stripe_session_id", ignoreDuplicates: true }).select("id");

  let { data: inserted, error } = await insert({ ...base, lang, inseam_cm: inseamCm });
  // Database without migration 0003 yet: record the order without the new columns rather than lose it
  if (error && /column/i.test(error.message)) {
    Sentry.captureMessage("orders table is missing migration 0003 columns", { extra: { error: error.message } });
    ({ data: inserted, error } = await insert(base));
  }

  if (error) {
    Sentry.captureException(error, { extra: { session: session.id } });
    // A non 2xx makes Stripe retry later
    return NextResponse.json({ error: "Could not record order" }, { status: 500 });
  }

  // Already recorded on an earlier delivery of this event: do nothing twice
  if (!inserted?.length) return NextResponse.json({ received: true, duplicate: true });

  for (const item of items) {
    if (!item.slug) continue;
    const { error: stockError } = await db.rpc("decrement_stock", { p_slug: item.slug, p_qty: item.qty, p_size: item.size || null });
    // Older database function without the size argument
    if (stockError) await db.rpc("decrement_stock", { p_slug: item.slug, p_qty: item.qty });
  }

  const total = (session.amount_total ?? 0) / 100;
  const reference = session.id.slice(-10).toUpperCase();
  try {
    const delivery = (session.shipping_cost?.amount_total ?? 0) / 100;
    if (email) await sendOrderConfirmation(email, { reference, items, total, delivery, inseamCm }, lang);
    await notifyAdminOfOrder({
      reference,
      email: email ?? "unknown",
      total,
      items,
      inseamCm,
      phone: session.customer_details?.phone ?? null,
    });
  } catch (e) {
    Sentry.captureException(e, { extra: { session: session.id, step: "order emails" } });
  }

  return NextResponse.json({ received: true });
}

/**
 * A refund made in the Stripe dashboard. Partial refunds are noted on the
 * order; a full refund marks it refunded and puts the pieces back in stock.
 */
async function recordRefund(db: SupabaseClient, charge: Stripe.Charge) {
  const intent = typeof charge.payment_intent === "string" ? charge.payment_intent : charge.payment_intent?.id;
  if (!intent) return NextResponse.json({ received: true });

  const { data: order, error } = await db
    .from("orders")
    .select("id, status, items")
    .eq("stripe_payment_intent", intent)
    .maybeSingle();
  if (error) {
    Sentry.captureException(error, { extra: { intent, step: "refund lookup" } });
    return NextResponse.json({ error: "Could not read order" }, { status: 500 });
  }
  // Not one of ours, or the order event has not arrived yet: Stripe retries on 404
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  const full = charge.refunded || charge.amount_refunded >= charge.amount;
  await db.from("orders").update({ refunded_cents: charge.amount_refunded }).eq("id", order.id);
  if (!full) return NextResponse.json({ received: true, partial: true });

  // Only the delivery that flips the status restocks, so retries never add stock twice
  const { data: flipped } = await db
    .from("orders")
    .update({ status: "refunded" })
    .eq("id", order.id)
    .neq("status", "refunded")
    .select("id");
  if (flipped?.length && order.status !== "cancelled") {
    for (const item of (order.items ?? []) as OrderItem[]) {
      if (item.slug) await db.rpc("restore_stock", { p_slug: item.slug, p_qty: item.qty, p_size: item.size || null });
    }
  }
  return NextResponse.json({ received: true });
}
