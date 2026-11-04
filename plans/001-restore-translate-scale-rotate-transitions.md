# 001 — Restore movement that Tailwind v4 never transitions, and tighten press and card timing

- **Status**: DONE
- **Commit**: 9ca5868
- **Severity**: HIGH
- **Category**: Easing & duration (plus Performance: the intended motion silently never runs)
- **Estimated scope**: 9 files, one class string or CSS block each

## Problem

The project uses Tailwind CSS 4.3.4. In Tailwind v4 the `translate-*`, `scale-*` and
`rotate-*` utilities set the standalone CSS properties `translate`, `scale` and `rotate`,
not `transform`. Confirmed in the compiled CSS:

```css
.translate-y-8{translate:var(--tw-translate-x) var(--tw-translate-y)}
.-rotate-1{rotate:-1deg}
```

Many elements use an arbitrary transition list that names only `transform`, which compiles to:

```css
transition-property:opacity,transform;
transition-property:border-color,transform;
```

`transform` never changes on these elements, so their movement **snaps instantly** while
only colour or opacity eases. Every hover lift, press scale, scroll reveal rise, loader lift,
icon rotation listed below currently jumps. (The plain `transition-transform` utility is
fine: it compiles to `transform,translate,scale,rotate`.)

Second problem on the same lines: press feedback is set to 300ms and the product card to
500ms. Press feedback should be 100–160ms; a hover effect seen dozens of times per visit
should be well under 300ms.

Current code, verbatim:

```css
/* src/app/globals.css:212-221 — current */
  .btn-primary,
  .btn-secondary,
  .label-tag {
    @apply relative inline-flex items-center justify-center gap-2 rounded-sm px-4 py-2 uppercase tracking-[0.08em]
      transition-[background-color,color,transform] duration-300 ease-brand
      focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink;
    background-image: var(--weave);
  }
  .btn-primary,
  .btn-secondary {
    @apply button-md hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98];
  }
```

```tsx
// src/components/product-card.tsx:26 — current
className="stitched group focus-ring flex h-full flex-col gap-4 rounded-md border border-line bg-surface p-2 pb-4 transition-[border-color,transform] duration-500 ease-brand [--stitch:var(--color-line)] hover:-translate-y-1 hover:border-ink/40 hover:[--stitch:var(--color-thread)] active:scale-[0.98]"
// src/components/product-card.tsx:33 — current
className="aspect-[3/4] w-full transition-transform duration-500 ease-brand group-hover:scale-[1.03]"

// src/components/bag-drawer.tsx:59 — current (close button)
className="focus-ring flex size-10 items-center justify-center rounded-sm transition-[background-color,transform] duration-300 ease-brand hover:bg-surface-3 active:scale-[0.98]"

// src/components/bag-lines.tsx:108 — current (QtyButton)
className="focus-ring flex size-6 items-center justify-center rounded-sm transition-[background-color,transform] duration-300 ease-brand hover:bg-surface-3 active:scale-[0.98]"

// src/components/product-purchase.tsx:50 — current (size chip), the part to change
... px-3 transition-[background-color,color,transform] duration-300 ease-brand hover:border-ink-soft ...

// src/components/shop-browser.tsx:115 — current (category filter button), the part to change
className={`title-4 focus-ring shrink-0 rounded-sm border px-3 py-2 transition-[background-color,color,transform] duration-300 ease-brand active:scale-[0.98] ${

// src/components/theme-toggle.tsx:28 — current, the part to change
... text-muted transition-[background-color,color,transform] duration-300 ease-brand hover:bg-surface-3 ...
// src/components/theme-toggle.tsx:34 — current
className="absolute transition-[transform,opacity] duration-500 ease-brand dark:translate-y-6 dark:-rotate-90 dark:opacity-0"
// src/components/theme-toggle.tsx:40 — current
className="absolute -translate-y-6 rotate-90 opacity-0 transition-[transform,opacity] duration-500 ease-brand dark:translate-y-0 dark:rotate-0 dark:opacity-100"

// src/components/sections.tsx:120 — current (FAQ plus icon), the part to change
... border border-line transition-[transform,background-color] duration-500 ease-brand group-open:rotate-45 ...

// src/components/reveal.tsx:37 — current
className={`transition-[opacity,transform] duration-700 ease-brand motion-reduce:translate-y-0 ${

// src/components/stitch-loader.tsx:135 — current (loading screen), the part to change
... gap-6 px-6 transition-[opacity,transform] duration-700 ease-brand ${
```

## Target

Name the properties that actually change, and give press feedback and card hover the right timing.
The easing stays the repo token `--ease-brand: cubic-bezier(0.22, 1, 0.36, 1)` (a strong ease-out;
no new curve is needed). Tailwind v4 accepts any integer for `duration-*` (e.g. `duration-150` = 150ms).

| Element | Target transition |
| --- | --- |
| `.btn-primary`, `.btn-secondary`, `.label-tag` | colour 300ms, `translate` and `scale` 160ms |
| Product card (link) | `border-color, translate, scale` 250ms |
| Product card image | `transition-transform` 300ms (was 500ms) |
| Bag close button, qty buttons | `background-color, scale` 150ms |
| Size chip, category filter button | `background-color, color, scale` 150ms |
| Theme toggle button | `background-color, color, scale` 150ms |
| Theme toggle icons (sun/moon) | `translate, rotate, opacity` 300ms (was 500ms) |
| FAQ plus icon | `rotate, background-color` 300ms (was 500ms) |
| Scroll reveal (`Reveal`) | `opacity, translate` 600ms (marketing reveal; was a 700ms fade with a snapping rise) |
| Loading screen exit | `opacity, translate` 700ms (unchanged duration; plan 002 owns its timing) |

```css
/* src/app/globals.css — target for the shared button/label block */
  .btn-primary,
  .btn-secondary,
  .label-tag {
    @apply relative inline-flex items-center justify-center gap-2 rounded-sm px-4 py-2 uppercase tracking-[0.08em]
      focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink;
    /* Colour eases at 300ms; the lift and press respond faster, at 160ms */
    transition:
      background-color 300ms var(--ease-brand),
      color 300ms var(--ease-brand),
      translate 160ms var(--ease-brand),
      scale 160ms var(--ease-brand);
    background-image: var(--weave);
  }
```

## Repo conventions to follow

- The single easing token is `--ease-brand` in the `@theme` block of `src/app/globals.css:35`
  (`cubic-bezier(0.22, 1, 0.36, 1)`), used as the `ease-brand` utility. Use it; do not add another curve.
- Exemplar of a correct transition list: `src/components/dropdown.tsx` chevron uses
  `transition-transform duration-300 ease-brand` with `rotate-180`, which works because
  `transition-transform` includes `rotate`.
- The global reduced-motion rule in `src/app/globals.css` (`@media (prefers-reduced-motion: reduce)`
  sets `transition-property: opacity !important`) already limits these to opacity. Do not touch it.

## Steps

1. `src/app/globals.css`: in the `.btn-primary, .btn-secondary, .label-tag` block, remove
   `transition-[background-color,color,transform] duration-300 ease-brand` from the `@apply`
   and add the `transition:` declaration shown in Target, directly after the `@apply`.
2. `src/components/product-card.tsx:26`: replace `transition-[border-color,transform] duration-500`
   with `transition-[border-color,translate,scale] duration-250`.
3. `src/components/product-card.tsx:33`: replace `duration-500` with `duration-300`.
4. `src/components/bag-drawer.tsx:59` and `src/components/bag-lines.tsx:108`: replace
   `transition-[background-color,transform] duration-300` with `transition-[background-color,scale] duration-150`.
5. `src/components/product-purchase.tsx:50` and `src/components/shop-browser.tsx:115`: replace
   `transition-[background-color,color,transform] duration-300` with `transition-[background-color,color,scale] duration-150`.
6. `src/components/theme-toggle.tsx:28`: replace `transition-[background-color,color,transform] duration-300`
   with `transition-[background-color,color,scale] duration-150`.
7. `src/components/theme-toggle.tsx:34` and `:40`: replace `transition-[transform,opacity] duration-500`
   with `transition-[translate,rotate,opacity] duration-300`.
8. `src/components/sections.tsx:120`: replace `transition-[transform,background-color] duration-500`
   with `transition-[rotate,background-color] duration-300`.
9. `src/components/reveal.tsx:37`: replace `transition-[opacity,transform] duration-700` with
   `transition-[opacity,translate] duration-600`.
10. `src/components/stitch-loader.tsx:135`: replace `transition-[opacity,transform]` with
    `transition-[opacity,translate]` (keep `duration-700`).

## Boundaries

- Do NOT touch `src/components/nav.tsx` (plan 004 owns the mobile menu) or `src/components/bag-lines.tsx:129` (plan 005 owns the delivery bar).
- Do NOT touch anything under `src/app/admin/`.
- Do NOT change markup, the hover/active values themselves (`-translate-y-0.5`, `scale-[0.98]`, `scale-[1.03]`, `rotate-45`), or the easing token.
- Do NOT add dependencies.
- If a quoted line does not match what you find (drift since 9ca5868), STOP and report instead of improvising.

## Verification

- **Mechanical**: from `D:\fashion-shop\shop` run `npx tsc --noEmit` and `npx eslint src` (both clean), then
  `npm run build` and confirm the compiled CSS no longer contains `transition-property:opacity,transform`
  or `transition-property:border-color,transform`:
  `grep -c "transition-property:opacity,transform" .next/static/css/*.css` → `0`.
- **Feel check** (`npm run dev`, desktop browser):
  - Hover a black button: it lifts 2px smoothly instead of jumping; press it and it sinks to 0.98 quickly (about a sixth of a second), not sluggishly.
  - Hover a product card on /shop: the card rises and the picture zooms together, settling in about a quarter second.
  - Tap size chips on a product page and category chips on /shop: a quick, small squeeze on press.
  - Click the theme toggle: the moon slides and rotates out while the sun slides in, rather than swapping instantly.
  - Open an FAQ item on the home page: the plus rotates into an x.
  - Scroll the home page: sections rise 32px as they fade in (previously only faded).
  - In DevTools → Animations, set playback to 10% and confirm the button lift and press are visibly tweened, not stepped.
  - In DevTools → Rendering, emulate `prefers-reduced-motion: reduce` and confirm movement is gone but fades remain.
- **Done when**: no arbitrary transition list in the storefront names `transform` without also naming the
  `translate`/`scale`/`rotate` property it actually animates, and the feel checks pass.
