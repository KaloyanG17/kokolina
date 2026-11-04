"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { CheckCircle, Handbag, X } from "@phosphor-icons/react";
import { formatPrice } from "@/lib/format";
import { useT } from "@/i18n/client";
import { useBag } from "./bag-provider";
import { BagLines, BagSkeleton, FreeShippingBar, useBagItems } from "./bag-lines";
import { CheckoutButton } from "./checkout-button";

/** Sidebar bag. Opens from the nav and whenever a piece is added. */
export function BagDrawer() {
  const { bag } = useT();
  const { ready, isOpen, close, toast, checkoutEnabled } = useBag();
  const { items, subtotal } = useBagItems();
  const closeRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();

  // Close when navigating to another page
  useEffect(() => close(), [pathname, close]);

  useEffect(() => {
    if (!isOpen) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, close]);

  return (
    <>
      <div
        aria-hidden
        onClick={close}
        className={`fixed inset-0 z-[60] bg-ink-deep/40 backdrop-blur-sm transition-opacity duration-500 ease-brand ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="bag-title"
        inert={!isOpen}
        className={`fixed inset-y-0 right-0 z-[70] flex w-full max-w-md flex-col border border-line bg-base transition-transform duration-500 ease-brand ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-6 pb-4">
          <h2 id="bag-title" className="heading-6">
            {bag.title}
          </h2>
          <button
            ref={closeRef}
            type="button"
            onClick={close}
            aria-label={bag.close}
            className="focus-ring flex size-10 items-center justify-center rounded-sm transition-[background-color,scale] duration-150 ease-brand hover:bg-surface-3 active:scale-[0.98]"
          >
            <X size={20} aria-hidden />
          </button>
        </div>

        <div role="status" aria-live="polite" className="px-6">
          {toast && (
            <p className="body-5 mb-4 flex items-center gap-2 rounded-sm bg-ink-soft px-3 py-2 text-ink">
              <CheckCircle size={18} weight="fill" aria-hidden />
              {toast}
            </p>
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-6 pb-6">
          {!ready ? (
            <BagSkeleton />
          ) : items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-4 pb-24 text-center">
              <div className="flex size-12 items-center justify-center rounded-full bg-surface-3">
                <Handbag size={24} aria-hidden />
              </div>
              <div className="flex flex-col gap-1">
                <p className="title-2">{bag.emptyTitle}</p>
                <p className="body-6 max-w-64 text-muted">{bag.emptyDrawer}</p>
              </div>
              <Link href="/shop" onClick={close} className="btn-primary">
                {bag.browse}
              </Link>
            </div>
          ) : (
            <BagLines onNavigate={close} />
          )}
        </div>

        {ready && items.length > 0 && (
          <div className="flex flex-col gap-3 bg-surface-2 p-6">
            <FreeShippingBar subtotal={subtotal} />
            <div className="flex items-center justify-between">
              <span className="body-5 text-muted">{bag.subtotal}</span>
              <span className="title-3 tabular-nums">{formatPrice(subtotal)}</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Link href="/bag" onClick={close} className="btn-secondary">
                {bag.viewBag}
              </Link>
              <CheckoutButton className="w-full" />
            </div>
            <p className="caption-5 text-center text-muted">
              {checkoutEnabled ? bag.secure : bag.notConnected}
            </p>
          </div>
        )}
      </aside>
    </>
  );
}
