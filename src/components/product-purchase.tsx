"use client";

import { useEffect, useRef, useState } from "react";
import { Handbag } from "@phosphor-icons/react";
import { stockFor, type Product } from "@/data/products";
import { useT } from "@/i18n/client";
import { formatPrice } from "@/lib/format";
import { useBag } from "./bag-provider";
import { SizeGuide } from "./size-guide";

export function ProductPurchase({ product }: { product: Product }) {
  const { product: copy } = useT();
  const { add } = useBag();
  const [size, setSize] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [buttonVisible, setButtonVisible] = useState(true);
  const sizesRef = useRef<HTMLFieldSetElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // On phones a buy bar takes over once the main button is out of view
  useEffect(() => {
    const el = buttonRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => setButtonVisible(entry.isIntersecting));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  if (product.soldOut) {
    return (
      <p className="body-5 rounded-md border border-line bg-surface-2 p-4 text-muted">
        {copy.soldOutNote}
      </p>
    );
  }

  // Only per size counts disable a size; a product without them sells every size from its total
  const left = (s: string) => (product.sizeStock ? stockFor(product, s) : undefined);
  const selectedLeft = size ? left(size) : undefined;

  function onAdd() {
    if (!size) {
      setError(copy.chooseSize);
      sizesRef.current?.scrollIntoView({ block: "center" });
      return;
    }
    setError(null);
    add(product, size);
  }

  return (
    <div className="flex flex-col gap-4">
      <fieldset ref={sizesRef} className="flex flex-col gap-2">
        {/* The error sits beside the label, so showing it never moves the page */}
        <legend className="title-4 mb-2 flex w-full flex-wrap items-baseline gap-x-3">
          <span>
            {copy.size}
            {size && <span className="text-muted">: {size}</span>}
          </span>
          {error && (
            <span id="size-error" role="alert" className="caption-1 text-danger">
              {error}
            </span>
          )}
          {!error && typeof selectedLeft === "number" && selectedLeft > 0 && selectedLeft <= 3 && (
            <span className="caption-1 text-thread">{copy.fewLeft(selectedLeft)}</span>
          )}
          <span className="ml-auto">
            <SizeGuide sizes={product.sizes} hemmed={product.category === "Jeans" || product.category === "Overalls"} />
          </span>
        </legend>
        <div className="flex flex-wrap gap-2">
          {product.sizes.map((s) => {
            const gone = left(s) === 0;
            return (
            <label key={s}>
              <input
                type="radio"
                name="size"
                value={s}
                disabled={gone}
                checked={size === s}
                onChange={() => {
                  setSize(s);
                  setError(null);
                }}
                aria-describedby={error ? "size-error" : undefined}
                className="peer sr-only"
              />
              <span
                className={`title-4 flex h-12 min-w-12 items-center justify-center rounded-sm border bg-surface px-3 transition-[background-color,color,border-color,scale] duration-150 ease-brand peer-checked:border-indigo peer-checked:bg-indigo peer-checked:text-cotton peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ink ${
                  gone
                    ? "cursor-not-allowed border-dashed border-line text-muted line-through opacity-60"
                    : `cursor-pointer hover:border-ink-soft hover:bg-surface-2 active:scale-[0.98] ${error ? "border-danger" : "border-line"}`
                }`}
              >
                {s}
                {gone && <span className="sr-only">, {copy.sizeGone}</span>}
              </span>
            </label>
            );
          })}
        </div>
      </fieldset>
      <button ref={buttonRef} type="button" onClick={onAdd} className="btn-primary button-lg w-full py-3">
        <Handbag size={20} weight="bold" aria-hidden />
        {copy.addToBag}
      </button>

      {/* Phone buy bar: price and add to bag, slid up from the bottom edge while the main button is off screen */}
      <div
        aria-hidden={buttonVisible}
        inert={buttonVisible}
        className={`fixed inset-x-0 bottom-0 z-40 flex items-center gap-3 border-t border-line bg-surface/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-md transition-[translate] duration-200 ease-brand lg:hidden ${
          buttonVisible ? "translate-y-full" : "translate-y-0"
        }`}
      >
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="title-4 truncate">{product.name}</span>
          <span className="caption-5 font-mono tabular-nums text-muted">
            {formatPrice(product.price)}
            {size && ` · ${copy.size} ${size}`}
          </span>
        </div>
        <button type="button" onClick={onAdd} className="btn-primary button-sm shrink-0 whitespace-nowrap">
          <Handbag size={16} weight="bold" aria-hidden />
          {copy.addToBag}
        </button>
      </div>
    </div>
  );
}
