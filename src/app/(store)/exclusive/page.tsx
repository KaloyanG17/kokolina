import type { Metadata } from "next";
import { getProducts } from "@/lib/catalog";
import { Newsletter } from "@/components/footer";
import { ProductGrid } from "@/components/product-card";
import { Reveal } from "@/components/reveal";
import { Selvedge } from "@/components/selvedge";
import { Wordmark } from "@/components/wordmark";
import { dictionaries } from "@/i18n/dictionaries";
import { getLocale, getT } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { exclusive } = await getT();
  return { title: exclusive.metaTitle, description: exclusive.metaDescription };
}

/** The red dot run: the wordmark with a red dot over the I, and the pieces marked exclusive in the admin. */
export default async function ExclusivePage() {
  const locale = await getLocale();
  const { exclusive: copy } = dictionaries[locale];
  const pieces = (await getProducts(locale)).filter((p) => p.exclusive);

  return (
    <>
      <section aria-labelledby="exclusive-title" className="denim relative overflow-hidden pt-32">
        <div className="relative mx-auto flex max-w-7xl flex-col items-start gap-8 px-4 pb-24 pt-8 md:px-8">
          <p className="caption-3 flex items-center gap-2 font-mono uppercase tracking-widest text-faded">
            <span aria-hidden className="size-2 rounded-full bg-dot" />
            {copy.eyebrow}
          </p>
          <Wordmark dot="red" className="label-tag patch heading-3 md:heading-1 px-6 py-3 md:px-10 md:py-5" />
          <h1 id="exclusive-title" className="heading-4 md:heading-2 max-w-[680px] text-cotton">
            {copy.title}
          </h1>
          <p className="body-3 md:body-7 max-w-[560px] text-faded">{copy.intro}</p>
          <ul className="flex flex-wrap gap-2">
            {copy.rules.map((r) => (
              <li
                key={r}
                className="caption-4 flex items-center gap-2 rounded-sm border border-faded/30 py-1 pl-2 pr-3 font-mono uppercase tracking-wide text-cotton"
              >
                <span aria-hidden className="size-2 rounded-full bg-dot" />
                {r}
              </li>
            ))}
          </ul>
        </div>
        <Selvedge />
      </section>

      <section aria-labelledby="pieces-title" className="px-4 py-24 md:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-8">
          {pieces.length > 0 ? (
            <>
              <h2 id="pieces-title" className="heading-4 md:heading-3">
                {copy.piecesTitle}
              </h2>
              <Reveal>
                <ProductGrid products={pieces} idPrefix="exclusive" />
              </Reveal>
            </>
          ) : (
            <div className="flex flex-col items-start gap-3 rounded-lg border border-dashed border-line bg-surface p-8 md:p-16">
              <h2 id="pieces-title" className="heading-5 md:heading-4">
                {copy.emptyTitle}
              </h2>
              <p className="body-3 max-w-md text-muted">{copy.emptyText}</p>
            </div>
          )}

          <Reveal className="denim stitched-lg rounded-lg p-8 md:p-12">
            <Newsletter label={copy.signup} className="flex max-w-md flex-col gap-3" />
          </Reveal>
        </div>
      </section>
    </>
  );
}
