import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { site } from "@/data/site";
import { DenimBack } from "./denim-back";
import { Selvedge } from "./selvedge";

const specs = ["14 oz selvedge", "Chain stitched hems", "Copper rivets"];

export function Hero() {
  return (
    <section aria-labelledby="hero-title" className="relative overflow-hidden">
      {/* Faint engraved hatching behind everything */}
      <svg aria-hidden className="absolute inset-0 h-full w-full">
        <rect width="100%" height="100%" fill="url(#eng-lines)" />
      </svg>

      <div className="relative px-4 pb-16 pt-24 md:px-8">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 pt-8 md:pt-12 lg:grid-cols-2 lg:gap-16">
          <div className="flex flex-col gap-6">
            <p className="caption-3 font-mono uppercase tracking-widest text-ink">
              &quot;Lot 2026&quot; · The selvedge collection
            </p>
            <h1 id="hero-title" className="heading-3 md:heading-1 lg:heading-2 text-hero-gradient max-w-[680px]">
              Raw denim, cut
              <br />
              and stitched by hand
            </h1>
            <p className="body-3 md:body-7 max-w-[560px] text-muted">
              {site.brand} cuts selvedge denim and workwear in small numbered runs in {site.city}.
              Every seam is finished by hand, so each piece wears in to fit you.
            </p>
            <div className="flex flex-col items-start gap-4 pt-2 sm:flex-row sm:items-center sm:gap-6">
              <Link href="/shop" className="btn-primary button-lg px-6 py-3">
                &quot;Shop the denim&quot;
                <ArrowRight size={18} weight="bold" aria-hidden />
              </Link>
              <p className="caption-2 text-muted">As seen in {site.pressMention}</p>
            </div>
            <ul className="flex flex-wrap gap-2 pt-2" aria-label="How it is made">
              {specs.map((s) => (
                <li
                  key={s}
                  className="caption-4 flex items-center gap-2 rounded-sm border border-line bg-surface py-1 pl-2 pr-3 font-mono uppercase tracking-wide text-ink"
                >
                  <span aria-hidden className="size-2 rounded-full border border-ink/50 bg-base" />
                  {s}
                </li>
              ))}
            </ul>
          </div>

          <figure className="flex flex-col gap-3">
            <div className="overflow-hidden rounded-sm border border-line bg-surface shadow-[8px_8px_0_0_var(--color-surface-3)]">
              <DenimBack className="block aspect-[8/9] w-full" />
            </div>
            <figcaption className="caption-5 flex justify-between font-mono uppercase tracking-widest text-muted">
              <span>Fig. 01 · Back pocket, Lot 001</span>
              <span aria-hidden>&quot;Sewn by hand&quot;</span>
            </figcaption>
          </figure>
        </div>
      </div>

      <Selvedge />
    </section>
  );
}
