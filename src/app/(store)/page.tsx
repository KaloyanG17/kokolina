import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { getProducts, getSiteImages } from "@/lib/catalog";
import { dictionaries } from "@/i18n/dictionaries";
import { getLocale } from "@/i18n/server";
import { Hero } from "@/components/hero";
import { ProductGrid } from "@/components/product-card";
import { Reveal } from "@/components/reveal";
import { TaglineReveal } from "@/components/tagline-reveal";
import { Craft, Faq, FinalCta, Ordering } from "@/components/sections";

export default async function Home() {
  const locale = await getLocale();
  const t = dictionaries[locale];
  const [products, images] = await Promise.all([getProducts(locale), getSiteImages()]);
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: t.faq.items.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
  const newIn = products.filter((p) => p.isNew).slice(0, 4);
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <Hero photo={images.hero} />

      <section aria-labelledby="new-title" className="px-4 py-24 md:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-8">
          <Reveal className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex flex-col gap-3">
              <p className="caption-3 font-mono uppercase tracking-widest text-ink">{t.section.number} 01</p>
              <h2 id="new-title" className="heading-4 md:heading-2">
                {t.home.newTitle}
              </h2>
              <p className="body-3 max-w-md text-muted">{t.home.newIntro}</p>
            </div>
            <Link
              href="/shop"
              className="button-md focus-ring inline-flex items-center gap-2 rounded-sm text-ink transition-colors duration-300 ease-brand hover:text-fg"
            >
              {t.home.seeAll(products.length)}
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
      <Faq />
      <FinalCta />
    </>
  );
}
