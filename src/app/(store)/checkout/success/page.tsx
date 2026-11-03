import type { Metadata } from "next";
import Link from "next/link";
import { formatPrice } from "@/lib/format";
import { stripe } from "@/lib/stripe";
import { ClearBag } from "./clear-bag";

export const metadata: Metadata = { title: "Order confirmed", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function CheckoutSuccess({ searchParams }: { searchParams: Promise<{ session_id?: string }> }) {
  const { session_id } = await searchParams;
  const s = stripe();
  const session =
    s && session_id?.startsWith("cs_")
      ? await s.checkout.sessions.retrieve(session_id, { expand: ["line_items"] }).catch(() => null)
      : null;
  const paid = session?.payment_status === "paid";

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

        {paid && session?.line_items && (
          <ul className="flex flex-col rounded-md border border-line bg-surface p-4">
            {session.line_items.data.map((li) => (
              <li key={li.id} className="flex justify-between gap-4 border border-x-0 border-t-0 border-dashed border-line py-3 last:border-0">
                <span className="body-5">
                  {li.description} <span className="text-muted">× {li.quantity}</span>
                </span>
                <span className="body-5 font-mono tabular-nums">{formatPrice((li.amount_total ?? 0) / 100)}</span>
              </li>
            ))}
            <li className="flex justify-between gap-4 pt-3">
              <span className="title-3">Total</span>
              <span className="title-3 font-mono tabular-nums">{formatPrice((session.amount_total ?? 0) / 100)}</span>
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
