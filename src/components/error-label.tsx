"use client";

import { StitchLoader } from "./stitch-loader";
import { Wordmark } from "./wordmark";

/**
 * Error screens as the leather patch on the back of a pair of jeans: sewn
 * onto denim in the middle of the page, with the loader's needle still
 * stitching along the bottom while the seam is mended.
 */
export function ErrorLabel({
  code,
  eyebrow,
  title,
  text,
  children,
}: {
  code: string;
  eyebrow: string;
  title: [string, string];
  text: string;
  /** Actions shown under the patch. */
  children: React.ReactNode;
}) {
  return (
    <section
      aria-labelledby="error-title"
      className="denim relative flex min-h-[100svh] flex-col items-center justify-center gap-8 overflow-hidden px-4 py-24"
    >
      <div className="patch-leather relative w-full max-w-md -rotate-1 rounded-lg px-8 pb-6 pt-8 text-center md:px-12">
        <div className="relative z-[2] flex flex-col items-center gap-3">
          <Wordmark className="label-tag patch title-4" />
          <p className="font-mono text-7xl font-semibold leading-none tracking-tight text-[#2b1a10] [text-shadow:0_1px_0_rgb(255_255_255/0.25)] md:text-8xl">
            {code}
          </p>
          <p className="caption-3 font-mono uppercase tracking-widest text-[#4a2f1d]">
            Lot {code} · {eyebrow}
          </p>
          <h1 id="error-title" className="heading-5 md:heading-4 text-[#2b1a10]">
            {title[0]}
            <br />
            {title[1]}
          </h1>
          <p className="body-6 max-w-xs text-[#4a2f1d]">{text}</p>
          <StitchLoader label={eyebrow} className="mt-1 w-64" />
        </div>
      </div>
      <div className="relative flex flex-wrap items-center justify-center gap-3">{children}</div>
    </section>
  );
}
