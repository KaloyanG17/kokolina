"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { site } from "@/data/site";
import { useT } from "@/i18n/client";
import type { Dict } from "@/i18n/dictionaries";
import { RailScene } from "./product-art";
import { Selvedge } from "./selvedge";
import { Wordmark } from "./wordmark";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function footerColumns(t: Dict): { title: string; items: { label: string; href: string }[] }[] {
  return [
    {
      title: t.footer.shop,
      items: [
        { label: t.nav.shopAll, href: "/shop" },
        ...(["Jeans", "Jackets", "Shirts", "Dresses"] as const).map((c) => ({
          label: t.categories[c],
          href: `/shop?category=${c}`,
        })),
        { label: t.nav.exclusive, href: "/exclusive" },
      ],
    },
    {
      title: t.footer.help,
      items: [
        { label: t.nav.yourBag, href: "/bag" },
        { label: t.footer.ordering, href: "/#ordering" },
        { label: t.footer.sizing, href: "/#faq" },
        { label: t.footer.terms, href: "/terms" },
      ],
    },
    {
      title: t.footer.studio,
      items: [
        { label: t.footer.craft, href: "/#craft" },
        { label: t.footer.privacy, href: "/privacy" },
        ...(site.contactEmail ? [{ label: t.footer.email, href: `mailto:${site.contactEmail}` }] : []),
        ...(site.instagram ? [{ label: "Instagram", href: site.instagram }] : []),
      ],
    },
  ];
}

export function Footer() {
  const t = useT();
  return (
    <footer className="denim relative mt-24">
      <Selvedge />
      <div className="relative px-4 pt-16 pb-12 md:px-8">
        <div className="relative mx-auto grid max-w-7xl grid-cols-2 gap-8 md:grid-cols-[1.4fr_1fr_1fr_1fr_1.6fr] md:gap-6">
          <div className="col-span-2 flex flex-col gap-2 md:col-span-1">
            <p className="label-tag patch title-3 self-start"><Wordmark /></p>
            <p className="body-6 max-w-xs text-faded">
              {t.footer.blurb}
            </p>
          </div>

          {footerColumns(t).map((col) => (
            <nav key={col.title} aria-label={col.title} className="flex flex-col gap-3">
              <p className="caption-3 font-mono uppercase tracking-widest text-thread">{col.title}</p>
              <ul className="flex flex-col gap-2">
                {col.items.map((item) => (
                  <li key={item.label}>
                    <Link href={item.href} className={linkClass}>
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          <Newsletter />
        </div>
      </div>

      <div className="relative">
        <RailScene className="block h-64 w-full sm:h-auto" />
        <p className="caption-5 absolute bottom-4 left-4 w-fit rounded-sm bg-indigo-deep/85 px-3 py-2 font-mono text-faded backdrop-blur-sm md:left-8">
          {t.footer.copyright(new Date().getFullYear())}
        </p>
      </div>
    </footer>
  );
}

const linkClass =
  "body-6 focus-ring rounded text-faded transition-colors duration-300 ease-brand hover:text-cotton focus-visible:outline-thread";

export function Newsletter({ label, className = "col-span-2 flex flex-col gap-3 md:col-span-1" }: { label?: string; className?: string }) {
  const { newsletter: copy } = useT();
  const id = useId();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const value = email.trim();
    if (!value) return setError(copy.empty);
    if (!EMAIL_RE.test(value)) return setError(copy.invalid);
    setError(null);
    setStatus("sending");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: value }),
      });
      if (!res.ok) throw new Error();
      setStatus("done");
    } catch {
      setStatus("error");
      setError(copy.failed);
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate className={className}>
      <label htmlFor={`${id}-email`} className="caption-3 font-mono uppercase tracking-widest text-thread">
        {label ?? copy.label}
      </label>
      {status === "done" ? (
        <p role="status" className="body-5 rounded-md border border-faded/30 bg-indigo p-4 text-cotton">
          {copy.thanks(email.trim())}
        </p>
      ) : (
        <>
          <div
            className={`flex gap-2 rounded-sm border bg-cotton p-1 text-ink-deep transition-colors duration-300 ease-brand focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-thread ${
              error ? "border-danger" : "border-line"
            }`}
          >
            <input
              id={`${id}-email`}
              type="email"
              autoComplete="email"
              required
              placeholder={copy.placeholder}
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError(null);
              }}
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? `${id}-error` : undefined}
              className="body-6 min-w-0 flex-1 rounded-sm bg-transparent px-3 placeholder:text-muted focus:outline-none"
            />
            <button type="submit" disabled={status === "sending"} className="btn-primary button-sm">
              {status === "sending" ? copy.saving : copy.subscribe}
            </button>
          </div>
          {error && (
            <p id={`${id}-error`} role="alert" className="caption-4 text-[#ffb4a8]">
              {error}
            </p>
          )}
        </>
      )}
    </form>
  );
}
