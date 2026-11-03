"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { EnvelopeSimple, Image as ImageIcon, Package, Receipt, SquaresFour } from "@phosphor-icons/react";

const items = [
  { href: "/admin", label: "Overview", icon: SquaresFour },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/images", label: "Site pictures", icon: ImageIcon },
  { href: "/admin/orders", label: "Orders", icon: Receipt },
  { href: "/admin/newsletter", label: "Newsletter", icon: EnvelopeSimple },
];

export function AdminNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Admin">
      <ul className="flex gap-1 overflow-x-auto md:flex-col">
        {items.map(({ href, label, icon: Icon }) => {
          const current = href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
          return (
            <li key={href} className="shrink-0">
              <Link
                href={href}
                aria-current={current ? "page" : undefined}
                className={`title-4 focus-ring flex items-center gap-3 rounded-sm px-3 py-2 transition-colors duration-300 ease-brand ${
                  current ? "bg-ink-deep text-cotton" : "text-muted hover:bg-surface-2 hover:text-fg"
                }`}
              >
                <Icon size={18} weight={current ? "fill" : "regular"} aria-hidden />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
