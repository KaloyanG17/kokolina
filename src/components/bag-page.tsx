"use client";

import Link from "next/link";
import { Handbag } from "@phosphor-icons/react";
import { site } from "@/data/site";
import { formatPrice } from "@/lib/format";
import { useBag } from "./bag-provider";
import { BagLines, BagSkeleton, useBagItems } from "./bag-lines";
import { CheckoutButton } from "./checkout-button";

export function BagPageContent() {
  const { ready, count, checkoutEnabled } = useBag();
  const { items, subtotal } = useBagItems();

  if (!ready) return <BagSkeleton rows={3} />;

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-lg border border-line bg-surface px-6 py-24 text-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-surface-3">
          <Handbag size={24} aria-hidden />
        </div>
        <p className="title-2">Your bag is empty</p>
        <p className="body-6 max-w-sm text-muted">
          Open any piece in the shop, choose a size and add it. It will be saved here for your next visit.
        </p>
        <Link href="/shop" className="btn-primary">
          Browse the shop
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[2fr_1fr]">
      <section aria-label="Pieces in your bag">
        <BagLines size="lg" />
      </section>

      <aside aria-labelledby="summary-title" className="flex flex-col gap-4 rounded-lg border border-line bg-surface p-6 lg:sticky lg:top-24 lg:self-start">
        <h2 id="summary-title" className="heading-6">
          Order summary
        </h2>
        <dl className="flex flex-col gap-3">
          <div className="flex justify-between">
            <dt className="body-6 text-muted">
              Subtotal ({count} {count === 1 ? "piece" : "pieces"})
            </dt>
            <dd className="body-5 tabular-nums">{formatPrice(subtotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="body-6 text-muted">Shipping</dt>
            <dd className="body-6 text-muted">Calculated at checkout</dd>
          </div>
          <div className="flex justify-between rounded-sm bg-surface-2 p-3">
            <dt className="title-3">Total</dt>
            <dd className="title-3 tabular-nums">{formatPrice(subtotal)}</dd>
          </div>
        </dl>
        <CheckoutButton label="Go to checkout" className="button-lg w-full py-3" />
        <p className="caption-5 text-center text-muted">
          {checkoutEnabled
            ? `Secure payment by Stripe. Free returns within ${site.returnWindow}.`
            : "Checkout opens once payments are connected."}
        </p>
        <Link
          href="/shop"
          className="caption-1 focus-ring self-center rounded text-ink underline underline-offset-4 transition-colors duration-300 ease-brand hover:text-fg"
        >
          Continue shopping
        </Link>
      </aside>
    </div>
  );
}
