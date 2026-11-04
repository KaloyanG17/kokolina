"use client";

import { useActionState } from "react";
import { Notice, SubmitButton } from "@/components/admin/ui";
import { shipOrder } from "../../actions";

const inputClass =
  "body-6 w-full rounded-sm border border-line bg-surface px-3 py-2 text-fg placeholder:text-muted transition-colors duration-300 ease-brand focus:outline-2 focus:outline-offset-2 focus:outline-ink dark:border-faded/30";

/** Tracking details and the "on its way" email for one order. */
export function ShipForm({
  id,
  trackingNumber,
  trackingUrl,
  shipped,
  hasEmail,
}: {
  id: string;
  trackingNumber?: string | null;
  trackingUrl?: string | null;
  shipped: boolean;
  hasEmail: boolean;
}) {
  const [state, action] = useActionState(shipOrder, {});
  const e = state.errors ?? {};
  return (
    <form action={action} className="flex flex-col gap-3 rounded-sm border border-dashed border-line p-3 dark:border-faded/30">
      <input type="hidden" name="id" value={id} />
      {state.message && <Notice tone={state.ok ? "ok" : "error"}>{state.message}</Notice>}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1">
          <span className="caption-1 text-muted">Tracking number</span>
          <input name="tracking_number" defaultValue={trackingNumber ?? ""} className={`${inputClass} font-mono`} autoComplete="off" />
        </label>
        <label className="flex flex-col gap-1">
          <span className="caption-1 text-muted">Tracking link (optional)</span>
          <input
            name="tracking_url"
            type="url"
            defaultValue={trackingUrl ?? ""}
            placeholder="https://"
            aria-invalid={e.tracking_url ? true : undefined}
            className={`${inputClass} ${e.tracking_url ? "border-danger" : ""}`}
          />
          {e.tracking_url && <span className="caption-2 text-danger">{e.tracking_url}</span>}
        </label>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <label className="body-6 flex cursor-pointer items-center gap-2">
          <input type="checkbox" name="notify" defaultChecked={hasEmail && !shipped} disabled={!hasEmail} className="size-4 accent-[var(--color-ink)]" />
          {shipped ? "Email the customer again" : "Email the customer that it is on its way"}
        </label>
        <SubmitButton className="btn-primary button-sm px-3 py-1" pendingLabel="Saving">
          {shipped ? "Update tracking" : "Mark as shipped"}
        </SubmitButton>
      </div>
    </form>
  );
}
