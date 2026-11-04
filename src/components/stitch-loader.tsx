"use client";

import { useEffect, useState } from "react";
import { useT } from "@/i18n/client";
import { Wordmark } from "./wordmark";

const DASHES = [40, 92, 144, 196, 248];
const DASH_W = 36;
const CYCLE = 2.6; // seconds
const DRAW_END = 0.78; // share of the cycle spent sewing

/**
 * Keyframes are generated so each dash is laid exactly while the needle
 * passes over it. Only transform and opacity animate.
 */
function keyframes() {
  const start = DASHES[0];
  const end = DASHES[DASHES.length - 1] + DASH_W;
  const at = (x: number) => ((x - start) / (end - start)) * DRAW_END * 100;

  let css = `
  @keyframes stitch-needle {
    0% { transform: translate(${start}px, 0) rotate(-14deg); opacity: 0; }
    4% { opacity: 1; }
    ${DASHES.map((x) => `${at(x + DASH_W / 2).toFixed(2)}% { transform: translate(${x + DASH_W / 2}px, -3px) rotate(-18deg); }`).join("\n")}
    ${(DRAW_END * 100).toFixed(2)}% { transform: translate(${end}px, 0) rotate(-14deg); opacity: 1; }
    92%, 100% { transform: translate(${end + 24}px, -10px) rotate(-14deg); opacity: 0; }
  }`;
  DASHES.forEach((x, i) => {
    const a = at(x).toFixed(2);
    const b = at(x + DASH_W).toFixed(2);
    css += `
  @keyframes stitch-dash-${i} {
    0%, ${a}% { transform: scaleX(0); opacity: 1; }
    ${b}%, 88% { transform: scaleX(1); opacity: 1; }
    96%, 100% { transform: scaleX(1); opacity: 0; }
  }`;
  });
  return css;
}

const KEYFRAMES = keyframes();

export function StitchLoader({ className = "", label }: { className?: string; label?: string }) {
  const { loader } = useT();
  return (
    <div role="status" aria-label={label ?? loader.loading} className={className}>
      <style>{KEYFRAMES}</style>
      <svg viewBox="0 0 330 120" className="h-auto w-full overflow-visible" aria-hidden>
        {/* Fabric seam holes the thread follows */}
        {DASHES.map((x) => (
          <g key={x} fill="#0b1226" fillOpacity="0.55">
            <circle cx={x - 2} cy="64" r="1.6" />
            <circle cx={x + DASH_W + 2} cy="64" r="1.6" />
          </g>
        ))}

        {/* Thread dashes, each with a soft shadow and a highlight */}
        {DASHES.map((x, i) => (
          <g
            key={x}
            className="stitch-anim"
            style={{
              transformOrigin: `${x}px 64px`,
              animation: `stitch-dash-${i} ${CYCLE}s cubic-bezier(0.22, 1, 0.36, 1) infinite`,
            }}
          >
            <rect x={x} y="63.5" width={DASH_W} height="6" rx="3" fill="#0b1226" fillOpacity="0.35" />
            <rect x={x} y="61" width={DASH_W} height="6" rx="3" fill="var(--color-thread)" />
            <path d={`M${x + 4} 62.6 L${x + DASH_W - 6} 62.6`} stroke="#f6c58a" strokeWidth="1.2" strokeLinecap="round" />
            <path
              d={`M${x + 6} 66 L${x + 10} 62 M${x + 14} 66 L${x + 18} 62 M${x + 22} 66 L${x + 26} 62`}
              stroke="#a8641c"
              strokeWidth="0.8"
              strokeOpacity="0.6"
            />
          </g>
        ))}

        {/* Needle with its thread, tip at the origin */}
        <g
          className="stitch-anim motion-reduce:hidden"
          style={{ animation: `stitch-needle ${CYCLE}s cubic-bezier(0.45, 0, 0.25, 1) infinite` }}
        >
          <g transform="translate(0 64)">
            <ellipse cx="-30" cy="16" rx="40" ry="3" fill="#050a18" fillOpacity="0.35" />
            <path
              d="M-60 -10 C-74 -34 -40 -40 -22 -18 C-14 -8 -8 -2 -2 0"
              fill="none"
              stroke="var(--color-thread)"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <path d="M-76 -2.8 L-10 -1.5 L0 0 L-10 1.5 L-76 2.8 Q-81 0 -76 -2.8 Z" fill="#cfd5e2" stroke="#7d8597" strokeWidth="0.6" />
            <path d="M-72 -1.3 L-12 -0.6" stroke="#ffffff" strokeWidth="0.9" strokeLinecap="round" />
            <ellipse cx="-66" cy="0" rx="5" ry="1" fill="#0b1226" />
          </g>
        </g>
      </svg>
    </div>
  );
}

/**
 * Full screen loader shown on the first page load of a session. Stays at
 * least one stitch cycle so the animation reads, then lifts away.
 */
export function LoadingScreen() {
  const { loader } = useT();
  const [phase, setPhase] = useState<"show" | "leaving" | "gone">("show");

  useEffect(() => {
    // Already seen this session: no intro, start the hero straight away
    if (document.documentElement.dataset.intro === "seen") {
      (window as Window & { __kokolinaLoaded?: boolean }).__kokolinaLoaded = true;
      window.dispatchEvent(new Event("kokolina:loaded"));
      setPhase("gone");
      return;
    }
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const minTime = new Promise((r) => setTimeout(r, reduce ? 500 : CYCLE * 1000));
    const loaded = new Promise((r) =>
      document.readyState === "complete" ? r(null) : window.addEventListener("load", () => r(null), { once: true }),
    );
    let t: ReturnType<typeof setTimeout>;
    Promise.all([minTime, loaded]).then(() => {
      try {
        sessionStorage.setItem("kokolina-intro", "1");
      } catch {
        // Storage blocked: the intro will show again next load
      }
      setPhase("leaving");
      // Lets the hero start sewing as the loader lifts
      (window as Window & { __kokolinaLoaded?: boolean }).__kokolinaLoaded = true;
      window.dispatchEvent(new Event("kokolina:loaded"));
      t = setTimeout(() => setPhase("gone"), 700);
    });
    return () => clearTimeout(t);
  }, []);

  if (phase === "gone") return null;

  return (
    <div
      id="loading-screen"
      aria-busy={phase === "show"}
      className={`denim fixed inset-0 z-[200] flex flex-col items-center justify-center gap-6 px-6 transition-[opacity,translate] duration-700 ease-brand ${
        phase === "leaving" ? "pointer-events-none -translate-y-8 opacity-0" : "opacity-100"
      }`}
    >
      <p className="label-tag patch title-2 px-6"><Wordmark /></p>
      <StitchLoader label={loader.loading} className="w-full max-w-sm" />
      <p className="caption-4 font-mono uppercase tracking-widest text-faded">{loader.stitching}</p>
    </div>
  );
}
