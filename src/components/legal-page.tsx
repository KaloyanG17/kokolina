import Link from "next/link";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import { site } from "@/data/site";
import { getT } from "@/i18n/server";

/** Turns the studio email inside a sentence into a link. */
function withEmailLink(text: string) {
  const email = site.contactEmail;
  if (!email || !text.includes(email)) return text;
  return text.split(email).flatMap((part, i) =>
    i === 0
      ? [part]
      : [
          <a
            key={i}
            href={`mailto:${email}`}
            className="focus-ring rounded text-ink underline underline-offset-4 transition-colors duration-300 ease-brand hover:text-fg"
          >
            {email}
          </a>,
          part,
        ],
  );
}

export async function LegalPage({ page }: { page: "privacy" | "terms" }) {
  const { legal } = await getT();
  const { title, sections } = legal[page];
  return (
    <article className="px-4 pb-24 pt-24 md:px-8">
      <div className="mx-auto flex max-w-2xl flex-col gap-8 pt-12">
        <Link
          href="/"
          className="caption-1 focus-ring inline-flex w-fit items-center gap-2 rounded text-muted transition-colors duration-300 ease-brand hover:text-fg"
        >
          <ArrowLeft size={16} aria-hidden />
          {legal.back}
        </Link>
        <div className="flex flex-col gap-2">
          <h1 className="heading-4 md:heading-3 text-hero-gradient">{title}</h1>
          <p className="caption-5 font-mono uppercase tracking-widest text-muted">{legal.updated}</p>
        </div>
        {/* The trader's identity, required by Bulgarian consumer law */}
        <section className="stitched flex flex-col gap-2 rounded-md border border-line bg-surface p-6 [--stitch:var(--color-line)]">
          <h2 className="title-2 relative z-[2]">{legal.seller}</h2>
          <p className="body-6 relative z-[2] text-muted">
            {withEmailLink(site.seller ? legal.sellerDetails(site.seller) : legal.sellerPending)}
          </p>
        </section>
        {sections.map((s) => (
          <section key={s.heading} className="flex flex-col gap-2">
            <h2 className="heading-6">{s.heading}</h2>
            <p className="body-3 text-muted">{withEmailLink(s.body)}</p>
          </section>
        ))}
      </div>
    </article>
  );
}
