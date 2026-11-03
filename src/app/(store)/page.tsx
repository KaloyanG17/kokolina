import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { faqs } from "@/data/site";
import { getProducts, getSiteImages } from "@/lib/catalog";
import { Hero } from "@/components/hero";
import { ProductGrid } from "@/components/product-card";
import { Reveal } from "@/components/reveal";
import { TaglineReveal } from "@/components/tagline-reveal";
import { Craft, Faq, FinalCta, Ordering, Proof } from "@/components/sections";

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

export const revalidate = 60;

export default async function Home() {
  const [products, images] = await Promise.all([getProducts(), getSiteImages()]);
  const newIn = products.filter((p) => p.isNew).slice(0, 4);
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <Hero photo={images.hero} />

      <section aria-labelledby="new-title" className="px-4 py-24 md:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-8">
          <Reveal className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex flex-col gap-3">
              <p className="caption-3 font-mono uppercase tracking-widest text-ink">No. 01</p>
              <h2 id="new-title" className="heading-4 md:heading-2">
                New this season
              </h2>
              <p className="body-3 max-w-md text-muted">Fresh off the cutting table. Every lot is numbered.</p>
            </div>
            <Link
              href="/shop"
              className="button-md focus-ring inline-flex items-center gap-2 rounded-sm text-ink transition-colors duration-300 ease-brand hover:text-fg"
            >
              See all {products.length} lots
              <ArrowRight size={16} weight="bold" aria-hidden />
            </Link>
          </Reveal>
          <Reveal>
            <ProductGrid products={newIn} idPrefix="home" />
          </Reveal>
        </div>
      </section>

      <TaglineReveal />
      <Craft campaign={images.campaign} />
      <Ordering />
      <Proof />
      <Faq />
      <FinalCta />
    </>
  );
}
