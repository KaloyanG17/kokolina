import type { Product } from "@/data/products";
import { ProductArt } from "./product-art";

/** Resized copy through the Next image optimiser; widths must be in its default device sizes. */
function optimised(url: string, width: 640 | 1080) {
  return `/_next/image?url=${encodeURIComponent(url)}&w=${width}&q=80`;
}

/**
 * The product hanging on the rail: the first uploaded photo on the hook, or
 * the engraved drawing until one is added.
 */
export function ProductPicture({
  product,
  idPrefix,
  className = "",
  priority = false,
}: {
  product: Product;
  idPrefix: string;
  /** Kept for callers; the picture is sized by its container. */
  sizes?: string;
  className?: string;
  priority?: boolean;
}) {
  const photo = product.images?.[0];
  return (
    <ProductArt
      kind={product.art}
      wash={product.wash}
      id={`${idPrefix}-${product.slug}`}
      photo={photo ? optimised(photo.url, priority ? 1080 : 640) : undefined}
      label={photo ? photo.alt || `${product.name}, ${product.colour}` : `Engraved drawing of the ${product.name.toLowerCase()}`}
      className={className}
    />
  );
}
