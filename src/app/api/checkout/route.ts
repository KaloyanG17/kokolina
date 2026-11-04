import { NextResponse } from "next/server";
import { z } from "zod";
import { getProducts } from "@/lib/catalog";
import { stockFor, type Category } from "@/data/products";
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

/** Categories we hem for free; checkout asks for the inside leg when one is in the bag. */
const HEMMED: Category[] = ["Jeans", "Overalls"];

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
  // Ask for the inside leg only when the bag holds something we hem
  let hemming = false;
  for (const line of parsed.data.lines) {
    const product = catalog.find((p) => p.slug === line.productId);
    if (!product || !product.sizes.includes(line.size)) {
      return NextResponse.json({ error: t.unavailable }, { status: 409 });
    }
    if (product.soldOut) {
      return NextResponse.json({ error: t.soldOut(product.name) }, { status: 409 });
    }
    // Stock is checked per size when the product tracks sizes, otherwise against its total
    const perSize = Boolean(product.sizeStock);
    const left = stockFor(product, line.size);
    const wanted =
      items
        .filter((i) => i.slug === product.slug && (!perSize || i.size === line.size))
        .reduce((n, i) => n + i.qty, 0) + line.qty;
    if (typeof left === "number" && wanted > left) {
      const error = perSize
        ? left > 0
          ? t.lowSizeStock(left, product.name, line.size)
          : t.sizeSoldOut(product.name, line.size)
        : t.lowStock(left, product.name);
      return NextResponse.json({ error }, { status: 409 });
    }
    if (HEMMED.includes(product.category)) hemming = true;
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
    ...(hemming && {
      custom_fields: [
        {
          key: "inseam",
          label: { type: "custom" as const, custom: t.inseamLabel },
          type: "numeric" as const,
          optional: true,
          numeric: { minimum_length: 2, maximum_length: 3 },
        },
      ],
    }),
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
