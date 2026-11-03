import Link from "next/link";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";

export function LegalPage({
  title,
  sections,
}: {
  title: string;
  sections: { heading: string; body: string }[];
}) {
  return (
    <article className="px-4 pb-24 pt-24 md:px-8">
      <div className="mx-auto flex max-w-2xl flex-col gap-8 pt-12">
        <Link
          href="/"
          className="caption-1 focus-ring inline-flex w-fit items-center gap-2 rounded text-muted transition-colors duration-300 ease-brand hover:text-fg"
        >
          <ArrowLeft size={16} aria-hidden />
          Back to the shop
        </Link>
        <h1 className="heading-4 md:heading-3 text-hero-gradient">{title}</h1>
        <p className="body-6 rounded-md border border-line bg-surface p-4 text-muted">
          Draft outline. Replace every section with text reviewed for your business and
          jurisdiction before launch.
        </p>
        {sections.map((s) => (
          <section key={s.heading} className="flex flex-col gap-2">
            <h2 className="heading-6">{s.heading}</h2>
            <p className="body-3 text-muted">{s.body}</p>
          </section>
        ))}
      </div>
    </article>
  );
}
