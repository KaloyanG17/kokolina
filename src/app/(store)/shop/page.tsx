import type { Metadata } from "next";
import { Suspense } from "react";
import { ProductGridSkeleton } from "@/components/product-card";
import { ShopBrowser } from "@/components/shop-browser";
import { getProducts } from "@/lib/catalog";
import { dictionaries } from "@/i18n/dictionaries";
import { getLocale, getT } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { shop } = await getT();
  return { title: shop.metaTitle, description: shop.metaDescription };
}

export default async function ShopPage() {
  const locale = await getLocale();
  const { shop } = dictionaries[locale];
  const products = await getProducts(locale);
  return (
    <div className="px-4 pb-24 pt-24 md:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 pt-12">
        <div className="flex flex-col gap-3">
          <p className="caption-3 uppercase tracking-widest text-ink">{shop.eyebrow}</p>
          <h1 className="heading-3 md:heading-2 text-hero-gradient">{shop.title}</h1>
          <p className="body-3 max-w-xl text-muted">
            {shop.intro}
          </p>
        </div>
        <Suspense fallback={<ProductGridSkeleton />}>
          <ShopBrowser products={products} />
        </Suspense>
      </div>
    </div>
  );
}
