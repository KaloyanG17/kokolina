"use client";

import { useState } from "react";
import { Field } from "@/components/admin/ui";

const parseSizes = (text: string) =>
  [...new Set(text.split(",").map((s) => s.trim()).filter(Boolean))].slice(0, 20);

/**
 * Sizes plus a stock count for each one. Leaving every size empty keeps the
 * single stock number, which older products still use.
 */
export function SizeStock({
  sizes: initialSizes,
  sizeStock,
  stock,
  errors,
}: {
  sizes: string;
  sizeStock: Record<string, number>;
  stock: number;
  errors: Record<string, string>;
}) {
  const [sizesText, setSizesText] = useState(initialSizes);
  const [counts, setCounts] = useState<Record<string, string>>(() =>
    Object.fromEntries(Object.entries(sizeStock).map(([k, v]) => [k, String(v)])),
  );
  const sizes = parseSizes(sizesText);
  const perSize = sizes.some((s) => (counts[s] ?? "") !== "");
  const total = sizes.reduce((n, s) => n + (Number.parseInt(counts[s] ?? "", 10) || 0), 0);

  return (
    <>
      <Field
        label="Sizes"
        name="sizes"
        value={sizesText}
        onChange={(e) => setSizesText(e.currentTarget.value)}
        hint="Comma separated, for example 28, 30, 32 or S, M, L."
        error={errors.sizes}
        className="sm:col-span-2"
      />
      <Field
        label="Total stock"
        name="stock"
        type="number"
        min="0"
        step="1"
        {...(perSize ? { value: total, readOnly: true } : { defaultValue: stock })}
        hint={perSize ? "Adds up the sizes below." : "Used while no size has its own count."}
        error={errors.stock}
      />
      {sizes.length > 0 && (
        <fieldset className="flex flex-col gap-3 sm:col-span-3">
          <legend className="title-4 mb-2">Stock per size</legend>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
            {sizes.map((size) => (
              <label key={size} className="flex flex-col gap-1">
                <span className="caption-1 font-mono text-muted">{size}</span>
                <input
                  type="number"
                  min="0"
                  step="1"
                  inputMode="numeric"
                  name={`stock_${size}`}
                  value={counts[size] ?? ""}
                  onChange={(e) => {
                    const value = e.currentTarget.value;
                    setCounts((c) => ({ ...c, [size]: value }));
                  }}
                  placeholder="–"
                  aria-label={`Stock in size ${size}`}
                  className="body-6 w-full rounded-sm border border-line bg-surface px-3 py-2 font-mono tabular-nums text-fg transition-colors duration-300 ease-brand focus:outline-2 focus:outline-offset-2 focus:outline-ink dark:border-faded/30"
                />
              </label>
            ))}
          </div>
          <p className="caption-2 text-muted">
            {perSize
              ? "Paid orders lower the size that was bought; a full refund in Stripe puts it back. Empty sizes count as 0."
              : "Fill in the sizes to track stock per size. While they are empty, every size sells from the total."}
          </p>
          {errors.size_stock && <p className="caption-2 text-danger">{errors.size_stock}</p>}
        </fieldset>
      )}
    </>
  );
}
