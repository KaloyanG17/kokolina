import { NextResponse } from "next/server";
import { z } from "zod";
import { getProducts } from "@/lib/catalog";
import { shippingFor, site } from "@/data/site";
import { env } from "@/lib/env";
import { dictionaries } from "@/i18n/dictionaries";
import { getLocale } from "@/i18n/server";
import { SHIPPING_COUNTRIES, stripe, type CheckoutItem } from "@/lib/stripe";

const Body = z.object({
  lines: z
    .array(
      z.object({
        productId: z.string().min(1).max(120),
        size: z.string().min(1).max(10),
        qty: z.number().int().min(1).max(10),
      }),
    )
    .min(1)
    .max(30),
});

/**
 * Creates a Stripe Checkout Session from the bag. Prices, names and stock
 * come from the catalogue on the server, never from the browser.
 */
export async function POST(req: Request) {
  const locale = await getLocale();
  const t = dictionaries[locale].checkoutErrors;
  const s = stripe();
  if (!s) return NextResponse.json({ error: t.notConnected }, { status: 503 });

  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: t.unreadable }, { status: 400 });

  const catalog = await getProducts(locale);
  const items: CheckoutItem[] = [];
  for (const line of parsed.data.lines) {
    const product = catalog.find((p) => p.slug === line.productId);
    if (!product || !product.sizes.includes(line.size)) {
      return NextResponse.json({ error: t.unavailable }, { status: 409 });
    }
    if (product.soldOut) {
      return NextResponse.json({ error: t.soldOut(product.name) }, { status: 409 });
    }
    const wanted = items.filter((i) => i.slug === product.slug).reduce((n, i) => n + i.qty, 0) + line.qty;
    if (typeof product.stock === "number" && wanted > product.stock) {
      return NextResponse.json({ error: t.lowStock(product.stock, product.name) }, { status: 409 });
    }
    items.push({
      slug: product.slug,
      name: product.name,
      size: line.size,
      qty: line.qty,
      unitAmount: Math.round(product.price * 100),
    });
  }

  // Courier delivery in Bulgaria: flat fee, free from the threshold
  const subtotal = items.reduce((sum, i) => sum + i.unitAmount * i.qty, 0) / 100;
  const deliveryFee = shippingFor(subtotal);

  const origin = env.siteUrl.replace(/\/$/, "");
  // Picture shown next to each item in Stripe Checkout: the first photo, or the engraved drawing as a PNG
  const imageFor = (slug: string) =>
    catalog.find((p) => p.slug === slug)?.images?.[0]?.url ?? `${origin}/api/product-image/${slug}`;

  const session = await s.checkout.sessions.create({
    mode: "payment",
    locale,
    line_items: items.map((i) => ({
      quantity: i.qty,
      price_data: {
        currency: "eur",
        unit_amount: i.unitAmount,
        product_data: {
          name: i.name,
          description: t.size(i.size),
          images: [imageFor(i.slug)],
          metadata: { slug: i.slug, size: i.size },
        },
      },
    })),
    shipping_address_collection: { allowed_countries: [...SHIPPING_COUNTRIES] },
    shipping_options: [
      {
        shipping_rate_data: {
          type: "fixed_amount",
          display_name: deliveryFee ? t.courier : t.courierFree,
          fixed_amount: { amount: Math.round(deliveryFee * 100), currency: "eur" },
          tax_behavior: "inclusive",
          // Dispatch time plus a day or two with the courier
          delivery_estimate: {
            minimum: { unit: "business_day", value: site.dispatchDays.min + 1 },
            maximum: { unit: "business_day", value: site.dispatchDays.max + 2 },
          },
        },
      },
    ],
    phone_number_collection: { enabled: true },
    billing_address_collection: "auto",
    // Compact copy of the order for the webhook (Stripe metadata values max 500 chars)
    metadata: {
      items: JSON.stringify(items.map((i) => [i.slug, i.size, i.qty, i.unitAmount])).slice(0, 500),
      // Language for the confirmation email
      lang: locale,
    },
    success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/bag`,
  });

  if (!session.url) return NextResponse.json({ error: t.noPage }, { status: 502 });
  return NextResponse.json({ url: session.url });
}
