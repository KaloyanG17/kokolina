"use client";

import Link from "next/link";
import { Check, Minus, Plus } from "@phosphor-icons/react";
import { site } from "@/data/site";
import { formatPrice } from "@/lib/format";
import { useT } from "@/i18n/client";
import { useBag } from "./bag-provider";
import { ProductPicture } from "./product-picture";

export function useBagItems() {
  const { lines, catalog } = useBag();
  const items = lines
    .map((l) => ({ ...l, product: catalog.find((p) => p.slug === l.productId) }))
    .filter((l): l is typeof l & { product: NonNullable<typeof l.product> } => Boolean(l.product));
  const subtotal = items.reduce((sum, i) => sum + i.product.price * i.qty, 0);
  return { items, subtotal };
}

/** The list of bag lines, shared by the sidebar and the bag page. */
export function BagLines({ size = "sm", onNavigate }: { size?: "sm" | "lg"; onNavigate?: () => void }) {
  const { bag } = useT();
  const { setQty, remove } = useBag();
  const { items } = useBagItems();
  const thumb = size === "lg" ? "h-40 w-32" : "h-28 w-20";

  return (
    <ul className="flex flex-col gap-4">
      {items.map((i) => (
        <li key={`${i.productId}-${i.size}`} className="flex gap-4 rounded-md border border-line bg-surface p-2">
          <Link
            href={`/products/${i.product.slug}`}
            onClick={onNavigate}
            className={`focus-ring shrink-0 overflow-hidden rounded-sm bg-surface-2 ${thumb}`}
          >
            <ProductPicture
              product={i.product}
              idPrefix={`bag-${size}-${i.size}`}
              sizes="128px"
              className="h-full w-full"
            />
          </Link>
          <div className="flex flex-1 flex-col gap-1 py-1 pr-2">
            <div className="flex items-start justify-between gap-2">
              <Link
                href={`/products/${i.product.slug}`}
                onClick={onNavigate}
                className={`${size === "lg" ? "title-2" : "title-4"} focus-ring rounded transition-colors duration-300 ease-brand hover:text-ink`}
              >
                {i.product.name}
              </Link>
              <p className={`${size === "lg" ? "body-2" : "body-6"} shrink-0 tabular-nums`}>
                {formatPrice(i.product.price * i.qty)}
              </p>
            </div>
            <p className="caption-5 text-muted">
              {i.product.colour} · {bag.size} {i.size}
            </p>
            <div className="mt-auto flex items-center justify-between pt-2">
              <div className="flex items-center gap-1 rounded-sm border border-line p-0.5">
                <QtyButton label={bag.removeOne(i.product.name)} onClick={() => setQty(i.productId, i.size, i.qty - 1)}>
                  <Minus size={14} aria-hidden />
                </QtyButton>
                <span className="caption-3 min-w-6 text-center tabular-nums" aria-live="polite">
                  {i.qty}
                </span>
                <QtyButton label={bag.addOne(i.product.name)} onClick={() => setQty(i.productId, i.size, i.qty + 1)}>
                  <Plus size={14} aria-hidden />
                </QtyButton>
              </div>
              <button
                type="button"
                onClick={() => remove(i.productId, i.size)}
                className="caption-4 focus-ring rounded text-muted underline underline-offset-4 transition-colors duration-300 ease-brand hover:text-ink"
              >
                {bag.remove}
              </button>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

export function BagSkeleton({ rows = 2 }: { rows?: number }) {
  return (
    <ul aria-label={useT().bag.loading} className="flex flex-col gap-4">
      {Array.from({ length: rows }, (_, i) => (
        <li key={i} className="flex gap-4 rounded-md border border-line p-2">
          <div className="skeleton h-28 w-20 rounded-sm" />
          <div className="flex flex-1 flex-col gap-2 py-2">
            <div className="skeleton h-4 w-3/4 rounded" />
            <div className="skeleton h-3 w-1/3 rounded" />
          </div>
        </li>
      ))}
    </ul>
  );
}

function QtyButton({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="focus-ring flex size-6 items-center justify-center rounded-sm transition-[background-color,scale] duration-150 ease-brand hover:bg-surface-3 active:scale-[0.98]"
    >
      {children}
    </button>
  );
}

/** How close the bag is to free delivery, drawn as a seam being sewn along a selvedge line. */
export function FreeShippingBar({ subtotal }: { subtotal: number }) {
  const { bag } = useT();
  const left = site.shipping.freeFrom - subtotal;
  const done = left <= 0;
  const share = Math.min(1, subtotal / site.shipping.freeFrom);
  return (
    <div className="flex flex-col gap-2">
      <p className="caption-1 flex items-center gap-2 text-fg">
        {done && <Check size={14} weight="bold" aria-hidden className="text-thread" />}
        {done ? bag.freeShippingDone : bag.freeShippingLeft(formatPrice(left))}
      </p>
      <div aria-hidden className="relative h-2 overflow-hidden rounded-full bg-surface-3">
        <div
          className="h-full w-full transition-[clip-path] duration-400 ease-brand"
          style={{
            clipPath: `inset(0 ${(1 - share) * 100}% 0 0 round 9999px)`,
            backgroundImage: "repeating-linear-gradient(90deg, var(--color-thread) 0 10px, transparent 10px 15px)",
          }}
        />
      </div>
    </div>
  );
}
