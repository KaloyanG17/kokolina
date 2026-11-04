"use client";

import { Printer } from "@phosphor-icons/react";

export function PrintButton({ label }: { label: string }) {
  return (
    <button type="button" onClick={() => window.print()} className="btn-secondary button-sm">
      <Printer size={16} weight="bold" aria-hidden />
      {label}
    </button>
  );
}
