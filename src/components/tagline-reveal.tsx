"use client";

import { useEffect, useRef } from "react";

const lines = ["Fewer pairs,", "worn for longer.", "Denim that fades", "to fit only you."];

/**
 * Each word goes from muted to full opacity as it crosses a trigger line
 * at 60% of the viewport height, in reading order.
 */
export function TaglineReveal() {
  const ref = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const words = ref.current?.querySelectorAll<HTMLSpanElement>("[data-word]");
    if (!words) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      words.forEach((w) => (w.dataset.on = "true"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const el = entry.target as HTMLSpanElement;
          // Lit once the word is above the trigger line, dimmed again if scrolled back below it
          el.dataset.on = String(entry.isIntersecting || entry.boundingClientRect.top < 0);
        }
      },
      { rootMargin: "0px 0px -40% 0px", threshold: 1 },
    );
    words.forEach((w) => observer.observe(w));
    return () => observer.disconnect();
  }, []);

  return (
    <section aria-label="What we stand for" className="denim px-4 py-24 md:px-8">
      <div className="mx-auto max-w-7xl py-12">
        <h2 ref={ref} className="heading-3 md:heading-1 max-w-[680px]">
          {lines.map((line, li) => (
            <span key={li} className="block">
              {line.split(" ").map((word, wi) => (
                <span key={wi}>
                  <span
                    data-word
                    data-on="false"
                    className="opacity-30 transition-opacity duration-500 ease-brand data-[on=true]:opacity-100"
                  >
                    {word}
                  </span>{" "}
                </span>
              ))}
            </span>
          ))}
        </h2>
      </div>
    </section>
  );
}
