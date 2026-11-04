"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Re-fetches the server rendered page every few seconds while the tab is
 * visible, and straight away when it regains focus, so new orders appear
 * without reloading.
 */
export function LiveRefresh({ seconds = 5 }: { seconds?: number }) {
  const router = useRouter();
  useEffect(() => {
    const refresh = () => {
      if (document.visibilityState === "visible") router.refresh();
    };
    const timer = setInterval(refresh, seconds * 1000);
    document.addEventListener("visibilitychange", refresh);
    window.addEventListener("focus", refresh);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", refresh);
      window.removeEventListener("focus", refresh);
    };
  }, [router, seconds]);

  return (
    <p className="caption-5 flex items-center gap-2 font-mono uppercase tracking-wide text-muted">
      <span className="size-2 animate-pulse rounded-full bg-thread" aria-hidden />
      Live, updates every {seconds}s
    </p>
  );
}
