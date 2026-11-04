# 002 — Show the loading screen once per session, not on every page load

- **Status**: DONE
- **Commit**: 9ca5868
- **Severity**: HIGH
- **Category**: Purpose & frequency
- **Estimated scope**: 3 files, about 15 lines

## Problem

`LoadingScreen` covers the whole store for at least one stitch cycle (2.6s) on **every full
page load**: first visit, every refresh, and every arrival from an outside link (order
confirmation email, Google result, Instagram, the Stripe "back" button). The intro is a brand
moment that earns its time once; on repeat loads it only delays the page the visitor came for.

```tsx
// src/components/stitch-loader.tsx:104-127 — current
/**
 * Full screen loader shown on every page load. Stays at least one stitch
 * cycle so the animation reads, then lifts away.
 */
export function LoadingScreen() {
  const { loader } = useT();
  const [phase, setPhase] = useState<"show" | "leaving" | "gone">("show");

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const minTime = new Promise((r) => setTimeout(r, reduce ? 500 : CYCLE * 1000));
    const loaded = new Promise((r) =>
      document.readyState === "complete" ? r(null) : window.addEventListener("load", () => r(null), { once: true }),
    );
    let t: ReturnType<typeof setTimeout>;
    Promise.all([minTime, loaded]).then(() => {
      setPhase("leaving");
      // Lets the hero start sewing as the loader lifts
      (window as Window & { __kokolinaLoaded?: boolean }).__kokolinaLoaded = true;
      window.dispatchEvent(new Event("kokolina:loaded"));
      t = setTimeout(() => setPhase("gone"), 700);
    });
    return () => clearTimeout(t);
  }, []);
```

The screen is server rendered, so the client cannot simply skip it without a flash: the
decision must be made before first paint, the same way the theme already is.

```tsx
// src/app/layout.tsx:49 and :55-60 — current (theme decided before paint)
const themeScript = `(function(){var d=document.documentElement, ... })()`;
...
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <noscript>
          <style>{"#loading-screen{display:none}"}</style>
        </noscript>
      </head>
```

## Target

- First full load in a browser session: unchanged (loader shows, at least 2.6s, lifts away, hero starts sewing).
- Every later full load in the same session (refresh, links back into the site): no loader at all, not even one frame;
  the hero still starts sewing straight away.
- A new session (new tab after closing the browser, or another device) sees the intro once again.
- Session flag: `sessionStorage` key `kokolina-intro`, value `"1"`, read before paint into
  `document.documentElement.dataset.intro = "seen"`.

```css
/* target, src/app/globals.css (unlayered, next to the existing html rules) */
[data-intro="seen"] #loading-screen {
  display: none;
}
```

## Repo conventions to follow

- Pre-paint decisions live as inline scripts in `src/app/layout.tsx` (exemplar: `themeScript`, line 49),
  each wrapped in `try { … } catch (e) {}` because storage can be blocked.
- The hero listens for `window.__kokolinaLoaded` / the `kokolina:loaded` event
  (`src/components/denim-back.tsx:107-113`); keep firing both so the sewing still starts.

## Steps

1. `src/app/layout.tsx`: below `themeScript`, add
   ```ts
   // Runs before paint: hides the intro loader after the first visit of the session
   const introScript = `(function(){try{if(sessionStorage.getItem("kokolina-intro"))document.documentElement.dataset.intro="seen"}catch(e){}})()`;
   ```
   and in `<head>`, directly after the theme script tag, add
   `<script dangerouslySetInnerHTML={{ __html: introScript }} />`.
2. `src/app/globals.css`: add the `[data-intro="seen"] #loading-screen { display: none; }` rule from Target
   outside any `@layer`, next to the other `html` rules.
3. `src/components/stitch-loader.tsx`, inside the `useEffect` of `LoadingScreen`, at the very top:
   ```ts
   // Already seen this session: no intro, start the hero straight away
   if (document.documentElement.dataset.intro === "seen") {
     (window as Window & { __kokolinaLoaded?: boolean }).__kokolinaLoaded = true;
     window.dispatchEvent(new Event("kokolina:loaded"));
     setPhase("gone");
     return;
   }
   ```
4. Same effect, inside the `Promise.all(...).then(() => {` callback, as its first line:
   ```ts
   try {
     sessionStorage.setItem("kokolina-intro", "1");
   } catch {
     // Storage blocked: the intro will show again next load
   }
   ```
5. Update the JSDoc above `LoadingScreen` to: "Full screen loader shown on the first page load of a
   session. Stays at least one stitch cycle so the animation reads, then lifts away."

## Boundaries

- Do NOT change the loader's look, the stitch keyframes, `CYCLE`, or the 700ms exit (plan 001 edits the exit's transition list on line 135; apply 001 first or keep its change).
- Do NOT use cookies or localStorage (the intro should return in a new session).
- Do NOT touch `src/components/denim-back.tsx`.
- If the quoted code does not match (drift since 9ca5868), STOP and report.

## Verification

- **Mechanical**: `npx tsc --noEmit`, `npx eslint src` and `npm run build` all succeed.
- **Feel check** (`npm run dev`):
  - Open a fresh private window at `/`: the denim loader shows, lifts away, and the hero starts sewing.
  - Press reload: the page appears immediately with no loader frame, and the hero still sews.
  - Click into a product and reload there: no loader.
  - Close the private window, open a new one: the loader shows once again.
  - In DevTools → Application → Session storage, `kokolina-intro` is `1` after the first load.
  - With storage blocked (DevTools → Application → block third-party/all storage), the site still loads; the loader simply shows each time.
- **Done when**: only the first load of a session shows the intro, with no flash of it on later loads.
