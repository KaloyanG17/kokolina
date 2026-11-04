"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { LOCALE_COOKIE, locales, type Locale } from "@/i18n/config";
import { useLocale, useT } from "@/i18n/client";

const names: Record<Locale, string> = { bg: "Български", en: "English" };

/** BG | EN switch. Saves the choice for a year and re-renders the page in that language. */
export function LanguageSwitch({ className = "" }: { className?: string }) {
  const current = useLocale();
  const t = useT();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function choose(locale: Locale) {
    if (locale === current) return;
    document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=31536000; samesite=lax`;
    document.documentElement.lang = locale;
    startTransition(() => router.refresh());
  }

  return (
    <div
      role="group"
      aria-label={t.nav.language}
      aria-busy={pending}
      className={`flex items-center rounded-sm border border-line p-0.5 ${pending ? "opacity-60" : ""} ${className}`}
    >
      {locales.map((l) => (
        <button
          key={l}
          type="button"
          lang={l}
          aria-label={names[l]}
          aria-pressed={l === current}
          onClick={() => choose(l)}
          className={`caption-3 focus-ring h-8 min-w-8 rounded-[2px] px-1.5 font-mono uppercase tracking-wider transition-colors duration-300 ease-brand ${
            l === current ? "bg-fg text-surface" : "text-muted hover:bg-surface-3 hover:text-fg"
          }`}
        >
          {l}
        </button>
      ))}
    </div>
  );
}
