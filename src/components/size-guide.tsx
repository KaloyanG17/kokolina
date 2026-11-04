"use client";

import { useRef } from "react";
import { Ruler, X } from "@phosphor-icons/react";
import { usesWaistSizes } from "@/data/products";
import { letterChart, waistChart } from "@/data/size-guide";
import { useT } from "@/i18n/client";

/** "Size guide" link beside the size picker, opening a measurements table for this piece's sizes. */
export function SizeGuide({ sizes, hemmed }: { sizes: string[]; hemmed: boolean }) {
  const { product } = useT();
  const g = product.guide;
  const dialog = useRef<HTMLDialogElement>(null);
  const waist = usesWaistSizes(sizes);
  const rows = sizes.filter((s) => (waist ? waistChart[s] : letterChart[s]));
  if (!rows.length) return null;

  const th = "caption-1 border-b border-line p-2 text-left font-mono uppercase tracking-wide text-muted";
  const td = "body-6 border-b border-dashed border-line p-2 font-mono tabular-nums";

  return (
    <>
      <button
        type="button"
        onClick={() => dialog.current?.showModal()}
        className="caption-1 focus-ring inline-flex items-center gap-1 rounded text-muted underline underline-offset-4 transition-colors duration-300 ease-brand hover:text-fg"
      >
        <Ruler size={14} aria-hidden />
        {g.open}
      </button>
      <dialog
        ref={dialog}
        aria-labelledby="size-guide-title"
        // Clicking the dimmed backdrop closes it
        onClick={(e) => e.target === e.currentTarget && e.currentTarget.close()}
        className="size-guide m-auto w-[min(100%-2rem,36rem)] max-h-[min(100dvh-2rem,48rem)] rounded-lg border border-line bg-base p-0 text-fg"
      >
        <div className="flex flex-col gap-6 p-6">
          <div className="flex items-start justify-between gap-4">
            <h2 id="size-guide-title" className="heading-6">
              {g.title}
            </h2>
            <button
              type="button"
              onClick={() => dialog.current?.close()}
              aria-label={g.close}
              className="focus-ring -m-2 rounded p-2 text-muted transition-colors duration-300 ease-brand hover:text-fg"
            >
              <X size={20} aria-hidden />
            </button>
          </div>
          <p className="body-6 text-muted">{g.intro}</p>
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th scope="col" className={th}>{g.size}</th>
                {!waist && <th scope="col" className={th}>{g.chest}</th>}
                <th scope="col" className={th}>{g.waist}</th>
                <th scope="col" className={th}>{g.hip}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((s) => {
                const m: { chest?: string; waist: string; hip: string } = waist ? waistChart[s] : letterChart[s];
                return (
                  <tr key={s}>
                    <th scope="row" className={`${td} text-left font-semibold`}>
                      {s}
                      {waist && <span className="caption-5 font-normal text-muted"> {g.inches}</span>}
                    </th>
                    {!waist && <td className={td}>{m.chest}</td>}
                    <td className={td}>{m.waist}</td>
                    <td className={td}>{m.hip}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="flex flex-col gap-2">
            <h3 className="title-3">{g.howTitle}</h3>
            <ul className="flex flex-col gap-1">
              {/* Waist, hip, chest, inside leg: chest only for letter sizes, inside leg only for hemmed pieces */}
              {g.how.filter((_, i) => (i === 2 ? !waist : i === 3 ? hemmed : true)).map((line) => (
                <li key={line} className="body-6 text-muted">{line}</li>
              ))}
            </ul>
          </div>
          {hemmed && <p className="body-6 rounded-md border border-dashed border-thread p-3">{g.hem}</p>}
          <p className="caption-2 text-muted">{g.fit}</p>
        </div>
      </dialog>
    </>
  );
}
