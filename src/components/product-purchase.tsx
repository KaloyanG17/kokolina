"use client";

import { useState } from "react";
import { Handbag } from "@phosphor-icons/react";
import type { Product } from "@/data/products";
import { useT } from "@/i18n/client";
import { useBag } from "./bag-provider";

export function ProductPurchase({ product }: { product: Product }) {
  const { product: copy } = useT();
  const { add } = useBag();
  const [size, setSize] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (product.soldOut) {
    return (
      <p className="body-5 rounded-md border border-line bg-surface-2 p-4 text-muted">
        {copy.soldOutNote}
      </p>
    );
  }

  function onAdd() {
    if (!size) return setError(copy.chooseSize);
    setError(null);
    add(product, size);
  }

  return (
    <div className="flex flex-col gap-4">
      <fieldset className="flex flex-col gap-2">
        <legend className="title-4 mb-2">
          {copy.size}{size && <span className="text-muted">: {size}</span>}
        </legend>
        <div className="flex flex-wrap gap-2">
          {product.sizes.map((s) => (
            <label key={s}>
              <input
                type="radio"
                name="size"
                value={s}
                checked={size === s}
                onChange={() => {
                  setSize(s);
                  setError(null);
                }}
                aria-describedby={error ? "size-error" : undefined}
                className="peer sr-only"
              />
              <span className="title-4 flex h-12 min-w-12 cursor-pointer items-center justify-center rounded-sm border border-line bg-surface px-3 transition-[background-color,color,scale] duration-150 ease-brand hover:border-ink-soft hover:bg-surface-2 active:scale-[0.98] peer-checked:border-indigo peer-checked:bg-indigo peer-checked:text-cotton peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ink">
                {s}
              </span>
            </label>
          ))}
        </div>
      </fieldset>
      <button type="button" onClick={onAdd} className="btn-primary button-lg w-full py-3">
        <Handbag size={20} weight="bold" aria-hidden />
        {copy.addToBag}
      </button>
      {error && (
        <p id="size-error" role="alert" className="caption-1 text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
