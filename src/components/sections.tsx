import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Drop, Needle, Plus, Quotes, Ruler, Stack } from "@phosphor-icons/react/dist/ssr";
import { faqs, press, site, testimonials } from "@/data/site";
import { AtelierScene } from "./product-art";
import { Reveal } from "./reveal";

export function SectionHeader({
  id,
  index,
  title,
  intro,
  tone = "light",
}: {
  id: string;
  index: string;
  title: string;
  intro?: string;
  tone?: "light" | "dark";
}) {
  return (
    <Reveal className="flex flex-col gap-3">
      <p className={`caption-3 font-mono uppercase tracking-widest ${tone === "dark" ? "text-thread" : "text-ink"}`}>
        No. {index}
      </p>
      <h2 id={id} className="heading-4 md:heading-2 max-w-[680px]">
        {title}
      </h2>
      {intro && <p className={`body-3 max-w-xl ${tone === "dark" ? "text-faded" : "text-muted"}`}>{intro}</p>}
    </Reveal>
  );
}

const benefits = [
  {
    icon: Stack,
    title: "Selvedge cloth",
    text: `Woven on narrow shuttle looms at ${site.mill}, with the clean edge you see when you turn up a cuff.`,
  },
  {
    icon: Needle,
    title: "Stitched by hand",
    text: "Chain stitched hems, bar tacks and copper rivets at every stress point, finished one pair at a time.",
  },
  {
    icon: Drop,
    title: "Real indigo",
    text: "Rope dyed so the core of each yarn stays white. Your creases fade into a record of how you wear them.",
  },
  {
    icon: Ruler,
    title: "Help with fit",
    text: "Fit notes on every piece and a person who answers sizing questions, including how much raw denim will give.",
  },
];

export function Craft({ campaign }: { campaign?: { url?: string; alt: string } }) {
  return (
    <section aria-labelledby="craft-title" id="craft" className="px-4 py-24 md:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-12">
        <SectionHeader
          id="craft-title"
          index="02"
          title="Made slowly, seam by seam"
          intro={`Each style is cut in runs of ${site.runSize} pieces. When a lot is gone, it is gone.`}
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

const steps = [
  {
    title: "Choose your lot",
    text: "Pick a size using the fit notes. Unsure how raw denim will give? Write to us before you order.",
  },
  {
    title: "We pack it in the studio",
    text: `Your order is checked, folded and wrapped, then leaves within ${site.shippingDays}.`,
  },
  {
    title: "Wear it in, or send it back",
    text: `If it is not right, return it unworn within ${site.returnWindow} for a full refund.`,
  },
];

export function Ordering() {
  return (
    <section aria-labelledby="ordering-title" id="ordering" className="px-4 py-24 md:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-12">
        <SectionHeader id="ordering-title" index="03" title="How ordering works" />
        <ol className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {steps.map((s, i) => (
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

export function Proof() {
  return (
    <section aria-labelledby="proof-title" className="px-4 py-24 md:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-12">
        <SectionHeader id="proof-title" index="04" title="Worn in and written about" />
        <ul className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <li key={i}>
              <Reveal className="stitched flex h-full flex-col gap-6 rounded-md border border-line bg-surface p-6 [--stitch:var(--color-line)]">
                <Quotes size={24} weight="fill" className="text-thread" aria-hidden />
                <blockquote className="body-2 flex-1">{t.quote}</blockquote>
                <p className="caption-4 font-mono uppercase tracking-wider text-muted">
                  {t.name}, {t.detail}
                </p>
              </Reveal>
            </li>
          ))}
        </ul>
        <Reveal className="flex flex-col gap-4">
          <p className="caption-3 font-mono uppercase tracking-widest text-muted">Press</p>
          <ul className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {press.map((p, i) => (
              <li
                key={i}
                className="title-3 flex h-20 items-center justify-center rounded-md border border-dashed border-line text-muted"
              >
                {p}
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}

export function Faq() {
  return (
    <section aria-labelledby="faq-title" id="faq" className="px-4 py-24 md:px-8">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 lg:grid-cols-[1fr_2fr]">
        <SectionHeader
          id="faq-title"
          index="05"
          title="Questions, answered"
          intro="Anything else? Write to the studio and a person will answer."
        />
        <Reveal>
          <ul className="flex flex-col gap-2">
            {faqs.map((f) => (
              <li key={f.q}>
                <details className="group rounded-md border border-line bg-surface transition-colors duration-300 ease-brand open:border-ink/30 open:bg-surface-2">
                  <summary className="title-3 focus-ring flex cursor-pointer list-none items-center justify-between gap-4 rounded-md p-6 [&::-webkit-details-marker]:hidden">
                    {f.q}
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-line transition-[transform,background-color] duration-500 ease-brand group-open:rotate-45 group-open:bg-ink-deep group-open:text-thread">
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

export function FinalCta() {
  return (
    <section aria-labelledby="final-title" className="px-4 py-24 md:px-8">
      <Reveal className="denim stitched-lg mx-auto flex max-w-7xl flex-col items-start gap-6 overflow-hidden rounded-lg p-8 md:p-24">
        <p className="caption-3 font-mono uppercase tracking-widest text-thread">No. 06 · Final fitting</p>
        <h2 id="final-title" className="heading-4 md:heading-2 max-w-[680px]">
          Find the pair
          <br />
          you will wear in
        </h2>
        <p className="body-3 max-w-xl text-faded">
          Every lot is cut in small numbers. Free returns within {site.returnWindow} if the fit is not right.
        </p>
        <Link
          href="/shop"
          className="btn-primary button-lg bg-cotton px-4 py-3 text-ink-deep hover:bg-cotton-2"
        >
          &quot;Shop the denim&quot;
          <ArrowRight size={18} weight="bold" aria-hidden />
        </Link>
      </Reveal>
    </section>
  );
}
