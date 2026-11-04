"use client";

import { useActionState } from "react";
import { categories } from "@/data/products";
import type { ProductRow } from "@/lib/catalog";
import { Field, Notice, SubmitButton } from "@/components/admin/ui";
import { saveProduct } from "../../actions";

const ARTS = ["jeans", "trucker", "chore", "western", "dress", "skirt", "overalls", "sweat"];
const WASHES = ["raw", "rinse", "light", "ecru"];

export function ProductForm({ product }: { product?: ProductRow }) {
  const [state, action] = useActionState(saveProduct, {});
  const e = state.errors ?? {};
  const p = product;

  return (
    <form action={action} className="flex flex-col gap-6" noValidate>
      {p && <input type="hidden" name="id" value={p.id} />}
      {state.message && <Notice tone={state.ok ? "ok" : "error"}>{state.message}</Notice>}

      <fieldset className="grid grid-cols-1 gap-4 rounded-md border border-line bg-surface p-6 sm:grid-cols-2">
        <legend className="title-3 px-2">Basics</legend>
        <Field label="Name" name="name" defaultValue={p?.name} error={e.name} required className="sm:col-span-2" />
        <Field label="Lot number" name="lot" defaultValue={p?.lot} placeholder="Lot 014" error={e.lot} required />
        <Field
          label="Web address"
          name="slug"
          defaultValue={p?.slug}
          placeholder="Made from the name if left empty"
          hint="Lowercase words joined by dashes, used in the product URL."
          error={e.slug}
        />
        <Field label="Category" name="category" as="select" defaultValue={p?.category ?? "Jeans"} error={e.category}>
          {categories
            .filter((c) => c !== "All")
            .map((c) => (
              <option key={c}>{c}</option>
            ))}
        </Field>
        <Field label="Display order" name="sort" type="number" defaultValue={p?.sort ?? 0} hint="Lower numbers show first." error={e.sort} />
      </fieldset>

      <fieldset className="grid grid-cols-1 gap-4 rounded-md border border-line bg-surface p-6 sm:grid-cols-3">
        <legend className="title-3 px-2">Price and stock</legend>
        <Field label="Price (EUR)" name="price" type="number" step="0.01" min="0" inputMode="decimal" defaultValue={p ? p.price_cents / 100 : ""} error={e.price} required />
        <Field label="Stock" name="stock" type="number" min="0" step="1" defaultValue={p?.stock ?? 0} error={e.stock} hint="Lowered automatically by paid orders." />
        <Field label="Sizes" name="sizes" defaultValue={p?.sizes.join(", ") ?? "XS, S, M, L, XL"} hint="Comma separated." error={e.sizes} />
        <div className="flex flex-wrap gap-6 sm:col-span-3">
          {[
            ["published", "Published in the shop", p?.published ?? true],
            ["is_new", "Mark as new", p?.is_new ?? false],
            ["sold_out", "Force sold out", p?.sold_out ?? false],
            ["exclusive", "Exclusive (red dot run)", p?.exclusive ?? false],
          ].map(([name, label, checked]) => (
            <label key={String(name)} className="body-5 flex cursor-pointer items-center gap-2">
              <input type="checkbox" name={String(name)} defaultChecked={Boolean(checked)} className="size-4 accent-[var(--color-ink)]" />
              {String(label)}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="grid grid-cols-1 gap-4 rounded-md border border-line bg-surface p-6 sm:grid-cols-2">
        <legend className="title-3 px-2">Details</legend>
        <Field label="Colour" name="colour" defaultValue={p?.colour} placeholder="Raw indigo" error={e.colour} />
        <Field label="Fabric" name="fabric" defaultValue={p?.fabric} placeholder="14 oz selvedge denim" error={e.fabric} />
        <Field label="Description" name="description" as="textarea" rows={4} defaultValue={p?.description} error={e.description} className="sm:col-span-2" />
        <Field label="Fit notes" name="fit" as="textarea" rows={2} defaultValue={p?.fit} error={e.fit} />
        <Field label="Care" name="care" as="textarea" rows={2} defaultValue={p?.care} error={e.care} />
      </fieldset>

      <fieldset className="grid grid-cols-1 gap-4 rounded-md border border-line bg-surface p-6 sm:grid-cols-2">
        <legend className="title-3 px-2">Bulgarian (shown by default)</legend>
        <p className="body-6 text-muted sm:col-span-2">Leave a field empty to show the English text on the Bulgarian site.</p>
        <Field label="Име" name="name_bg" defaultValue={p?.name_bg ?? ""} error={e.name_bg} className="sm:col-span-2" />
        <Field label="Цвят" name="colour_bg" defaultValue={p?.colour_bg ?? ""} placeholder="Сурово индиго" error={e.colour_bg} />
        <Field label="Плат" name="fabric_bg" defaultValue={p?.fabric_bg ?? ""} placeholder="14 oz селвидж деним" error={e.fabric_bg} />
        <Field label="Описание" name="description_bg" as="textarea" rows={4} defaultValue={p?.description_bg ?? ""} error={e.description_bg} className="sm:col-span-2" />
        <Field label="Кройка" name="fit_bg" as="textarea" rows={2} defaultValue={p?.fit_bg ?? ""} error={e.fit_bg} />
        <Field label="Поддръжка" name="care_bg" as="textarea" rows={2} defaultValue={p?.care_bg ?? ""} error={e.care_bg} />
      </fieldset>

      <fieldset className="grid grid-cols-1 gap-4 rounded-md border border-line bg-surface p-6 sm:grid-cols-2">
        <legend className="title-3 px-2">Drawing shown until photos are added</legend>
        <Field label="Garment drawing" name="art" as="select" defaultValue={p?.art ?? "jeans"} error={e.art}>
          {ARTS.map((a) => (
            <option key={a}>{a}</option>
          ))}
        </Field>
        <Field label="Wash" name="wash" as="select" defaultValue={p?.wash ?? "rinse"} error={e.wash}>
          {WASHES.map((w) => (
            <option key={w}>{w}</option>
          ))}
        </Field>
      </fieldset>

      <div className="flex gap-2">
        <SubmitButton>{p ? "Save changes" : "Create product"}</SubmitButton>
      </div>
    </form>
  );
}
