import Image from "next/image";
import type { Product } from "@/data/products";
import { ProductArt } from "./product-art";

/** First uploaded photo, or the engraved drawing until one is added. */
export function ProductPicture({
  product,
  idPrefix,
  sizes,
  className = "",
  priority = false,
}: {
  product: Product;
  idPrefix: string;
  sizes: string;
  className?: string;
  priority?: boolean;
}) {
  const photo = product.images?.[0];
  if (photo) {
    return (
      <div className={`relative ${className}`}>
        <Image
          src={photo.url}
          alt={photo.alt || `${product.name}, ${product.colour}`}
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover"
        />
      </div>
    );
  }
  return (
    <ProductArt
      kind={product.art}
      wash={product.wash}
      id={`${idPrefix}-${product.slug}`}
      label={`Engraved drawing of the ${product.name.toLowerCase()}`}
      className={className}
    />
  );
}
