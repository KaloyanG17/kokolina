# 005 — Fill the free-delivery bar with a clip-path reveal instead of animating width

- **Status**: DONE
- **Commit**: 9ca5868
- **Severity**: LOW
- **Category**: Performance
- **Estimated scope**: 1 file, one element

## Problem

The "Add €X more for free delivery" bar in the bag drawer and on the bag page animates `width`,
which forces layout on every frame of its 700ms transition. 700ms is also long for a progress
change you trigger yourself (adding or removing a piece).

```tsx
// src/components/bag-lines.tsx:127-135 — current (inside FreeShippingBar)
      <div aria-hidden className="relative h-2 overflow-hidden rounded-full bg-surface-3">
        <div
          className="h-full rounded-full transition-[width] duration-700 ease-brand"
          style={{
            width: `${share * 100}%`,
            backgroundImage: "repeating-linear-gradient(90deg, var(--color-thread) 0 10px, transparent 10px 15px)",
          }}
        />
      </div>
```

`transform: scaleX()` would also avoid layout, but it would stretch the 10px stitch dashes as the
bar fills, so the fill should be revealed with `clip-path` instead: the full-width dashed bar is
always there and an inset clip uncovers it from the left.

## Target

- The fill element is always `width: 100%`.
- Progress is `clip-path: inset(0 <100 - share×100>% 0 0 round 9999px)`.
- Transition: `clip-path` over **400ms** with the repo's `ease-brand` (`cubic-bezier(0.22, 1, 0.36, 1)`).
  It is a deliberate progress change, not a UI pop-in, so a little longer than a dropdown but well under the current 700ms.

```tsx
// target
        <div
          className="h-full w-full transition-[clip-path] duration-400 ease-brand"
          style={{
            clipPath: `inset(0 ${(1 - share) * 100}% 0 0 round 9999px)`,
            backgroundImage: "repeating-linear-gradient(90deg, var(--color-thread) 0 10px, transparent 10px 15px)",
          }}
        />
```

## Repo conventions to follow

- The site already reveals a thread with `clip-path: inset(...)`: `src/components/scroll-rail.tsx`
  sets `clip-path` to `inset(0 0 ${(1 - p) * 100}% 0)` on the thread as you scroll. Mirror that approach horizontally.
- Easing via the `ease-brand` utility; `duration-400` is a valid Tailwind v4 utility (400ms).

## Steps

1. In `src/components/bag-lines.tsx`, inside `FreeShippingBar`, replace the inner fill `<div>` with the target:
   - className `h-full rounded-full transition-[width] duration-700 ease-brand` → `h-full w-full transition-[clip-path] duration-400 ease-brand`
     (the rounding now comes from `round 9999px` in the clip, and the outer track already has `rounded-full overflow-hidden`).
   - style: remove `width`, add `clipPath` as shown; keep `backgroundImage` unchanged.

## Boundaries

- Only the fill element inside `FreeShippingBar` in `src/components/bag-lines.tsx`.
- Do NOT change the label text, the check icon, the outer track, or the shipping maths.
- If the quoted code does not match (drift since 9ca5868), STOP and report.

## Verification

- **Mechanical**: `npx tsc --noEmit`, `npx eslint src`, `npm run build` succeed.
- **Feel check** (`npm run dev`):
  - Add a €119 shirt to the bag: the stitched bar fills to about 79% from the left; the dashes keep their 10px length and never stretch.
  - Raise the quantity to 2 (€238): the bar finishes filling smoothly and the label changes to "Free delivery in Bulgaria".
  - Lower it back to 1: the bar recedes from the right.
  - DevTools → Performance, record while changing quantity: no Layout entries for the bar during its animation (paint only).
  - Emulate `prefers-reduced-motion: reduce`: the bar jumps to the new length (the global reduced-motion rule limits transitions to opacity), which is acceptable.
- **Done when**: the bar animates with `clip-path` only, over 400ms, with unstretched dashes.
