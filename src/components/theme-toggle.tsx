"use client";

import { Moon, Sun } from "@phosphor-icons/react";

/**
 * Switches between the cotton (light) and indigo night (dark) themes.
 * The layout script sets data-theme before paint; this only flips it and
 * remembers the choice. Icons swap with CSS, so there is no hydration flash.
 */
export function ThemeToggle({ className = "" }: { className?: string }) {
  function toggle() {
    const root = document.documentElement;
    const next = root.dataset.theme === "dark" ? "light" : "dark";
    root.dataset.theme = next;
    try {
      localStorage.setItem("theme", next);
    } catch {
      // Storage blocked: the theme still changes for this visit
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Switch between light and dark theme"
      className={`focus-ring relative flex size-10 items-center justify-center overflow-hidden rounded-sm text-muted transition-[background-color,color,transform] duration-300 ease-brand hover:bg-surface-3 hover:text-fg active:scale-[0.98] ${className}`}
    >
      <Moon
        size={18}
        weight="bold"
        aria-hidden
        className="absolute transition-[transform,opacity] duration-500 ease-brand dark:translate-y-6 dark:-rotate-90 dark:opacity-0"
      />
      <Sun
        size={18}
        weight="bold"
        aria-hidden
        className="absolute -translate-y-6 rotate-90 opacity-0 transition-[transform,opacity] duration-500 ease-brand dark:translate-y-0 dark:rotate-0 dark:opacity-100"
      />
    </button>
  );
}
