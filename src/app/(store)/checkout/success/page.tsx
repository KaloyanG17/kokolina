import type { Metadata } from "next";
import Link from "next/link";
import { getProducts } from "@/lib/catalog";
import { formatPrice } from "@/lib/format";
import { stripe } from "@/lib/stripe";
import { ProductPicture } from "@/components/product-picture";
import { ClearBag } from "./clear-bag";

export const metadata: Metadata = { title: "Order confirmed", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function CheckoutSuccess({ searchParams }: { searchParams: Promise<{ session_id?: string }> }) {
  const { session_id } = await searchParams;
  const s = stripe();
  const [session, catalog] = await Promise.all([
    s && session_id?.startsWith("cs_")
      ? s.checkout.sessions.retrieve(session_id, { expand: ["line_items.data.price.product"] }).catch(() => null)
      : null,
    getProducts(),
  ]);
  const paid = session?.payment_status === "paid";

  // Match each Stripe line item back to the shop product via the slug stored at checkout
  const lines =
    session?.line_items?.data.map((li) => {
      const stripeProduct = li.price?.product;
      const meta = stripeProduct && typeof stripeProduct === "object" && "metadata" in stripeProduct ? stripeProduct.metadata : {};
      return {
        id: li.id,
        name: li.description ?? "",
        qty: li.quantity ?? 1,
        size: meta?.size,
        total: (li.amount_total ?? 0) / 100,
        product: catalog.find((p) => p.slug === meta?.slug),
      };
    }) ?? [];

  return (
    <section className="px-4 pb-24 pt-24 md:px-8">
      {paid && <ClearBag />}
      <div className="mx-auto flex max-w-xl flex-col gap-8 pt-16">
        <div className="flex flex-col gap-4">
          <p className="caption-3 font-mono uppercase tracking-widest text-ink">&quot;Order confirmed&quot;</p>
          <h1 className="heading-4 md:heading-3 text-hero-gradient">
            {paid ? "Thank you, it is being packed" : "We could not find that order"}
          </h1>
          <p className="body-3 text-muted">
            {paid
              ? `A confirmation is on its way to ${session?.customer_details?.email ?? "your inbox"}. We email again with tracking when it leaves the studio.`
              : "If you were charged, your confirmation email has the details. Otherwise your bag is still saved."}
          </p>
        </div>

        {paid && lines.length > 0 && (
          <ul className="flex flex-col gap-2 rounded-md border border-line bg-surface p-2">
            {lines.map((line) => (
              <li key={line.id} className="flex items-center gap-4 rounded-sm p-2">
                <div className="h-28 w-20 shrink-0 overflow-hidden rounded-sm bg-surface-2">
                  {line.product ? (
                    <ProductPicture product={line.product} idPrefix="success" sizes="80px" className="h-full w-full" />
                  ) : null}
                </div>
                <div className="flex flex-1 flex-col gap-1">
                  {line.product ? (
                    <Link
                      href={`/products/${line.product.slug}`}
                      className="title-3 focus-ring rounded transition-colors duration-300 ease-brand hover:text-ink"
                    >
                      {line.name}
                    </Link>
                  ) : (
                    <span className="title-3">{line.name}</span>
                  )}
                  <span className="caption-5 font-mono uppercase tracking-wide text-muted">
                    {line.product?.lot ? `${line.product.lot} · ` : ""}
                    {line.size ? `Size ${line.size} · ` : ""}Qty {line.qty}
                  </span>
                </div>
                <span className="body-5 font-mono tabular-nums">{formatPrice(line.total)}</span>
              </li>
            ))}
            <li className="flex justify-between gap-4 rounded-sm bg-surface-2 p-3">
              <span className="title-3">Total</span>
              <span className="title-3 font-mono tabular-nums">{formatPrice((session?.amount_total ?? 0) / 100)}</span>
            </li>
          </ul>
        )}

        <Link href={paid ? "/shop" : "/bag"} className="btn-primary self-start">
          {paid ? "Keep browsing" : "Back to your bag"}
        </Link>
      </div>
    </section>
  );
}
