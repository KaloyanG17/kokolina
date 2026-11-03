"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { MagnifyingGlass, X } from "@phosphor-icons/react";
import { categories, products, type Category } from "@/data/products";
import { ProductGrid } from "./product-card";

const sorts = {
  featured: "Featured",
  "price-asc": "Price, low to high",
  "price-desc": "Price, high to low",
  new: "New first",
} as const;
type Sort = keyof typeof sorts;

function matches(text: string, query: string) {
  const haystack = text.toLowerCase();
  return query
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((term) => haystack.includes(term));
}

export function ShopBrowser() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const category = (categories as readonly string[]).includes(params.get("category") ?? "")
    ? (params.get("category") as Category)
    : "All";
  const sort: Sort = (params.get("sort") as Sort) in sorts ? (params.get("sort") as Sort) : "featured";
  const urlQuery = params.get("q") ?? "";
  const [query, setQuery] = useState(urlQuery);

  useEffect(() => setQuery(urlQuery), [urlQuery]);

  function update(next: Record<string, string | null>) {
    const sp = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(next)) {
      if (v === null || v === "" || v === "All" || (k === "sort" && v === "featured")) sp.delete(k);
      else sp.set(k, v);
    }
    const qs = sp.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  // Keep the URL in step with the search box, a moment after typing stops
  useEffect(() => {
    if (query === urlQuery) return;
    const t = setTimeout(() => update({ q: query.trim() || null }), 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const results = useMemo(() => {
    const list = products.filter(
      (p) =>
        (category === "All" || p.category === category) &&
        matches(`${p.name} ${p.category} ${p.colour} ${p.fabric} ${p.description}`, query.trim()),
    );
    if (sort === "price-asc") return [...list].sort((a, b) => a.price - b.price);
    if (sort === "price-desc") return [...list].sort((a, b) => b.price - a.price);
    if (sort === "new") return [...list].sort((a, b) => Number(!!b.isNew) - Number(!!a.isNew));
    return list;
  }, [category, sort, query]);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4 rounded-lg border border-line bg-surface p-4 md:p-6">
        <div className="flex flex-col gap-3 md:flex-row">
          <label className="flex flex-1 items-center gap-2 rounded-sm border border-line bg-base px-4 transition-colors duration-300 ease-brand focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-ink">
            <MagnifyingGlass size={18} className="shrink-0 text-muted" aria-hidden />
            <span className="sr-only">Search the shop</span>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, fabric or colour"
              className="body-3 min-w-0 flex-1 bg-transparent py-2 placeholder:text-muted focus:outline-none [&::-webkit-search-cancel-button]:hidden"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Clear search"
                className="focus-ring -mr-2 flex size-8 items-center justify-center rounded-sm transition-colors duration-300 ease-brand hover:bg-surface-3"
              >
                <X size={14} aria-hidden />
              </button>
            )}
          </label>
          <label className="flex items-center gap-2 rounded-sm border border-line bg-base px-4 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-ink">
            <span className="caption-1 shrink-0 text-muted">Sort</span>
            <select
              value={sort}
              onChange={(e) => update({ sort: e.target.value })}
              className="title-4 flex-1 cursor-pointer bg-transparent py-2 focus:outline-none"
            >
              {Object.entries(sorts).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div role="group" aria-label="Filter by category" className="-mx-4 flex gap-2 overflow-x-auto px-4 md:mx-0 md:flex-wrap md:px-0">
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              aria-pressed={category === c}
              onClick={() => update({ category: c })}
              className={`title-4 focus-ring shrink-0 rounded-sm border px-3 py-2 transition-[background-color,color,transform] duration-300 ease-brand active:scale-[0.98] ${
                category === c ? "border-indigo bg-indigo text-cotton" : "border-line text-muted hover:bg-surface-3 hover:text-fg"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <p role="status" aria-live="polite" className="caption-1 text-muted">
        {results.length === 1 ? "1 piece" : `${results.length} pieces`}
        {query.trim() && <> matching “{query.trim()}”</>}
        {category !== "All" && <> in {category.toLowerCase()}</>}
      </p>

      {results.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-lg border border-line bg-surface px-6 py-24 text-center">
          <p className="title-2">No pieces match your search</p>
          <p className="body-6 max-w-sm text-muted">
            Try a broader word like “wool” or “dress”, or clear the filters to see the whole collection.
          </p>
          <button
            type="button"
            onClick={() => {
              setQuery("");
              router.replace(pathname, { scroll: false });
            }}
            className="btn-secondary"
          >
            Clear search and filters
          </button>
        </div>
      ) : (
        <ProductGrid products={results} idPrefix="shop" />
      )}
    </div>
  );
}
