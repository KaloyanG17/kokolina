"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useT } from "@/i18n/client";

const KEY = "analytics-consent";

let started = false;

/**
 * Loads and starts PostHog. Only called after consent, so visitors who
 * decline never download the analytics bundle.
 */
async function startAnalytics() {
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!key || started) return;
  started = true;
  const { default: posthog } = await import("posthog-js");
  posthog.init(key, {
    // Sent through our own domain (see next.config.ts) so ad blockers do not drop it
    api_host: "/ingest",
    ui_host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://eu.posthog.com",
    person_profiles: "identified_only",
    capture_pageview: "history_change",
    session_recording: {
      maskAllInputs: true,
      maskTextSelector: "[data-ph-mask]",
    },
  });
}

/** Asks once before analytics and session replay may run. The choice is remembered on this device. */
export function ConsentBanner() {
  const { consent } = useT();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) return;
    let choice: string | null = null;
    try {
      choice = localStorage.getItem(KEY);
    } catch {
      // Storage blocked: ask each visit
    }
    if (choice === "granted") void startAnalytics();
    else if (!choice) setShow(true);
  }, []);

  function decide(granted: boolean) {
    try {
      localStorage.setItem(KEY, granted ? "granted" : "denied");
    } catch {
      // Ignore: the choice still applies to this visit
    }
    if (granted) void startAnalytics();
    setShow(false);
  }

  if (!show) return null;

  return (
    <div
      role="dialog"
      aria-label={consent.label}
      className="fixed inset-x-4 bottom-4 z-[90] mx-auto flex max-w-xl flex-col gap-4 rounded-md border border-line bg-surface p-4 shadow-[6px_6px_0_0_var(--color-surface-3)] sm:flex-row sm:items-center"
    >
      <p className="body-6 flex-1 text-muted">
        {consent.text}{" "}
        <Link href="/privacy" className="text-ink underline underline-offset-4">
          {consent.privacy}
        </Link>
      </p>
      <div className="flex gap-2">
        <button type="button" onClick={() => decide(false)} className="btn-secondary button-sm">
          {consent.decline}
        </button>
        <button type="button" onClick={() => decide(true)} className="btn-primary button-sm">
          {consent.accept}
        </button>
      </div>
    </div>
  );
}
