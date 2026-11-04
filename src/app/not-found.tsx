import Link from "next/link";
import { getT } from "@/i18n/server";

export default async function NotFound() {
  const { notFound: copy } = await getT();
  return (
    <section className="flex min-h-[80vh] items-center px-4 pt-24 md:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col items-start gap-6">
        <p className="caption-3 uppercase tracking-widest text-muted">{copy.eyebrow}</p>
        <h1 className="heading-3 md:heading-1 text-hero-gradient max-w-[680px]">
          {copy.title[0]}
          <br />
          {copy.title[1]}
        </h1>
        <p className="body-3 max-w-md text-muted">
          {copy.text}
        </p>
        <Link href="/shop" className="btn-primary">
          {copy.cta}
        </Link>
      </div>
    </section>
  );
}
