import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Drop, Needle, Plus, Ruler, Stack } from "@phosphor-icons/react/dist/ssr";
import { site } from "@/data/site";
import { getT } from "@/i18n/server";
import { AtelierScene, Garment } from "./product-art";
import { Reveal } from "./reveal";

export async function SectionHeader({
  id,
  index,
  title,
  intro,
  tone = "light",
}: {
  id: string;
  index: string;
  title: string;
  intro?: React.ReactNode;
  tone?: "light" | "dark";
}) {
  const t = await getT();
  return (
    <Reveal className="flex flex-col gap-3">
      <p className={`caption-3 font-mono uppercase tracking-widest ${tone === "dark" ? "text-thread" : "text-ink"}`}>
        {t.section.number} {index}
      </p>
      <h2 id={id} className="heading-4 md:heading-2 max-w-[680px]">
        {title}
      </h2>
      {intro && <p className={`body-3 max-w-xl ${tone === "dark" ? "text-faded" : "text-muted"}`}>{intro}</p>}
    </Reveal>
  );
}

const benefitIcons = [Stack, Needle, Drop, Ruler];

export async function Craft({ campaign }: { campaign?: { url?: string; alt: string } }) {
  const { craft } = await getT();
  const benefits = craft.benefits.map((b, i) => ({ ...b, icon: benefitIcons[i] }));
  return (
    <section aria-labelledby="craft-title" id="craft" className="px-4 py-24 md:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-12">
        <SectionHeader
          id="craft-title"
          index="02"
          title={craft.title}
          intro={craft.intro}
        />
        <Reveal className="overflow-hidden rounded-sm border border-line">
          {campaign?.url ? (
            <div className="relative aspect-[16/7] w-full">
              <Image src={campaign.url} alt={campaign.alt} fill sizes="(min-width: 1280px) 1216px, 100vw" className="object-cover" />
            </div>
          ) : (
            <AtelierScene className="block h-64 w-full sm:h-auto" />
          )}
        </Reveal>
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map(({ icon: Icon, title, text }) => (
            <li key={title}>
              <Reveal className="stitched flex h-full flex-col gap-6 rounded-md border border-line bg-surface p-6 [--stitch:var(--color-line)]">
                <div className="flex size-12 items-center justify-center rounded-full bg-ink-deep text-thread">
                  <Icon size={22} weight="duotone" aria-hidden />
                </div>
                <div className="flex flex-col gap-2">
                  <h3 className="title-2">{title}</h3>
                  <p className="body-6 text-muted">{text}</p>
                </div>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export async function Ordering() {
  const { ordering } = await getT();
  return (
    <section aria-labelledby="ordering-title" id="ordering" className="px-4 py-24 md:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-12">
        <SectionHeader id="ordering-title" index="03" title={ordering.title} />
        <ol className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {ordering.steps.map((s, i) => (
            <li key={s.title}>
              <Reveal className="stitched flex h-full flex-col gap-8 rounded-md border border-line bg-surface p-6 [--stitch:var(--color-line)]">
                <span className="heading-4 font-mono text-thread">0{i + 1}</span>
                <div className="flex flex-col gap-2">
                  <h3 className="title-2">{s.title}</h3>
                  <p className="body-6 text-muted">{s.text}</p>
                </div>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export async function Faq() {
  const { faq } = await getT();
  return (
    <section aria-labelledby="faq-title" id="faq" className="px-4 py-24 md:px-8">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 lg:grid-cols-[1fr_2fr]">
        {/* Stays beside the questions while they scroll past */}
        <div className="lg:sticky lg:top-28 lg:self-start">
          <SectionHeader
            id="faq-title"
            index="04"
            title={faq.title}
            intro={
              <>
                {faq.intro}
                {site.contactEmail && (
                  <>
                    {" "}
                    <a
                      href={`mailto:${site.contactEmail}`}
                      className="focus-ring rounded text-ink underline underline-offset-4 transition-colors duration-300 ease-brand hover:text-fg"
                    >
                      {site.contactEmail}
                    </a>
                  </>
                )}
              </>
            }
          />
        </div>
        <Reveal>
          <ul className="flex flex-col gap-2">
            {faq.items.map((f) => (
              <li key={f.q}>
                <details className="group rounded-md border border-line bg-surface transition-colors duration-300 ease-brand open:border-ink/30 open:bg-surface-2">
                  <summary className="title-3 focus-ring flex cursor-pointer list-none items-center justify-between gap-4 rounded-md p-6 [&::-webkit-details-marker]:hidden">
                    {f.q}
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-line transition-[rotate,background-color] duration-300 ease-brand group-open:rotate-45 group-open:bg-ink-deep group-open:text-thread">
                      <Plus size={14} aria-hidden />
                    </span>
                  </summary>
                  <p className="body-6 max-w-2xl px-6 pb-6 text-muted">{f.a}</p>
                </details>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}

export async function FinalCta() {
  const { finalCta, hero } = await getT();
  return (
    <section aria-labelledby="final-title" className="px-4 py-24 md:px-8">
      <Reveal className="denim stitched-lg mx-auto grid max-w-7xl items-center gap-12 overflow-hidden rounded-lg p-8 md:p-24 lg:grid-cols-[1fr_auto]">
        <div className="flex flex-col items-start gap-6">
        <p className="caption-3 font-mono uppercase tracking-widest text-thread">{finalCta.eyebrow}</p>
        <h2 id="final-title" className="heading-4 md:heading-2 max-w-[680px]">
          {finalCta.title[0]}
          <br />
          {finalCta.title[1]}
        </h2>
        <p className="body-3 max-w-xl text-faded">
          {finalCta.text}
        </p>
        <Link
          href="/shop"
          className="btn-primary button-lg bg-cotton px-4 py-3 text-ink-deep hover:bg-cotton-2"
        >
          {hero.cta}
          <ArrowRight size={18} weight="bold" aria-hidden />
        </Link>
        </div>
        {/* A pair of raw jeans waiting on the rail, in the engraved style of the shop */}
        <svg viewBox="0 0 240 320" aria-hidden className="hidden w-60 text-faded lg:block">
          <line x1="0" x2="240" y1="22" y2="22" stroke="currentColor" strokeWidth="2.5" />
          <line x1="0" x2="240" y1="28" y2="28" stroke="currentColor" strokeWidth="0.8" strokeOpacity="0.5" />
          <g transform="translate(20 18)">
            <Garment kind="jeans" wash="raw" id="final-cta-jeans" tone="light" />
          </g>
        </svg>
      </Reveal>
    </section>
  );
}
