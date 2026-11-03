import type { Metadata } from "next";
import { Suspense } from "react";
import { ProductGridSkeleton } from "@/components/product-card";
import { ShopBrowser } from "@/components/shop-browser";

export const metadata: Metadata = {
  title: "Shop the collection",
  description: "Search and filter every piece in the current collection: tailoring, dresses, shirts, knitwear, skirts and outerwear.",
};

export default function ShopPage() {
  return (
    <div className="px-4 pb-24 pt-24 md:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 pt-12">
        <div className="flex flex-col gap-3">
          <p className="caption-3 uppercase tracking-widest text-ink">Shop</p>
          <h1 className="heading-3 md:heading-2 text-hero-gradient">The collection</h1>
          <p className="body-3 max-w-xl text-muted">
            Every piece in the current run. Open one to choose your size.
          </p>
        </div>
        <Suspense fallback={<ProductGridSkeleton />}>
          <ShopBrowser />
        </Suspense>
      </div>
    </div>
  );
}
