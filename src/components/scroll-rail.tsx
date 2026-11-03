"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

/**
 * A seam down the right edge that replaces the native scrollbar. Thread is
 * sewn down the seam as the page scrolls, with the needle at the current
 * position. Drag or click the seam to scroll.
 */
export function ScrollRail() {
  const pathname = usePathname();
  const trackRef = useRef<HTMLDivElement>(null);
  const threadRef = useRef<HTMLDivElement>(null);
  const needleRef = useRef<HTMLDivElement>(null);
  const [scrollable, setScrollable] = useState(false);
  const [percent, setPercent] = useState(0);

  useEffect(() => {
    let frame = 0;

    const paint = () => {
      frame = 0;
      const track = trackRef.current;
      if (!track) return;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setScrollable(max > 8);
      const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      const h = track.clientHeight;
      threadRef.current?.style.setProperty("clip-path", `inset(0 0 ${(1 - p) * 100}% 0)`);
      needleRef.current?.style.setProperty("transform", `translate(-50%, ${p * h}px)`);
      setPercent(Math.round(p * 100));
    };
    // One scroll listener, throttled to a single paint per frame
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(paint);
    };

    paint();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    const ro = new ResizeObserver(schedule);
    ro.observe(document.body);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      ro.disconnect();
    };
  }, [pathname]);

  function scrollToPointer(clientY: number) {
    const track = trackRef.current;
    if (!track) return;
    const rect = track.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (clientY - rect.top) / rect.height));
    const max = document.documentElement.scrollHeight - window.innerHeight;
    window.scrollTo({ top: ratio * max, behavior: "instant" });
  }

  return (
    <div
      role="scrollbar"
      aria-controls="main"
      aria-orientation="vertical"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={percent}
      aria-label="Page scroll position"
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture(e.pointerId);
        scrollToPointer(e.clientY);
      }}
      onPointerMove={(e) => {
        if (e.currentTarget.hasPointerCapture(e.pointerId)) scrollToPointer(e.clientY);
      }}
      className={`group fixed bottom-4 right-0 top-24 z-30 w-6 cursor-grab touch-none select-none transition-opacity duration-500 ease-brand active:cursor-grabbing md:right-2 md:w-8 ${
        scrollable ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
    >
      {/* Spool at the top of the seam */}
      <svg viewBox="0 0 20 22" className="absolute -top-6 left-1/2 w-4 -translate-x-1/2 md:w-5" aria-hidden>
        <rect x="2" y="1" width="16" height="3" rx="1.5" fill="var(--color-ink-deep)" />
        <rect x="2" y="18" width="16" height="3" rx="1.5" fill="var(--color-ink-deep)" />
        <rect x="4.5" y="4" width="11" height="14" fill="var(--color-thread)" />
        <path d="M4.5 7 L15.5 6 M4.5 10 L15.5 9 M4.5 13 L15.5 12 M4.5 16 L15.5 15" stroke="#a8641c" strokeWidth="0.8" />
      </svg>

      <div ref={trackRef} className="absolute inset-y-0 left-1/2 -translate-x-1/2">
        {/* Empty seam: needle holes */}
        <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 border-l-2 border-dotted border-ink/30 transition-colors duration-300 ease-brand group-hover:border-ink/50" />
        {/* Sewn thread, revealed down to the scroll position */}
        <div
          ref={threadRef}
          className="absolute inset-y-0 left-1/2 -translate-x-1/2 border-l-[3px] border-dashed border-thread"
          style={{ clipPath: "inset(0 0 100% 0)" }}
        />
        {/* Needle, pointing down the seam, with thread trailing from its eye */}
        <div ref={needleRef} className="absolute left-0 top-0 will-change-transform" style={{ transform: "translate(-50%, 0)" }}>
          <div className="-translate-y-full">
          <svg
            viewBox="0 0 24 64"
            className="w-4 origin-bottom drop-shadow-[0_2px_2px_rgba(22,33,62,0.35)] transition-transform duration-300 ease-brand group-hover:scale-110 md:w-5"
            aria-hidden
          >
            <path d="M12 4 C2 14 4 26 11 34" fill="none" stroke="var(--color-thread)" strokeWidth="1.6" strokeLinecap="round" />
            <path d="M10.6 2 L11.2 54 L12 64 L12.8 54 L13.4 2 Q12 -1 10.6 2 Z" fill="#cfd5e2" stroke="#6b7387" strokeWidth="0.5" />
            <path d="M11.5 6 L11.8 52" stroke="#ffffff" strokeWidth="0.6" strokeLinecap="round" />
            <ellipse cx="12" cy="6" rx="0.8" ry="3" fill="var(--color-ink-deep)" />
          </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
