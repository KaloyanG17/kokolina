# 003 — Give the themed dropdown an open and close motion anchored to its button

- **Status**: DONE
- **Commit**: 9ca5868
- **Severity**: MEDIUM
- **Category**: Physicality & origin
- **Estimated scope**: 1 file, one element

## Problem

The themed dropdown (shop "Sort", and every admin select) shows and hides its option card with
the `hidden` attribute, so the card teleports in and out with nothing connecting it to the
button that opened it.

```tsx
// src/components/dropdown.tsx:148-154 — current
      <ul
        id={listId}
        role="listbox"
        aria-labelledby={buttonId}
        hidden={!open}
        className="stitched absolute left-0 right-0 z-50 mt-1 max-h-72 min-w-max overflow-y-auto rounded-md border border-line bg-surface p-2 shadow-[4px_5px_0_0_var(--color-surface-3)] [--stitch:var(--color-thread)]"
      >
```

## Target

The card grows out of the button: it starts at `scale: 0.97`, 4px higher, transparent, and settles
to full size from its top edge. Opening takes **150ms**, closing **100ms** (the system's response
snaps; the exit is faster than the entrance). Easing is the repo token `--ease-brand`
(`cubic-bezier(0.22, 1, 0.36, 1)`, a strong ease-out). Never `scale(0)`.

Because the card stays mounted, it is hidden from pointers and assistive technology with
`visibility: hidden` when closed. `visibility` is included in the transition so it only flips to
hidden after the 100ms fade has finished.

```tsx
// src/components/dropdown.tsx — target
      <ul
        id={listId}
        role="listbox"
        aria-labelledby={buttonId}
        className={`stitched absolute left-0 right-0 z-50 mt-1 max-h-72 min-w-max origin-top overflow-y-auto rounded-md border border-line bg-surface p-2 shadow-[4px_5px_0_0_var(--color-surface-3)] [--stitch:var(--color-thread)] transition-[opacity,scale,translate,visibility] ease-brand ${
          open
            ? "visible translate-y-0 scale-100 opacity-100 duration-150"
            : "pointer-events-none invisible -translate-y-1 scale-[0.97] opacity-0 duration-100"
        }`}
      >
```

## Repo conventions to follow

- Tailwind v4: `scale-*` and `translate-*` set the standalone `scale` / `translate` properties, so the
  transition list must name `scale` and `translate` (not `transform`). `duration-150` and `duration-100`
  are valid v4 utilities (milliseconds).
- Easing: always the `ease-brand` utility (token in `src/app/globals.css`).
- Reduced motion is handled globally in `src/app/globals.css` (`transition-property: opacity !important`),
  which leaves just the fade. Nothing to add here.

## Steps

1. In `src/components/dropdown.tsx`, on the `<ul role="listbox">`, delete the `hidden={!open}` attribute.
2. Replace its static `className="..."` with the template-literal `className` from Target (same
   existing classes, plus `origin-top`, the transition list and the open/closed state classes).
3. Leave every other line of the component as is (keyboard handling, `aria-activedescendant`,
   outside-click handling and the `scrollIntoView` effect keep working because they key off `open`).

## Boundaries

- Do NOT change the button, options, keyboard logic or ARIA attributes other than removing `hidden`.
- Do NOT animate `height` or `max-height`.
- Do NOT add dependencies (no Motion/Framer).
- If the quoted element does not match (drift since 9ca5868), STOP and report.

## Verification

- **Mechanical**: `npx tsc --noEmit`, `npx eslint src`, `npm run build` all succeed.
- **Feel check** (`npm run dev`, open `/shop`, light and dark theme):
  - Click "Sort": the card grows down from the button's edge in a blink, not from the page centre and not instantly.
  - Choose an option: the card fades and shrinks away slightly faster than it appeared.
  - Open and immediately close (double click): the motion reverses from where it is, it does not restart.
  - Keyboard: focus the button, press ArrowDown, move with arrows, Enter selects, Escape closes. All still work.
  - With the card closed, Tab past the dropdown: focus never lands inside the hidden card, and a screen
    reader (or the accessibility tree in DevTools) does not list the closed options.
  - DevTools → Animations at 10%: the start state is about 97% size, never a dot growing from nothing.
  - Emulate `prefers-reduced-motion: reduce`: only a fade remains.
- **Done when**: the dropdown opens from its button in 150ms, closes in 100ms, and keyboard and
  screen reader behaviour is unchanged.
