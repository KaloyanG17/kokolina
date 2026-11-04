"use client";

import { useFormStatus } from "react-dom";
import { Dropdown, type DropdownOption } from "@/components/dropdown";

export function PageHeader({ title, intro, children }: { title: string; intro?: string; children?: React.ReactNode }) {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex flex-col gap-2">
        <h1 className="heading-5 md:heading-4">{title}</h1>
        {intro && <p className="body-6 max-w-xl text-muted">{intro}</p>}
      </div>
      {children && <div className="flex flex-wrap gap-2">{children}</div>}
    </header>
  );
}

export function SubmitButton({
  children,
  pendingLabel = "Saving",
  className = "btn-primary",
  name,
  value,
}: {
  children: React.ReactNode;
  pendingLabel?: string;
  className?: string;
  name?: string;
  value?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" name={name} value={value} disabled={pending} aria-busy={pending} className={className}>
      {pending ? pendingLabel : children}
    </button>
  );
}

const inputClass =
  "body-6 w-full rounded-sm border bg-surface px-3 py-2 text-fg placeholder:text-muted transition-colors duration-300 ease-brand focus:outline-2 focus:outline-offset-2 focus:outline-ink";

export function Field({
  label,
  name,
  error,
  hint,
  as = "input",
  options = [],
  className = "",
  ...props
}: {
  label: string;
  name: string;
  error?: string;
  hint?: string;
  as?: "input" | "textarea" | "select";
  /** Choices when as is "select". */
  options?: DropdownOption[];
  className?: string;
  children?: React.ReactNode;
} & React.InputHTMLAttributes<HTMLInputElement> &
  React.TextareaHTMLAttributes<HTMLTextAreaElement> &
  React.SelectHTMLAttributes<HTMLSelectElement>) {
  const id = `f-${name}`;
  const describedBy = [error && `${id}-error`, hint && `${id}-hint`].filter(Boolean).join(" ") || undefined;
  const shared = {
    id,
    name,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": describedBy,
    // A lighter border in the dark theme so empty fields stay visible against the card
    className: `${inputClass} ${error ? "border-danger" : "border-line dark:border-faded/30"}`,
  };
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <label htmlFor={id} className="title-4">
        {label}
      </label>
      {as === "textarea" ? (
        <textarea {...shared} {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)} />
      ) : as === "select" ? (
        <Dropdown
          id={id}
          name={name}
          options={options}
          defaultValue={props.defaultValue === undefined ? undefined : String(props.defaultValue)}
          invalid={Boolean(error)}
          describedBy={describedBy}
        />
      ) : (
        <input {...shared} {...(props as React.InputHTMLAttributes<HTMLInputElement>)} />
      )}
      {hint && !error && (
        <p id={`${id}-hint`} className="caption-5 text-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="caption-4 text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

export function Notice({ tone = "info", children }: { tone?: "info" | "ok" | "error"; children: React.ReactNode }) {
  const styles = {
    info: "border-line bg-surface-2 text-fg",
    ok: "border-ink/40 bg-ink-soft text-ink",
    error: "border-danger/50 bg-surface text-danger",
  }[tone];
  return (
    <p role={tone === "error" ? "alert" : "status"} className={`body-5 rounded-sm border px-4 py-3 ${styles}`}>
      {children}
    </p>
  );
}
