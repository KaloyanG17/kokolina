import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, EnvelopeSimple } from "@phosphor-icons/react/dist/ssr";
import { site } from "@/data/site";
import { withEmailLink } from "@/components/legal-page";
import { PrintButton } from "@/components/print-button";
import { getLocale, getT } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { returns } = await getT();
  return { title: returns.metaTitle, description: returns.metaDescription };
}

export default async function ReturnsPage() {
  const [t, locale] = await Promise.all([getT(), getLocale()]);
  const r = t.returns;
  const email = site.contactEmail;
  // Who the withdrawal is addressed to: the registered trader once known
  const seller = site.seller
    ? `${site.seller.name}, ${site.seller.address}`
    : `${site.brand}, ${site.city[locale]}, ${locale === "bg" ? "България" : "Bulgaria"}`;
  const recipient = email ? `${seller}, ${email}` : seller;

  const mailto = email
    ? `mailto:${email}?subject=${encodeURIComponent(r.emailSubject)}&body=${encodeURIComponent(
        [`${r.formTo}: ${recipient}`, "", ...r.formLines.filter((_, i) => i !== 5).flatMap((line) => [line, "", ""])].join("\n"),
      )}`
    : null;

  return (
    <article className="px-4 pb-24 pt-24 md:px-8">
      <div className="mx-auto flex max-w-2xl flex-col gap-12 pt-12">
        <div className="flex flex-col gap-8 print:hidden">
          <Link
            href="/"
            className="caption-1 focus-ring inline-flex w-fit items-center gap-2 rounded text-muted transition-colors duration-300 ease-brand hover:text-fg"
          >
            <ArrowLeft size={16} aria-hidden />
            {t.legal.back}
          </Link>
          <div className="flex flex-col gap-3">
            <p className="caption-3 font-mono uppercase tracking-widest text-ink">{r.eyebrow}</p>
            <h1 className="heading-4 md:heading-3 text-hero-gradient">{r.title}</h1>
            <p className="body-3 text-muted">{r.intro}</p>
          </div>

          <section aria-labelledby="steps-title" className="flex flex-col gap-4">
            <h2 id="steps-title" className="heading-6">
              {r.stepsTitle}
            </h2>
            <ol className="flex flex-col gap-4">
              {r.steps.map((step, i) => (
                <li key={i} className="flex gap-4">
                  <span
                    aria-hidden
                    className="caption-3 flex size-8 shrink-0 items-center justify-center rounded-full border border-dashed border-thread font-mono text-ink"
                  >
                    {i + 1}
                  </span>
                  <p className="body-5 text-muted">{withEmailLink(step)}</p>
                </li>
              ))}
            </ol>
            <p className="body-6 text-muted">{r.hemNote}</p>
          </section>

          <section aria-labelledby="faulty-title" className="flex flex-col gap-2">
            <h2 id="faulty-title" className="heading-6">
              {r.faultyTitle}
            </h2>
            <p className="body-5 text-muted">{r.faulty}</p>
          </section>
        </div>

        {/* The model form from the Consumer Protection Act. Printing shows only this card */}
        <section
          aria-labelledby="form-title"
          data-print-only
          className="stitched flex flex-col gap-6 rounded-md border border-line bg-surface p-6 [--stitch:var(--color-line)] md:p-8 print:border-black print:bg-white print:text-black"
        >
          <div className="relative z-[2] flex flex-col gap-2">
            <h2 id="form-title" className="heading-6">
              {r.formTitle}
            </h2>
            <p className="body-6 text-muted print:text-black">{r.formIntro}</p>
          </div>
          <dl className="relative z-[2] flex flex-col gap-5">
            <div className="flex flex-col gap-1">
              <dt className="title-4">{r.formTo}</dt>
              <dd className="body-6 text-muted print:text-black">{recipient}</dd>
            </div>
            {r.formLines.map((line, i) => (
              <div key={i} className="flex flex-col gap-1">
                <dt className="body-6">{line}</dt>
                <dd aria-hidden className={`border-b border-dashed border-line print:border-black ${i === 0 ? "h-16" : "h-8"}`} />
              </div>
            ))}
          </dl>
          <div className="relative z-[2] flex flex-wrap gap-2 print:hidden">
            <PrintButton label={r.print} />
            {mailto && (
              <a href={mailto} className="btn-secondary button-sm">
                <EnvelopeSimple size={16} weight="bold" aria-hidden />
                {r.emailForm}
              </a>
            )}
          </div>
        </section>
      </div>
    </article>
  );
}
