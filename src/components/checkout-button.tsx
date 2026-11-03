"use client";

import { useState } from "react";
import { LockSimple } from "@phosphor-icons/react";
import { useBag } from "./bag-provider";

/** Sends the bag to /api/checkout and redirects to Stripe Checkout. */
export function CheckoutButton({ className = "", label = "Checkout" }: { className?: string; label?: string }) {
  const { lines, checkoutEnabled } = useBag();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function go() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lines }),
      });
      const data = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
      if (!res.ok || !data.url) throw new Error(data.error ?? "Checkout could not start. Try again in a moment.");
      window.location.assign(data.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Checkout could not start. Try again in a moment.");
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={go}
        disabled={!checkoutEnabled || busy || lines.length === 0}
        aria-busy={busy}
        className={`btn-primary ${className}`}
      >
        <LockSimple size={16} weight="bold" aria-hidden />
        {busy ? "Opening checkout" : label}
      </button>
      {error && (
        <p role="alert" className="caption-4 text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
