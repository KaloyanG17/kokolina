# 004 — Make the mobile menu slide its links in, and settle in under half a second

- **Status**: DONE
- **Commit**: 9ca5868
- **Severity**: LOW
- **Category**: Easing & duration
- **Estimated scope**: 1 file, 5 class strings

## Problem

The mobile menu (below the `lg` breakpoint) has two problems:

1. **The slide never runs.** Each link is meant to rise 24px as it fades in, but its transition list
   names `transform`, while Tailwind v4's `translate-y-*` sets the standalone `translate` property.
   Only the fade animates; the rise snaps.
2. **It is slow.** Links stagger 60ms apart with a 500ms fade, and the language switch waits 400ms,
   so the last item settles about 900ms after the tap. The overlay and hamburger icon also take 500ms.

```tsx
// src/components/nav.tsx:85-91 — current (each link)
        <li
          key={l.key}
          style={{ transitionDelay: open ? `${Math.min(i * 60, 400)}ms` : "0ms" }}
          className={`transition-[opacity,transform] duration-500 ease-brand ${
            open ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
          }`}
        >

// src/components/nav.tsx:102-105 — current (language switch row)
      <li
        style={{ transitionDelay: open ? "400ms" : "0ms" }}
        className={`pt-4 transition-[opacity,transform] duration-500 ease-brand ${open ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"}`}
      >

// src/components/nav.tsx:191 and :197 — current (hamburger bars)
className={`absolute h-0.5 w-4 rounded-full bg-fg transition-transform duration-500 ease-brand ${

// src/components/nav.tsx:208 — current (menu overlay)
className={`fixed inset-0 z-40 bg-base/90 backdrop-blur-xl transition-opacity duration-500 ease-brand lg:hidden ${
```

## Target

- Links: fade and rise **16px** (`translate-y-4`) over **300ms**, stagger **40ms** per item, stagger capped at **200ms**.
- Language switch row: same 300ms, delay **240ms** (just after the last link).
- Closing: no stagger (delay `0ms`), same 300ms.
- Overlay fade: **300ms**. Hamburger bars: **300ms**.
- Easing everywhere: the repo token via `ease-brand` (`cubic-bezier(0.22, 1, 0.36, 1)`).
- Stagger is decorative: every link is clickable the moment the menu opens (no change needed; the overlay already enables pointer events on open).

```tsx
// target, link item
          style={{ transitionDelay: open ? `${Math.min(i * 40, 200)}ms` : "0ms" }}
          className={`transition-[opacity,translate] duration-300 ease-brand ${
            open ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
          }`}

// target, language switch row
        style={{ transitionDelay: open ? "240ms" : "0ms" }}
        className={`pt-4 transition-[opacity,translate] duration-300 ease-brand ${open ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}
```

## Repo conventions to follow

- Tailwind v4: name `translate` (not `transform`) in arbitrary transition lists; `transition-transform`
  is fine as is because it already includes `translate`, `scale` and `rotate`.
- Easing token `--ease-brand` in `src/app/globals.css`; durations are written as `duration-300`.
- Exemplar of the correct property naming after plan 001: `src/components/reveal.tsx`
  (`transition-[opacity,translate]`).

## Steps

1. `src/components/nav.tsx:87-89`: change the link `<li>` to the target `style` and `className` above.
2. `src/components/nav.tsx:103-104`: change the language switch `<li>` to the target above.
3. `src/components/nav.tsx:191` and `:197`: replace `duration-500` with `duration-300` on both hamburger bars.
4. `src/components/nav.tsx:208`: replace `duration-500` with `duration-300` on the `#mobile-menu` overlay.

## Boundaries

- Only `src/components/nav.tsx`, only the lines above. Do NOT touch the desktop links, the bag button or the language switch component itself.
- Do NOT change markup, labels or the menu's open/close logic.
- If the quoted lines do not match (drift since 9ca5868), STOP and report.

## Verification

- **Mechanical**: `npx tsc --noEmit`, `npx eslint src`, `npm run build` succeed.
- **Feel check** (`npm run dev`, DevTools device toolbar at 375px wide, or a phone):
  - Tap the menu button: the links rise into place one after another and everything has settled in under half a second.
  - Tap a link as soon as the menu opens: it navigates (stagger never blocks).
  - Tap the menu button twice quickly: the menu reverses smoothly without restarting.
  - DevTools → Animations at 10%: each link visibly travels 16px upward, not just fades.
  - Emulate `prefers-reduced-motion: reduce`: links only fade.
- **Done when**: the menu's links visibly rise, the last item settles at about 540ms (240ms delay + 300ms), and the overlay and icon take 300ms.
