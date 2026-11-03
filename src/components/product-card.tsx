import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/data/products";
import { formatPrice } from "@/lib/format";
import { ProductArt } from "./product-art";

/** Price on a small card hang tag with an eyelet. */
export function PriceTag({ price, className = "" }: { price: number; className?: string }) {
  return (
    <span
      className={`title-4 inline-flex items-center gap-2 rounded-md border border-line bg-cotton py-1 pl-2 pr-3 font-mono tabular-nums text-ink-deep ${className}`}
    >
      <span aria-hidden className="size-2 rounded-full border border-ink/50 bg-surface-3" />
      {formatPrice(price)}
    </span>
  );
}

export function ProductCard({ product, idPrefix = "card" }: { product: Product; idPrefix?: string }) {
  return (
    <Link
      href={`/products/${product.slug}`}
      className="stitched group focus-ring flex h-full flex-col gap-4 rounded-md border border-line bg-surface p-2 pb-4 transition-[border-color,transform] duration-500 ease-brand [--stitch:var(--color-line)] hover:-translate-y-1 hover:border-ink/40 hover:[--stitch:var(--color-thread)] active:scale-[0.98]"
    >
      <div className="relative overflow-hidden rounded-sm bg-surface-2">
        {product.image ? (
          <div className="relative aspect-[3/4]">
            <Image
              src={product.image}
              alt={`${product.name} in ${product.colour}`}
              fill
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
              className="object-cover transition-transform duration-500 ease-brand group-hover:scale-[1.03]"
            />
          </div>
        ) : (
          <ProductArt
            kind={product.art}
            wash={product.wash}
            id={`${idPrefix}-${product.slug}`}
            label={`Engraved drawing of the ${product.name.toLowerCase()}`}
            className="aspect-[3/4] w-full transition-transform duration-500 ease-brand group-hover:scale-[1.03]"
          />
        )}
        <span className="caption-3 absolute left-2 top-2 rounded-md bg-cotton/90 px-2 py-1 font-mono uppercase tracking-wider text-ink-deep">
          {product.lot}
        </span>
        {(product.isNew || product.soldOut) && (
          <span
            className={`caption-3 absolute right-2 top-2 rounded-md px-2 py-1 uppercase tracking-wider ${
              product.soldOut ? "bg-ink-deep text-cotton" : "bg-thread text-ink-deep"
            }`}
          >
            {product.soldOut ? "Sold out" : "New"}
          </span>
        )}
      </div>
      <div className="flex flex-col gap-3 px-3">
        <div className="flex flex-col gap-1">
          <h3 className="title-3">{product.name}</h3>
          <p className="caption-5 text-muted">
            {product.colour} · {product.fabric}
          </p>
        </div>
        <PriceTag price={product.price} className="self-start" />
      </div>
    </Link>
  );
}

export function ProductGrid({ products, idPrefix }: { products: Product[]; idPrefix?: string }) {
  return (
    <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
      {products.map((p) => (
        <li key={p.slug}>
          <ProductCard product={p} idPrefix={idPrefix} />
        </li>
      ))}
    </ul>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <ul aria-label="Loading products" className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
      {Array.from({ length: count }, (_, i) => (
        <li key={i} className="flex flex-col gap-4 rounded-md border border-line bg-surface p-2 pb-4">
          <div className="skeleton aspect-[3/4] rounded-sm" />
          <div className="flex flex-col gap-2 px-3">
            <div className="skeleton h-4 w-2/3 rounded" />
            <div className="skeleton h-3 w-1/2 rounded" />
            <div className="skeleton h-7 w-20 rounded-md" />
          </div>
        </li>
      ))}
    </ul>
  );
}
