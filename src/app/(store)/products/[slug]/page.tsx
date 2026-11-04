import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CaretRight, Plus } from "@phosphor-icons/react/dist/ssr";
import { getProduct, getProducts, relatedTo } from "@/lib/catalog";
import { site } from "@/data/site";
import { ProductPicture } from "@/components/product-picture";
import { PriceTag, ProductGrid } from "@/components/product-card";
import { ProductPurchase } from "@/components/product-purchase";
import { dictionaries } from "@/i18n/dictionaries";
import { getLocale } from "@/i18n/server";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await getProduct((await params).slug, await getLocale());
  if (!product) return {};
  return { title: product.name, description: product.description };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const locale = await getLocale();
  const t = dictionaries[locale];
  const all = await getProducts(locale);
  const product = all.find((p) => p.slug === slug);
  if (!product) notFound();
  const extraPhotos = product.images?.slice(1) ?? [];

  const details = [
    { title: t.product.fabricCare, body: `${product.fabric}. ${product.care}` },
    { title: t.product.fit, body: product.fit },
    { title: t.product.shipping, body: t.product.shippingBody },
  ];

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    color: product.colour,
    material: product.fabric,
    offers: {
      "@type": "Offer",
      price: product.price,
      priceCurrency: site.currency,
      availability: product.soldOut ? "https://schema.org/SoldOut" : "https://schema.org/InStock",
    },
  };

  return (
    <div className="px-4 pb-24 pt-24 md:px-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }} />
      <div className="mx-auto flex max-w-7xl flex-col gap-24 pt-8">
        <div className="flex flex-col gap-6">
          <nav aria-label="Breadcrumb">
            <ol className="caption-1 flex flex-wrap items-center gap-2 text-muted">
              <li>
                <Link href="/shop" className="focus-ring rounded transition-colors duration-300 ease-brand hover:text-ink">
                  {t.product.shop}
                </Link>
              </li>
              <li aria-hidden className="flex"><CaretRight size={12} /></li>
              <li>
                <Link
                  href={`/shop?category=${product.category}`}
                  className="focus-ring rounded transition-colors duration-300 ease-brand hover:text-ink"
                >
                  {t.categories[product.category]}
                </Link>
              </li>
              <li aria-hidden className="flex"><CaretRight size={12} /></li>
              <li aria-current="page" className="text-fg">
                {product.name}
              </li>
            </ol>
          </nav>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.2fr_1fr] lg:gap-16">
            <div className="stitched-lg overflow-hidden rounded-lg border border-line bg-surface-2 [--stitch:var(--color-line)]">
              <ProductPicture
                product={product}
                idPrefix="pdp"
                priority
                sizes="(min-width: 1024px) 55vw, 100vw"
                className="aspect-[3/4] w-full"
              />
            </div>
            {extraPhotos.length > 0 && (
              <ul className="grid grid-cols-2 gap-4 lg:col-start-1">
                {extraPhotos.map((photo) => (
                  <li key={photo.url} className="relative aspect-[3/4] overflow-hidden rounded-md border border-line bg-surface-2">
                    <Image
                      src={photo.url}
                      alt={photo.alt || t.product.anotherView(product.name)}
                      fill
                      sizes="(min-width: 1024px) 27vw, 50vw"
                      className="object-cover"
                    />
                  </li>
                ))}
              </ul>
            )}

            <div className="flex flex-col gap-8 lg:sticky lg:top-24 lg:self-start">
              <div className="flex flex-col gap-3">
                <p className="caption-3 font-mono uppercase tracking-widest text-ink">
                  {product.lot} · {t.categories[product.category]}
                  {product.exclusive && <span className="text-dot"> · {t.product.exclusive}</span>}
                  {product.isNew && !product.soldOut && <span className="text-thread"> · {t.product.new}</span>}
                  {product.soldOut && <span className="text-selvedge"> · {t.product.soldOut}</span>}
                </p>
                <h1 className="heading-4 md:heading-3">{product.name}</h1>
                <PriceTag price={product.price} className="self-start" />
                <p className="caption-2 text-muted">
                  {product.colour} · {product.fabric}
                </p>
              </div>

              <p className="body-3 text-muted">{product.description}</p>

              <ProductPurchase product={product} />

              <ul className="flex flex-col gap-2">
                {details.map((d) => (
                  <li key={d.title}>
                    <details className="group rounded-md border border-line bg-surface transition-colors duration-300 ease-brand open:bg-surface-2">
                      <summary className="title-3 focus-ring flex cursor-pointer list-none items-center justify-between gap-4 rounded-md p-4 [&::-webkit-details-marker]:hidden">
                        {d.title}
                        <Plus size={16} aria-hidden className="shrink-0 transition-transform duration-500 ease-brand group-open:rotate-45" />
                      </summary>
                      <p className="body-6 px-4 pb-4 text-muted">{d.body}</p>
                    </details>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <section aria-labelledby="related-title" className="flex flex-col gap-8">
          <h2 id="related-title" className="heading-5 md:heading-4">
            {t.product.related}
          </h2>
          <ProductGrid products={relatedTo(product, all)} idPrefix="related" />
        </section>
      </div>
    </div>
  );
}
