"use client";

import { useActionState } from "react";
import { Field, Notice, SubmitButton } from "@/components/admin/ui";
import { sendNewsletterAction } from "../../actions";

export function NewsletterForm({ subscriberCount, adminEmail }: { subscriberCount: number; adminEmail: string }) {
  const [state, action] = useActionState(sendNewsletterAction, {});
  const e = state.errors ?? {};

  return (
    <form action={action} className="flex flex-col gap-4 rounded-md border border-line bg-surface p-6" noValidate>
      <h2 className="title-2">Write a newsletter</h2>
      <Field label="Subject" name="subject" error={e.subject} placeholder="Lot 015 is on the cutting table" required />
      <Field
        label="Message"
        name="body"
        as="textarea"
        rows={10}
        error={e.body}
        hint="Plain text. Leave a blank line between paragraphs. The Kokolina label, footer and unsubscribe link are added for you."
        required
      />
      <label className="body-5 flex cursor-pointer items-start gap-2">
        <input type="checkbox" name="confirm" className="mt-1 size-4 accent-[var(--color-ink)]" aria-describedby={e.confirm ? "confirm-error" : undefined} />
        I want to send this to all {subscriberCount} subscriber{subscriberCount === 1 ? "" : "s"}
      </label>
      {e.confirm && (
        <p id="confirm-error" className="caption-4 text-danger">
          {e.confirm}
        </p>
      )}
      {state.message && <Notice tone={state.ok ? "ok" : "error"}>{state.message}</Notice>}
      <div className="flex flex-wrap gap-2">
        <SubmitButton name="mode" value="test" className="btn-secondary" pendingLabel="Sending test">
          Send a test to {adminEmail}
        </SubmitButton>
        <SubmitButton name="mode" value="all" pendingLabel="Sending">
          Send to subscribers
        </SubmitButton>
      </div>
    </form>
  );
}
