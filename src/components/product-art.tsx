/**
 * Engraved denim illustrations.
 *
 * Two tones share the same drawings:
 *  - "ink":   indigo hatching on cotton paper (light sections)
 *  - "light": pale hatching on raw indigo (dark denim sections)
 * Hatching patterns live once in <EngraveDefs /> (root layout); every drawing
 * references them by id. Topstitching is always copper thread.
 */

export type GarmentKind =
  | "jeans"
  | "trucker"
  | "chore"
  | "western"
  | "dress"
  | "skirt"
  | "overalls"
  | "sweat";

export type Wash = "raw" | "rinse" | "light" | "ecru";
export type Tone = "ink" | "light";

const THREAD = "var(--color-thread)";
const COPPER = "var(--color-copper)";

export function Patterns({ prefix, lineOpacity }: { prefix: string; lineOpacity: number }) {
  return (
    <>
      <pattern id={`${prefix}-lines`} width="8" height="5" patternUnits="userSpaceOnUse">
        <line x1="0" x2="8" y1="4" y2="4" stroke="currentColor" strokeWidth="0.8" strokeOpacity={lineOpacity} />
      </pattern>
      <pattern id={`${prefix}-twill`} width="3" height="3" patternUnits="userSpaceOnUse" patternTransform="rotate(-62)">
        <line x1="0" y1="0" x2="0" y2="3" stroke="currentColor" strokeWidth="1.1" />
      </pattern>
      <pattern id={`${prefix}-diag`} width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(40)">
        <line x1="0" y1="0" x2="0" y2="5" stroke="currentColor" strokeWidth="0.9" />
      </pattern>
      <pattern id={`${prefix}-cross`} width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(30)">
        <line x1="0" y1="0" x2="0" y2="4" stroke="currentColor" strokeWidth="1" />
        <line x1="0" y1="0" x2="4" y2="0" stroke="currentColor" strokeWidth="0.7" />
      </pattern>
      <pattern id={`${prefix}-vert`} width="3" height="3" patternUnits="userSpaceOnUse">
        <line x1="1" y1="0" x2="1" y2="3" stroke="currentColor" strokeWidth="0.8" />
      </pattern>
      <pattern id={`${prefix}-dense`} width="2.5" height="2.5" patternUnits="userSpaceOnUse" patternTransform="rotate(-20)">
        <line x1="0" y1="0" x2="0" y2="2.5" stroke="currentColor" strokeWidth="1" />
        <line x1="0" y1="0" x2="2.5" y2="0" stroke="currentColor" strokeWidth="0.8" />
      </pattern>
    </>
  );
}

export function EngraveDefs() {
  return (
    <>
      <svg aria-hidden width="0" height="0" className="absolute text-ink">
        <defs>
          <Patterns prefix="eng" lineOpacity={0.13} />
        </defs>
      </svg>
      <svg aria-hidden width="0" height="0" className="absolute text-faded">
        <defs>
          <Patterns prefix="engl" lineOpacity={0.12} />
        </defs>
      </svg>
    </>
  );
}

/* ---------- Garments: drawn in a 200 x 260 box, hook at (100, 0) ---------- */

type GarmentDef = {
  outline: string;
  clipHanger?: boolean;
  /** Ink line details */
  details: React.ReactNode;
  /** Copper topstitching paths */
  stitches: string;
  rivets?: [number, number][];
  buttons?: [number, number][];
  /** Extra clipped shading in the deepest folds */
  folds?: string;
};

const garments: Record<GarmentKind, GarmentDef> = {
  jeans: {
    clipHanger: true,
    outline: "M52 44 L148 44 L158 256 L110 256 L100 116 L90 256 L42 256 Z",
    details: (
      <>
        <path d="M52 58 L148 58 M100 58 L100 112" />
        {[60, 84, 111, 135].map((x) => (
          <rect key={x} x={x} y="42" width="5" height="18" className="paper" />
        ))}
        <path d="M54 66 C70 70 80 82 82 98 M146 66 C130 70 120 82 118 98 M124 64 L136 64 L136 80" />
        <path d="M88 114 L72 106 M88 120 L68 116 M112 114 L128 106 M112 120 L132 116" strokeOpacity="0.6" />
        <rect x="43" y="236" width="47" height="20" className="paper" />
        <rect x="110" y="236" width="47" height="20" className="paper" />
        <path d="M45 237 L45 255 M155 237 L155 255" stroke="#c23b32" strokeWidth="1.6" />
      </>
    ),
    stitches:
      "M108 58 L108 96 C108 104 104 108 100 110 M58 66 C72 72 80 82 84 94 M142 66 C128 72 120 82 116 94 M52 52 L148 52 M56 62 L48 232 M144 62 L152 232 M46 243 L88 243 M112 243 L154 243",
    rivets: [[82, 98], [118, 98], [56, 66], [144, 66]],
    buttons: [[100, 51]],
    folds: "M90 120 L100 116 L110 256 L90 256 Z",
  },
  trucker: {
    outline:
      "M60 40 L84 34 L100 52 L116 34 L140 40 L176 56 L192 206 L172 210 L160 118 L162 222 L38 222 L40 118 L28 210 L8 206 L24 56 Z",
    details: (
      <>
        <path d="M84 34 L76 62 L98 56 L100 52 L102 56 L124 62 L116 34" className="paper" />
        <path d="M100 56 L100 222 M38 206 L162 206 M62 108 L60 204 M138 108 L140 204 M40 118 L44 68 M160 118 L156 68" />
        <path d="M54 88 L86 88 L86 100 L70 108 L54 100 Z M114 88 L146 88 L146 100 L130 108 L114 100 Z" className="paper" />
        <path d="M10 192 L30 196 M190 192 L170 196" />
      </>
    ),
    stitches:
      "M95 58 L95 204 M40 80 C60 86 80 84 100 82 C120 84 140 86 160 80 M57 91 L83 91 M117 91 L143 91 M40 201 L160 201 M58 110 L56 200 M142 110 L144 200",
    buttons: [[104, 72], [104, 102], [104, 132], [104, 162], [104, 192], [70, 98], [130, 98], [52, 214], [148, 214]],
  },
  chore: {
    outline:
      "M60 40 L84 36 L100 50 L116 36 L140 40 L174 58 L190 220 L170 224 L160 120 L164 252 L36 252 L40 120 L30 224 L10 220 L26 58 Z",
    details: (
      <>
        <path d="M84 36 L80 62 L100 54 L120 62 L116 36" className="paper" />
        <path d="M100 54 L100 252 M40 120 L44 70 M160 120 L156 70 M12 206 L32 210 M188 206 L168 210" />
        <rect x="52" y="90" width="30" height="32" className="paper" />
        <rect x="46" y="160" width="40" height="46" className="paper" />
        <rect x="114" y="160" width="40" height="46" className="paper" />
      </>
    ),
    stitches: "M55 94 L79 94 M49 164 L83 164 M117 164 L151 164 M95 56 L95 250 M38 246 L162 246",
    buttons: [[104, 76], [104, 116], [104, 156], [104, 196], [104, 236]],
  },
  western: {
    outline:
      "M64 40 L86 36 C92 46 108 46 114 36 L136 40 L170 60 L186 196 L168 200 L156 116 L160 226 C130 234 70 234 40 226 L44 116 L32 200 L14 196 L30 60 Z",
    details: (
      <>
        <path d="M86 36 L92 58 L100 50 L108 58 L114 36" className="paper" />
        <path d="M100 50 L100 230 M32 70 C52 74 64 80 72 96 L86 82 L100 88 L114 82 L128 96 C136 80 148 74 168 70" />
        <path d="M54 104 L82 104 L82 112 L68 118 L54 112 Z M118 104 L146 104 L146 112 L132 118 L118 112 Z" className="paper" />
        <path d="M16 176 L34 180 M184 176 L166 180" />
      </>
    ),
    stitches: "M34 76 C52 80 62 86 70 100 L86 88 L100 94 L114 88 L130 100 C138 86 148 80 166 76 M96 54 L96 228",
    buttons: [[104, 80], [104, 108], [104, 136], [104, 164], [104, 192], [68, 112], [132, 112], [24, 186], [176, 186]],
  },
  dress: {
    outline:
      "M66 40 L86 36 C92 46 108 46 114 36 L134 40 L164 58 L176 128 L160 130 L150 96 L148 132 C156 180 166 220 172 256 L28 256 C34 220 44 180 52 132 L50 96 L40 130 L24 128 L36 58 Z",
    details: (
      <>
        <path d="M86 36 L92 58 L100 50 L108 58 L114 36" className="paper" />
        <path d="M100 50 L100 256 M50 126 L150 126 M50 138 L150 138" />
        <path d="M88 150 C84 190 76 226 66 256 M112 150 C116 190 124 226 134 256" strokeOpacity="0.55" />
        <rect x="58" y="76" width="26" height="28" className="paper" />
      </>
    ),
    stitches: "M96 54 L96 254 M52 132 L148 132 M61 80 L81 80 M32 248 C70 252 130 252 168 248",
    buttons: [[104, 70], [104, 98], [104, 160], [104, 190], [104, 220]],
    folds: "M112 150 C116 190 124 226 134 256 L172 256 C166 220 156 180 148 140 Z",
  },
  skirt: {
    clipHanger: true,
    outline: "M60 44 L140 44 L168 240 C130 246 70 246 32 240 Z",
    details: (
      <>
        <path d="M60 58 L140 58 M100 58 L102 242" />
        <path d="M62 66 C74 70 82 80 84 96 M138 66 C126 70 118 80 116 96" />
        <path d="M80 110 C72 160 60 200 50 240" strokeOpacity="0.5" />
      </>
    ),
    stitches: "M60 52 L140 52 M96 60 L98 240 M36 232 C70 238 130 238 164 232 M66 66 C76 72 82 80 86 92",
    buttons: [[106, 76], [106, 106], [106, 136], [106, 166], [106, 196], [106, 226]],
    rivets: [[84, 96], [116, 96]],
  },
  overalls: {
    outline:
      "M66 40 L74 40 L80 82 L120 82 L126 40 L134 40 L132 100 L150 110 L160 256 L110 256 L100 152 L90 256 L40 256 L50 110 L68 100 Z",
    details: (
      <>
        <rect x="82" y="92" width="36" height="28" className="paper" />
        <path d="M68 100 L132 100 M100 120 L100 150 M54 120 C64 126 72 136 74 150 M146 120 C136 126 128 136 126 150" />
        <rect x="41" y="238" width="49" height="18" className="paper" />
        <rect x="110" y="238" width="49" height="18" className="paper" />
      </>
    ),
    stitches: "M85 96 L115 96 M70 46 L74 96 M130 46 L126 96 M54 116 L44 234 M146 116 L156 234",
    buttons: [[76, 88], [124, 88], [52, 114], [148, 114]],
    rivets: [[74, 150], [126, 150]],
  },
  sweat: {
    outline:
      "M66 46 C80 56 120 56 134 46 L172 66 L186 204 L162 208 L152 120 L156 204 L44 204 L48 120 L38 208 L14 204 L28 66 Z",
    details: (
      <>
        <path d="M70 52 C84 64 116 64 130 52 M94 58 L100 72 L106 58" />
        <path d="M44 188 L156 188 M16 190 L40 194 M184 190 L160 194" />
      </>
    ),
    stitches: "M68 50 L40 118 M132 50 L160 118 M46 194 L154 194",
  },
};

const washOpacity: Record<Wash, number> = { raw: 0.9, rinse: 0.65, light: 0.35, ecru: 0.12 };

/** A garment on its hanger. Place it with a transform; `id` must be unique on the page. */
export function Garment({
  kind,
  id,
  wash = "rinse",
  tone = "ink",
  hanger = true,
}: {
  kind: GarmentKind;
  id: string;
  wash?: Wash;
  tone?: Tone;
  hanger?: boolean;
}) {
  const g = garments[kind];
  const p = tone === "ink" ? "eng" : "engl";
  const paper = tone === "ink" ? "var(--color-base)" : "var(--color-indigo-deep)";

  return (
    <g
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinejoin="round"
      strokeLinecap="round"
      fill="none"
      style={{ "--paper": paper } as React.CSSProperties}
    >
      {hanger && (
        <>
          <path d="M100 2 a7 7 0 1 1 7 8 C104 12 100 14 100 20" />
          {g.clipHanger ? (
            <>
              <path d="M100 20 L56 40 L144 40 Z" />
              <rect x="54" y="35" width="9" height="13" className="paper" />
              <rect x="137" y="35" width="9" height="13" className="paper" />
            </>
          ) : (
            <path d="M100 20 L42 40 L158 40 Z" />
          )}
        </>
      )}

      <clipPath id={`${id}-clip`}>
        <path d={g.outline} />
      </clipPath>
      <path d={g.outline} className="paper" stroke="none" />
      <g clipPath={`url(#${id}-clip)`} stroke="none">
        <rect width="200" height="260" fill={`url(#${p}-${kind === "sweat" ? "vert" : "twill"})`} fillOpacity={washOpacity[wash]} />
        <rect x="126" width="80" height="260" fill={`url(#${p}-cross)`} fillOpacity="0.7" />
        <rect x="162" width="40" height="260" fill={`url(#${p}-dense)`} fillOpacity="0.6" />
        <rect width="22" height="260" fill={`url(#${p}-diag)`} fillOpacity="0.55" />
        {g.folds && <path d={g.folds} fill={`url(#${p}-dense)`} fillOpacity="0.45" />}
      </g>
      {g.details}
      <path d={g.stitches} stroke={THREAD} strokeWidth="1.2" strokeDasharray="3.5 2.5" />
      {g.buttons?.map(([x, y]) => (
        <g key={`b${x}-${y}`}>
          <circle cx={x} cy={y} r="3.6" fill={COPPER} stroke="currentColor" strokeWidth="0.8" />
          <circle cx={x} cy={y} r="1.2" fill="currentColor" stroke="none" />
        </g>
      ))}
      {g.rivets?.map(([x, y]) => (
        <circle key={`r${x}-${y}`} cx={x} cy={y} r="2.2" fill={COPPER} stroke="none" />
      ))}
      <path d={g.outline} strokeWidth="1.6" />
    </g>
  );
}

/** Product image: the garment on a rail against a hatched wall. */
export function ProductArt({
  kind,
  wash,
  id,
  label,
  photo,
  className = "",
}: {
  kind: GarmentKind;
  wash: Wash;
  id: string;
  label: string;
  /** An uploaded photo hangs on the same hook in place of the drawing. Cut-outs on a transparent background look best. */
  photo?: string;
  className?: string;
}) {
  return (
    <svg viewBox="0 0 300 400" role="img" aria-label={label} className={`text-ink ${className}`}>
      <rect width="300" height="400" fill="url(#eng-lines)" />
      <line x1="0" x2="300" y1="52" y2="52" stroke="currentColor" strokeWidth="2.5" />
      <line x1="0" x2="300" y1="58" y2="58" stroke="currentColor" strokeWidth="0.8" strokeOpacity="0.5" />
      <g transform="translate(50 48)">
        {photo ? (
          <>
            {/* Hook and hanger; the garment's shoulders cover the bar as on a real hanger */}
            <g stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" strokeLinecap="round" fill="none">
              <path d="M100 2 a7 7 0 1 1 7 8 C104 12 100 14 100 20" />
              <path d="M100 20 L42 40 L158 40 Z" />
            </g>
            {/* Photos shot on white blend into the wall in the light theme */}
            <image
              href={photo}
              x="-10"
              y="22"
              width="220"
              height="300"
              preserveAspectRatio="xMidYMin meet"
              className="mix-blend-multiply dark:mix-blend-normal"
            />
          </>
        ) : (
          <Garment kind={kind} wash={wash} id={id} />
        )}
      </g>
      <rect y="372" width="300" height="28" fill="url(#eng-dense)" fillOpacity="0.22" />
      <line x1="0" x2="300" y1="372" y2="372" stroke="currentColor" strokeOpacity="0.6" />
    </svg>
  );
}

/* ---------- Scenes ---------- */

function placed(
  kind: GarmentKind,
  wash: Wash,
  cx: number,
  top: number,
  scale: number,
  id: string,
  tone: Tone = "ink",
  hanger = true,
) {
  return (
    <g key={id} transform={`translate(${cx - 100 * scale} ${top - 2 * scale}) scale(${scale})`}>
      <Garment kind={kind} wash={wash} id={id} tone={tone} hanger={hanger} />
    </g>
  );
}

/** A folded pair of jeans seen from the front of a stack, selvedge edge showing. */
function FoldedJeans({ x, y, w, wash, id }: { x: number; y: number; w: number; wash: Wash; id: string }) {
  return (
    <g>
      <clipPath id={id}>
        <rect x={x} y={y} width={w} height="22" rx="6" />
      </clipPath>
      <rect x={x} y={y} width={w} height="22" rx="6" className="fill-base" />
      <g clipPath={`url(#${id})`} stroke="none">
        <rect x={x} y={y} width={w} height="22" fill="url(#eng-twill)" fillOpacity={washOpacity[wash]} />
        <rect x={x} y={y + 14} width={w} height="8" fill="url(#eng-dense)" fillOpacity="0.5" />
      </g>
      <path d={`M${x + 8} ${y + 6} L${x + w - 26} ${y + 6}`} stroke={THREAD} strokeWidth="1.1" strokeDasharray="3.5 2.5" />
      <rect x={x + w - 18} y={y + 2} width="10" height="18" className="fill-base" strokeWidth="1" />
      <line x1={x + w - 13} x2={x + w - 13} y1={y + 3} y2={y + 19} stroke="#c23b32" strokeWidth="1.6" />
      <rect x={x} y={y} width={w} height="22" rx="6" fill="none" strokeWidth="1.4" />
    </g>
  );
}

/** Hero: a denim workshop with a window, a stack of folded jeans, a dress form in a trucker jacket and a rail. */
export function AtelierScene({ className = "" }: { className?: string }) {
  const form =
    "M664 150 C644 160 636 190 642 220 C648 250 640 280 646 310 C654 340 734 340 742 310 C748 280 740 250 746 220 C752 190 744 160 724 150 C714 144 674 144 664 150 Z";
  return (
    <svg
      viewBox="0 0 1440 540"
      preserveAspectRatio="xMidYMax slice"
      role="img"
      aria-label="Engraving of a denim workshop: an arched window, a stack of folded selvedge jeans on a work table, shears on the wall, a dress form wearing a denim jacket and a rail of jeans, shirts and coats"
      className={`text-ink ${className}`}
    >
      <g stroke="currentColor" strokeLinejoin="round" strokeLinecap="round">
        {/* Floor */}
        <rect y="520" width="1440" height="20" fill="url(#eng-dense)" fillOpacity="0.45" stroke="none" />
        <line x1="0" x2="1440" y1="520" y2="520" strokeWidth="1.5" />
        <path d="M90 520 L310 520 L400 540 L180 540 Z" className="fill-base" stroke="none" />

        {/* Arched window with light falling across */}
        <path d="M60 490 L60 220 A130 130 0 0 1 320 220 L320 490 Z" className="fill-base" strokeWidth="2.5" />
        <path d="M76 476 L76 224 A114 114 0 0 1 304 224 L304 476 Z" fill="url(#eng-diag)" fillOpacity="0.2" strokeWidth="1.2" />
        <path d="M190 110 L190 476 M76 300 L304 300 M76 388 L304 388 M100 170 L280 170" strokeWidth="1.2" />
        <rect x="48" y="490" width="284" height="12" className="fill-base" strokeWidth="1.5" />
        <rect x="48" y="490" width="284" height="12" fill="url(#eng-cross)" fillOpacity="0.5" stroke="none" />

        {/* Shears */}
        <circle cx="468" cy="150" r="3" fill="currentColor" />
        <path d="M468 150 L456 165 M468 150 L482 165" strokeOpacity="0.5" />
        <circle cx="456" cy="178" r="13" className="fill-base" strokeWidth="2" />
        <circle cx="482" cy="178" r="13" className="fill-base" strokeWidth="2" />
        <path d="M462 190 L474 290 L478 190 M476 190 L474 290" className="fill-base" strokeWidth="1.6" />

        {/* Work table with folded jeans and a bolt of denim */}
        <rect x="360" y="412" width="230" height="12" fill="url(#eng-cross)" strokeWidth="1.5" />
        <path d="M372 424 L372 520 M578 424 L578 520" strokeWidth="2" />
        <FoldedJeans x={372} y={390} w={128} wash="raw" id="stack-1" />
        <FoldedJeans x={376} y={368} w={122} wash="rinse" id="stack-2" />
        <FoldedJeans x={370} y={346} w={128} wash="light" id="stack-3" />
        <FoldedJeans x={378} y={324} w={118} wash="raw" id="stack-4" />
        <clipPath id="bolt-clip">
          <rect x="512" y="372" width="62" height="40" rx="4" />
        </clipPath>
        <rect x="512" y="372" width="62" height="40" rx="4" className="fill-base" strokeWidth="1.4" />
        <rect x="512" y="372" width="62" height="40" fill="url(#eng-twill)" fillOpacity="0.8" clipPath="url(#bolt-clip)" stroke="none" />
        <ellipse cx="574" cy="392" rx="7" ry="20" className="fill-base" strokeWidth="1.4" />
        <path d="M574 412 C584 440 586 470 580 500 L556 498 C562 468 560 440 552 412 Z" className="fill-base" strokeWidth="1.2" />
        <path d="M574 412 C584 440 586 470 580 500 L556 498 C562 468 560 440 552 412 Z" fill="url(#eng-twill)" fillOpacity="0.7" stroke="none" />
        <path d="M560 420 C566 450 566 474 562 496" stroke={THREAD} strokeWidth="1.1" strokeDasharray="3.5 2.5" fill="none" />

        {/* Dress form wearing a trucker jacket */}
        <path d={form} className="fill-base" strokeWidth="1.8" />
        <rect x="682" y="120" width="24" height="28" className="fill-base" strokeWidth="1.5" />
        <ellipse cx="694" cy="120" rx="14" ry="5" className="fill-base" strokeWidth="1.5" />
        <path d="M694 334 L694 496 M694 496 L640 520 M694 496 L748 520 M694 496 L694 520" strokeWidth="2.2" />
        {placed("trucker", "rinse", 694, 128, 0.74, "form-jacket", "ink", false)}

        {/* Rail */}
        <path d="M830 110 L1420 110" strokeWidth="3" />
        <path d="M842 110 L842 520 M1408 110 L1408 520 M816 520 L868 520 M1382 520 L1434 520" strokeWidth="2.5" />
        {placed("chore", "ecru", 920, 110, 0.95, "atelier-g1")}
        {placed("jeans", "raw", 1030, 110, 0.95, "atelier-g2")}
        {placed("western", "light", 1140, 110, 0.95, "atelier-g3")}
        {placed("overalls", "rinse", 1250, 110, 0.95, "atelier-g4")}
        {placed("trucker", "raw", 1340, 110, 0.95, "atelier-g5")}
      </g>
    </svg>
  );
}

const footerRail: [GarmentKind, Wash][] = [
  ["trucker", "raw"], ["jeans", "rinse"], ["western", "light"], ["skirt", "raw"],
  ["chore", "ecru"], ["overalls", "rinse"], ["dress", "light"], ["jeans", "raw"],
  ["sweat", "rinse"], ["trucker", "light"], ["western", "raw"], ["jeans", "light"],
];

/** Footer: a long rail of denim in pale lines on raw indigo. */
export function RailScene({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 1440 400"
      preserveAspectRatio="xMidYMax slice"
      role="img"
      aria-label="Engraving of a long clothing rail holding denim jackets, jeans, shirts, skirts, overalls and a dress"
      className={`text-faded ${className}`}
    >
      <g stroke="currentColor" strokeLinejoin="round" strokeLinecap="round">
        <rect y="340" width="1440" height="60" fill="url(#engl-dense)" fillOpacity="0.3" stroke="none" />
        <line x1="0" x2="1440" y1="340" y2="340" strokeWidth="1.5" />
        {[352, 366, 384].map((y) => (
          <line key={y} x1="0" x2="1440" y1={y} y2={y} strokeOpacity="0.4" />
        ))}
        <path d="M16 60 L1424 60" strokeWidth="3" />
        <path d="M24 60 L24 340 M1416 60 L1416 340 M4 340 L44 340 M1396 340 L1436 340" strokeWidth="2.5" />
        {footerRail.map(([kind, wash], i) => placed(kind, wash, 76 + i * 117, 60, 0.9, `rail-g${i}`, "light"))}
      </g>
    </svg>
  );
}
