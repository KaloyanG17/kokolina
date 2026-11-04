# Animation plans

Written by the animation audit on commit `9ca5868`. Each plan is self-contained: hand one to any
agent (or follow it yourself) without needing the audit conversation.

| # | Plan | Severity | Status |
| --- | --- | --- | --- |
| 001 | [Restore translate, scale and rotate transitions; press and card timing](001-restore-translate-scale-rotate-transitions.md) | HIGH | DONE |
| 002 | [Loading screen once per session](002-loading-screen-once-per-session.md) | HIGH | DONE |
| 003 | [Dropdown open and close motion](003-dropdown-open-close-motion.md) | MEDIUM | DONE |
| 004 | [Mobile menu timing](004-mobile-menu-timing.md) | LOW | DONE |
| 005 | [Free-delivery bar without layout](005-free-delivery-bar-without-layout.md) | LOW | DONE |

## Recommended order

1. **001 first.** It fixes the root cause (Tailwind v4 moves elements with the `translate` / `scale` /
   `rotate` properties, but many transition lists only name `transform`, so the movement snaps).
   Every later plan follows the same naming rule.
2. **002** next. It edits `src/components/stitch-loader.tsx` around the line 001 touches (line 135),
   so apply it after 001 to avoid a conflict.
3. **003, 004, 005** in any order; they touch separate files (`dropdown.tsx`, `nav.tsx`, `bag-lines.tsx`)
   and do not depend on each other.

## Not planned (from the same audit)

- Scroll rail re-renders through React state on every scroll frame (`src/components/scroll-rail.tsx:34`), LOW.
- Duration tokens and a 40ms stagger for product grids, LOW.
- Missed opportunities: animated FAQ accordions, a pop on the bag count, a one-off seam on the order-confirmed page.
- Dropped after checking: "hover motion not gated for touch". Tailwind v4 already wraps `hover:` in
  `@media (hover: hover)`, confirmed in the compiled CSS.
