"use client";

import Image from "next/image";
import { useActionState } from "react";
import { Field, Notice, SubmitButton } from "@/components/admin/ui";
import { saveSiteImage } from "../../actions";

export function SiteImageForm({ slot }: { slot: { key: string; label: string; alt: string; url?: string } }) {
  const [state, action] = useActionState(saveSiteImage, {});
  return (
    <form action={action} className="flex h-full flex-col gap-4 rounded-md border border-line bg-surface p-4">
      <input type="hidden" name="key" value={slot.key} />
      <div className="flex flex-col gap-1">
        <p className="title-3">{slot.label}</p>
        <p className="caption-5 font-mono text-muted">{slot.key}</p>
      </div>
      <div className="relative aspect-video overflow-hidden rounded-sm border border-line bg-surface-2">
        {slot.url ? (
          <Image src={slot.url} alt={slot.alt || slot.label} fill sizes="(min-width: 768px) 40vw, 100vw" className="object-cover" />
        ) : (
          <p className="caption-4 absolute inset-0 flex items-center justify-center text-muted">Using the engraving</p>
        )}
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor={`file-${slot.key}`} className="title-4">
          {slot.url ? "Replace picture" : "Upload picture"}
        </label>
        <input
          id={`file-${slot.key}`}
          name="file"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          className="body-6 file:mr-3 file:rounded-sm file:border-0 file:bg-ink-deep file:px-3 file:py-2 file:text-cotton"
        />
        {state.errors?.file && <p className="caption-4 text-danger">{state.errors.file}</p>}
      </div>
      <Field label="Description for screen readers" name="alt" defaultValue={slot.alt} />
      {state.message && <Notice tone={state.ok ? "ok" : "error"}>{state.message}</Notice>}
      <div className="mt-auto flex gap-2">
        <SubmitButton name="intent" value="save">
          Save
        </SubmitButton>
        {slot.url && (
          <SubmitButton name="intent" value="clear" className="btn-secondary" pendingLabel="Removing">
            Remove picture
          </SubmitButton>
        )}
      </div>
    </form>
  );
}
