"use client";

import { useEffect, useRef, useState } from "react";
import { site } from "@/data/site";

/**
 * Engraved close-up of the back of a pair of jeans: waistband, belt loops,
 * a woven label, the yoke and a back pocket with a printed slogan.
 *
 * Once the loading screen lifts, a needle sews every seam in order. Each
 * seam is a pair of copper stitch lines revealed by a mask whose stroke is
 * drawn along the same path the needle follows (SMIL, so they stay in sync).
 */

type Seam = {
  /** Path the needle follows and the mask reveals along */
  guide: string;
  /** Visible stitch lines (usually a double needle pair) */
  lines: string[];
  dur: number;
};

const SEAMS: Seam[] = [
  {
    guide: "M0 82 C200 72 600 72 800 88",
    lines: ["M0 80 C200 70 600 70 800 86", "M0 88 C200 78 600 78 800 94"],
    dur: 1.3,
  },
  {
    guide: "M800 146 C600 130 200 130 0 140",
    lines: ["M800 144 C600 128 200 128 0 138"],
    dur: 1.2,
  },
  {
    guide: "M262 44 H508 V172 H262 Z",
    lines: ["M262 44 H508 V172 H262 Z"],
    dur: 1.5,
  },
  {
    guide: "M0 296 C250 266 550 226 718 204",
    lines: ["M0 292 C250 262 550 222 718 200", "M0 302 C250 272 550 232 719 210"],
    dur: 1.3,
  },
  {
    guide: "M140 352 L590 322",
    lines: ["M140 350 L590 320", "M141 359 L591 329"],
    dur: 0.9,
  },
  {
    guide: "M146 372 L204 660 L385 748 L566 632 L586 340",
    lines: ["M144 370 L202 660 L385 748 L566 632 L586 340", "M153 371 L211 654 L385 738 L558 626 L577 341"],
    dur: 2.2,
  },
  {
    guide: "M734 170 C744 400 774 650 814 900",
    lines: ["M730 170 C740 400 770 650 810 900", "M739 170 C749 400 779 650 819 900"],
    dur: 1.3,
  },
];

const POCKET = "M130 335 L600 305 L578 640 L385 762 L190 668 Z";
const STITCH = { stroke: "var(--color-thread)", strokeWidth: 2.4, strokeDasharray: "7 5", fill: "none" } as const;

function barTack(x: number, y: number, angle = 0) {
  return (
    <path
      key={`${x}-${y}`}
      d={`M${x} ${y} l3 -5 l3 10 l3 -10 l3 10 l3 -10 l3 10 l3 -5`}
      transform={`rotate(${angle} ${x} ${y})`}
      fill="none"
      stroke="var(--color-thread)"
      strokeWidth="1.6"
      strokeLinejoin="round"
    />
  );
}

function seamStitches(s: Seam, i: number) {
  return (
    <g key={i} mask={`url(#db-seam-${i})`}>
      {s.lines.map((d) => (
        <path key={d} d={d} {...STITCH} />
      ))}
    </g>
  );
}

export function DenimBack({ className = "" }: { className?: string }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [mode, setMode] = useState<"animated" | "static">("animated");

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setMode("static");
      return;
    }
    // Wait a frame so the SVG timeline is running before the first seam begins
    const start = () =>
      requestAnimationFrame(() => svgRef.current?.querySelector<SVGAnimationElement>("#sew0")?.beginElement());
    const w = window as Window & { __kokolinaLoaded?: boolean };
    if (w.__kokolinaLoaded) {
      start();
      return;
    }
    window.addEventListener("kokolina:loaded", start, { once: true });
    return () => window.removeEventListener("kokolina:loaded", start);
  }, []);

  const last = SEAMS.length - 1;

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 800 900"
      preserveAspectRatio="xMidYMid slice"
      role="img"
      aria-label={`Engraving of the back of a pair of ${site.brand} jeans: a black woven label on the waistband, belt loops, the yoke seam and a back pocket printed with the words worn in, with copper stitching being sewn along each seam`}
      className={`text-faded ${className}`}
    >
      <defs>
        <pattern id="db-speckle" width="9" height="7" patternUnits="userSpaceOnUse">
          <rect width="9" height="7" fill="white" />
          <circle cx="2" cy="2" r="0.9" fill="black" />
          <circle cx="7" cy="5" r="0.6" fill="black" />
        </pattern>
        <mask id="db-print" maskUnits="userSpaceOnUse" x="0" y="0" width="800" height="900">
          <rect width="800" height="900" fill="url(#db-speckle)" />
        </mask>
        <pattern id="db-weave" width="4" height="3" patternUnits="userSpaceOnUse">
          <line x1="0" x2="4" y1="1.5" y2="1.5" stroke="#ffffff" strokeOpacity="0.12" strokeWidth="0.8" />
        </pattern>
        <clipPath id="db-pocket">
          <path d={POCKET} />
        </clipPath>
        {SEAMS.map((s, i) => (
          <mask key={i} id={`db-seam-${i}`} maskUnits="userSpaceOnUse" x="-20" y="-20" width="860" height="940">
            <path
              d={s.guide}
              pathLength={1}
              fill="none"
              stroke="white"
              strokeWidth="30"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="1 1"
              strokeDashoffset={mode === "static" ? 0 : 1}
            >
              {mode !== "static" && (
                <animate
                  id={`sew${i}`}
                  attributeName="stroke-dashoffset"
                  from="1"
                  to="0"
                  dur={`${s.dur}s`}
                  begin={i === 0 ? "indefinite" : `sew${i - 1}.end`}
                  fill="freeze"
                />
              )}
            </path>
          </mask>
        ))}
      </defs>

      <g stroke="currentColor" strokeLinejoin="round" strokeLinecap="round">
        {/* Cloth: twill over the whole frame, darker past the side seam */}
        <rect width="800" height="900" className="fill-indigo" stroke="none" />
        <rect width="800" height="900" fill="url(#engl-twill)" fillOpacity="0.35" stroke="none" />
        <path d="M722 160 C732 400 762 650 802 900 L800 0 L722 0 Z" fill="#0b1226" fillOpacity="0.3" stroke="none" />
        <path d="M0 640 C80 700 120 820 100 900 L0 900 Z" fill="url(#engl-cross)" fillOpacity="0.5" stroke="none" />

        {/* Fades and whiskers worn into the cloth */}
        <g stroke="#f3efe6" strokeWidth="3.5" strokeOpacity="0.3" fill="none">
          <path d="M30 820 C110 796 190 800 250 826" />
          <path d="M40 852 C130 830 210 836 280 862" />
          <path d="M620 760 C660 740 700 742 740 760" />
          <path d="M600 800 C650 780 700 784 750 804" />
        </g>

        {/* Yoke shadow and seam */}
        <path d="M0 296 C250 266 550 226 718 204 L718 216 C550 238 250 278 0 308 Z" fill="#0b1226" fillOpacity="0.4" stroke="none" />
        <path d="M0 296 C250 266 550 226 718 204" fill="none" strokeWidth="1.6" />

        {/* Back pocket with its drop shadow */}
        <path d={POCKET} transform="translate(9 12)" fill="#0b1226" fillOpacity="0.5" stroke="none" />
        <path d={POCKET} className="fill-indigo" strokeWidth="1.8" />
        <g clipPath="url(#db-pocket)" stroke="none">
          <rect width="800" height="900" fill="url(#engl-twill)" fillOpacity="0.5" />
          <rect x="520" width="120" height="900" fill="url(#engl-cross)" fillOpacity="0.55" />
          <path d="M130 335 L600 305 L598 336 L132 366 Z" fill="url(#engl-cross)" fillOpacity="0.5" />
        </g>
        <path d={POCKET} fill="none" strokeWidth="1.8" />
        <path d="M132 366 L598 336" fill="none" strokeWidth="1.2" />

        {/* Printed slogan, slightly cracked like an old screen print */}
        <g transform="rotate(-3.8 380 500)" mask="url(#db-print)">
          <text
            x="380"
            y="486"
            textAnchor="middle"
            fontSize="78"
            fontWeight="700"
            letterSpacing="2"
            fill="#f3efe6"
            stroke="none"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            &quot;WORN
          </text>
          <text
            x="380"
            y="566"
            textAnchor="middle"
            fontSize="78"
            fontWeight="700"
            letterSpacing="2"
            fill="#f3efe6"
            stroke="none"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            IN&quot;
          </text>
        </g>

        {/* Waistband */}
        <path d="M0 150 C200 140 600 140 800 156 L800 174 C600 158 200 158 0 168 Z" fill="#0b1226" fillOpacity="0.45" stroke="none" />
        <path d="M0 64 C200 54 600 54 800 70 L800 156 C600 140 200 140 0 150 Z" className="fill-indigo" strokeWidth="1.6" />
        <path d="M0 64 C200 54 600 54 800 70 L800 156 C600 140 200 140 0 150 Z" fill="url(#engl-cross)" fillOpacity="0.55" stroke="none" />

        {/* Belt loops */}
        {[56, 642].map((x) => (
          <g key={x}>
            <rect x={x} y="44" width="40" height="136" rx="3" className="fill-indigo" strokeWidth="1.6" />
            <rect x={x} y="44" width="40" height="136" rx="3" fill="url(#engl-twill)" fillOpacity="0.45" stroke="none" />
            <rect x={x + 30} y="44" width="10" height="136" fill="#0b1226" fillOpacity="0.35" stroke="none" />
            {barTack(x + 8, 58)}
            {barTack(x + 8, 166)}
          </g>
        ))}

        {/* Bar tacks at the pocket corners */}
        {barTack(132, 378, 80)}
        {barTack(584, 348, 95)}

        {/* Side seam */}
        <path d="M722 160 C732 400 762 650 802 900" fill="none" strokeWidth="1.6" />
      </g>

      {/* Copper stitching, revealed seam by seam. Waistband seams sit under the label. */}
      {SEAMS.slice(0, 2).map((s, i) => seamStitches(s, i))}
      {/* Woven label, sewn on in the animation */}
      <g>
        <rect x="250" y="32" width="270" height="152" fill="#0b0b0b" fillOpacity="0.35" stroke="none" transform="translate(6 7)" />
        <rect x="250" y="32" width="270" height="152" fill="#141414" stroke="none" />
        <rect x="250" y="32" width="270" height="152" fill="url(#db-weave)" stroke="none" />
        <text
          x="385"
          y="112"
          textAnchor="middle"
          fontSize="38"
          fontWeight="600"
          letterSpacing="3"
          fill="#f3efe6"
          stroke="none"
          style={{ fontFamily: "var(--font-sans)" }}
        >
          &quot;{site.brand.toUpperCase()}&quot;
        </text>
        <text
          x="385"
          y="146"
          textAnchor="middle"
          fontSize="11"
          letterSpacing="2"
          fill="#f3efe6"
          fillOpacity="0.75"
          stroke="none"
          style={{ fontFamily: "var(--font-geist-mono)" }}
        >
          LOT 001 · 14 OZ SELVEDGE
        </text>
      </g>
      {SEAMS.slice(2).map((s, i) => seamStitches(s, i + 2))}

      {/* The needle, carried along each seam in turn */}
      {mode !== "static" && (
        <g opacity="0">
          <set attributeName="opacity" to="1" begin="sew0.begin" />
          <animate attributeName="opacity" to="0" dur="0.6s" begin={`sew${last}.end`} fill="freeze" />
          {SEAMS.map((s, i) => (
            <animateMotion
              key={i}
              path={s.guide}
              dur={`${s.dur}s`}
              begin={`sew${i}.begin`}
              rotate="auto"
              fill="freeze"
            />
          ))}
          <g transform="scale(1.6)">
            <ellipse cx="-30" cy="16" rx="40" ry="3" fill="#050a18" fillOpacity="0.3" />
            <path
              d="M-60 -10 C-74 -34 -40 -40 -22 -18 C-14 -8 -8 -2 -2 0"
              fill="none"
              stroke="var(--color-thread)"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path d="M-76 -2.8 L-10 -1.5 L0 0 L-10 1.5 L-76 2.8 Q-81 0 -76 -2.8 Z" fill="#cfd5e2" stroke="#5c6475" strokeWidth="0.6" />
            <path d="M-72 -1.3 L-12 -0.6" stroke="#ffffff" strokeWidth="0.9" strokeLinecap="round" />
            <ellipse cx="-66" cy="0" rx="5" ry="1" fill="#0b1226" />
          </g>
        </g>
      )}
    </svg>
  );
}
