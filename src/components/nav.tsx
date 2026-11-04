"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { Handbag, MagnifyingGlass } from "@phosphor-icons/react";
import { useT } from "@/i18n/client";
import type { Dict } from "@/i18n/dictionaries";
import { useBag } from "./bag-provider";
import { LanguageSwitch } from "./language-switch";
import { ThemeToggle } from "./theme-toggle";
import { Wordmark } from "./wordmark";

/** `mark` links show the red dot wordmark in place of their label, which stays for screen readers. */
type NavLink = { key: string; href: string; label: string; mark?: boolean };

const CATEGORY_LINKS = ["Jeans", "Jackets", "Shirts"] as const;

function navLinks(t: Dict): NavLink[] {
  return [
    { key: "shop", href: "/shop", label: t.nav.shopAll },
    ...CATEGORY_LINKS.map((c) => ({ key: c, href: `/shop?category=${c}`, label: t.categories[c] })),
    { key: "exclusive", href: "/exclusive", label: t.nav.exclusive, mark: true },
  ];
}

function menuOnlyLinks(t: Dict): NavLink[] {
  return [
    { key: "bag", href: "/bag", label: t.nav.yourBag },
    { key: "faq", href: "/#faq", label: t.nav.questions },
  ];
}

function LinkLabel({ link }: { link: NavLink }) {
  if (!link.mark) return <>{link.label}</>;
  return (
    <>
      <span className="sr-only">{link.label}</span>
      <Wordmark dot="red" className="[&>.sr-only]:hidden" />
    </>
  );
}

/** Works out which nav item is current. Reads the URL, so it renders inside Suspense. */
function useActiveKey() {
  const pathname = usePathname();
  const params = useSearchParams();
  if (pathname === "/bag") return "bag";
  if (pathname === "/exclusive") return "exclusive";
  if (pathname !== "/shop") return null;
  const category = params.get("category");
  return category && (CATEGORY_LINKS as readonly string[]).includes(category) ? category : "shop";
}

function DesktopLinks({ active }: { active: string | null }) {
  const links = navLinks(useT());
  return (
    <ul className="hidden items-center gap-1 lg:flex">
      {links.map((l) => (
        <li key={l.key}>
          <Link
            href={l.href}
            aria-current={active === l.key ? "page" : undefined}
            className={`title-4 focus-ring flex items-center gap-1.5 rounded-sm px-3 py-2 uppercase tracking-wide transition-colors duration-300 ease-brand hover:bg-surface-3 hover:text-fg ${
              active === l.key ? "bg-surface-3 text-fg" : "text-muted"
            }`}
          >
            <LinkLabel link={l} />
          </Link>
        </li>
      ))}
    </ul>
  );
}

function ActiveDesktopLinks() {
  return <DesktopLinks active={useActiveKey()} />;
}

function MenuLinks({ active, open, onPick }: { active: string | null; open: boolean; onPick: () => void }) {
  const t = useT();
  return (
    <ul className="flex h-full flex-col justify-center gap-4 px-6">
      {[...navLinks(t), ...menuOnlyLinks(t)].map((l, i) => (
        <li
          key={l.key}
          style={{ transitionDelay: open ? `${Math.min(i * 60, 400)}ms` : "0ms" }}
          className={`transition-[opacity,transform] duration-500 ease-brand ${
            open ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
          }`}
        >
          <Link
            href={l.href}
            onClick={onPick}
            aria-current={active === l.key ? "page" : undefined}
            className={`heading-4 focus-ring flex items-center gap-3 rounded-lg py-2 ${active === l.key ? "text-ink" : "text-muted"}`}
          >
            <LinkLabel link={l} />
          </Link>
        </li>
      ))}
      <li
        style={{ transitionDelay: open ? "400ms" : "0ms" }}
        className={`pt-4 transition-[opacity,transform] duration-500 ease-brand ${open ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"}`}
      >
        <LanguageSwitch className="w-fit" />
      </li>
    </ul>
  );
}

function ActiveMenuLinks(props: { open: boolean; onPick: () => void }) {
  return <MenuLinks active={useActiveKey()} {...props} />;
}

export function Nav() {
  const t = useT();
  const pathname = usePathname();
  const { count, ready, open: openBag } = useBag();
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);

  useEffect(() => setMenuOpen(false), [pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  return (
    <>
      <header className="fixed inset-x-0 top-4 z-50 flex justify-center px-4">
        <nav
          aria-label={t.nav.main}
          className="flex items-center gap-1 rounded-lg border border-line bg-surface/80 p-1 backdrop-blur-md"
        >
          <Link
            href="/"
            aria-current={pathname === "/" ? "page" : undefined}
            className="label-tag patch title-4 focus-ring mr-1 transition-transform duration-300 ease-brand hover:-rotate-2 md:mr-3"
          >
            <Wordmark />
          </Link>

          <Suspense fallback={<DesktopLinks active={null} />}>
            <ActiveDesktopLinks />
          </Suspense>

          <ThemeToggle />
          <LanguageSwitch className="mx-1 hidden sm:flex" />

          <Link
            href="/shop"
            aria-label={t.nav.search}
            className="focus-ring hidden size-10 items-center justify-center rounded-sm text-muted transition-colors duration-300 ease-brand hover:bg-surface-3 hover:text-fg sm:flex"
          >
            <MagnifyingGlass size={18} aria-hidden />
          </Link>

          <button
            type="button"
            onClick={openBag}
            className="btn-primary button-sm"
          >
            <Handbag size={16} weight="bold" aria-hidden />
            <span>{t.nav.bag}</span>
            <span className="sr-only">{t.nav.items(count)}</span>
            <span
              aria-hidden
              className={`min-w-4 text-center tabular-nums transition-opacity duration-300 ease-brand ${
                ready ? "opacity-100" : "opacity-0"
              }`}
            >
              {count}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={menuOpen ? t.nav.closeMenu : t.nav.openMenu}
            className="focus-ring relative flex size-10 items-center justify-center rounded-sm transition-colors duration-300 ease-brand hover:bg-surface-3 lg:hidden"
          >
            <span
              aria-hidden
              className={`absolute h-0.5 w-4 rounded-full bg-fg transition-transform duration-500 ease-brand ${
                menuOpen ? "rotate-45" : "-translate-y-1"
              }`}
            />
            <span
              aria-hidden
              className={`absolute h-0.5 w-4 rounded-full bg-fg transition-transform duration-500 ease-brand ${
                menuOpen ? "-rotate-45" : "translate-y-1"
              }`}
            />
          </button>
        </nav>
      </header>

      <div
        id="mobile-menu"
        inert={!menuOpen}
        className={`fixed inset-0 z-40 bg-base/90 backdrop-blur-xl transition-opacity duration-500 ease-brand lg:hidden ${
          menuOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <Suspense fallback={<MenuLinks active={null} open={menuOpen} onPick={closeMenu} />}>
          <ActiveMenuLinks open={menuOpen} onPick={closeMenu} />
        </Suspense>
      </div>
    </>
  );
}
