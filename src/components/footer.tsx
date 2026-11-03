"use client";

import Link from "next/link";
import { useState } from "react";
import { site } from "@/data/site";
import { RailScene } from "./product-art";
import { Selvedge } from "./selvedge";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const columns: { title: string; items: { label: string; href: string }[] }[] = [
  {
    title: "Shop",
    items: [
      { label: "Shop all", href: "/shop" },
      { label: "Jeans", href: "/shop?category=Jeans" },
      { label: "Jackets", href: "/shop?category=Jackets" },
      { label: "Shirts", href: "/shop?category=Shirts" },
      { label: "Dresses", href: "/shop?category=Dresses" },
    ],
  },
  {
    title: "Help",
    items: [
      { label: "Your bag", href: "/bag" },
      { label: "How ordering works", href: "/#ordering" },
      { label: "Sizing and returns", href: "/#faq" },
      { label: "Terms of sale", href: "/terms" },
    ],
  },
  {
    title: "Studio",
    items: [
      { label: "Craft", href: "/#craft" },
      { label: "Privacy policy", href: "/privacy" },
      ...(site.contactEmail ? [{ label: "Email the studio", href: `mailto:${site.contactEmail}` }] : []),
      ...(site.instagram ? [{ label: "Instagram", href: site.instagram }] : []),
    ],
  },
];

export function Footer() {
  return (
    <footer className="denim relative mt-24">
      <Selvedge />
      <div className="relative px-4 pt-16 pb-12 md:px-8">
        <div className="relative mx-auto grid max-w-7xl grid-cols-2 gap-8 md:grid-cols-[1.4fr_1fr_1fr_1fr_1.6fr] md:gap-6">
          <div className="col-span-2 flex flex-col gap-2 md:col-span-1">
            <p className="label-tag patch title-3 self-start">&quot;{site.brand}&quot;</p>
            <p className="body-6 max-w-xs text-faded">
              Selvedge denim and workwear, cut in numbered lots in {site.city}.
            </p>
          </div>

          {columns.map((col) => (
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
          © {new Date().getFullYear()} {site.brand}. Made in {site.city}.
        </p>
      </div>
    </footer>
  );
}

const linkClass =
  "body-6 focus-ring rounded text-faded transition-colors duration-300 ease-brand hover:text-cotton focus-visible:outline-thread";

function Newsletter() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const value = email.trim();
    if (!value) return setError("Enter your email address.");
    if (!EMAIL_RE.test(value)) return setError("That email address looks incomplete. Check it and try again.");
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
      setError("We could not save your email. Try again in a moment.");
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate className="col-span-2 flex flex-col gap-3 md:col-span-1">
      <label htmlFor="newsletter-email" className="caption-3 font-mono uppercase tracking-widest text-thread">
        Hear about the next lot first
      </label>
      {status === "done" ? (
        <p role="status" className="body-5 rounded-md border border-faded/30 bg-indigo p-4 text-cotton">
          Thanks. We will email {email.trim()} when the next collection is ready.
        </p>
      ) : (
        <>
          <div
            className={`flex gap-2 rounded-sm border bg-cotton p-1 text-ink-deep transition-colors duration-300 ease-brand focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-thread ${
              error ? "border-danger" : "border-line"
            }`}
          >
            <input
              id="newsletter-email"
              type="email"
              autoComplete="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError(null);
              }}
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? "newsletter-error" : undefined}
              className="body-6 min-w-0 flex-1 rounded-sm bg-transparent px-3 placeholder:text-muted focus:outline-none"
            />
            <button type="submit" disabled={status === "sending"} className="btn-primary button-sm">
              {status === "sending" ? "Saving" : "Subscribe"}
            </button>
          </div>
          {error && (
            <p id="newsletter-error" role="alert" className="caption-4 text-[#ffb4a8]">
              {error}
            </p>
          )}
        </>
      )}
    </form>
  );
}
