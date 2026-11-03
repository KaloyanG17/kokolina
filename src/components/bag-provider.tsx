"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { products, type Product } from "@/data/products";

export type BagLine = { productId: string; size: string; qty: number };

type BagContextValue = {
  lines: BagLine[];
  count: number;
  ready: boolean;
  isOpen: boolean;
  open: () => void;
  close: () => void;
  add: (product: Product, size: string) => void;
  setQty: (productId: string, size: string, qty: number) => void;
  remove: (productId: string, size: string) => void;
  toast: string | null;
};

const BagContext = createContext<BagContextValue | null>(null);
const STORAGE_KEY = "bag:v2";

export function BagProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<BagLine[]>([]);
  const [ready, setReady] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as BagLine[];
        // Drop lines for products that no longer exist
        setLines(parsed.filter((l) => products.some((p) => p.slug === l.productId)));
      }
    } catch {
      // Storage blocked or corrupt: start with an empty bag
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    } catch {
      // Ignore: the bag still works for this visit
    }
  }, [lines, ready]);

  const showToast = useCallback((message: string) => {
    setToast(message);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3200);
  }, []);

  const add = useCallback(
    (product: Product, size: string) => {
      setLines((prev) => {
        const existing = prev.find((l) => l.productId === product.slug && l.size === size);
        if (existing) {
          return prev.map((l) => (l === existing ? { ...l, qty: l.qty + 1 } : l));
        }
        return [...prev, { productId: product.slug, size, qty: 1 }];
      });
      showToast(`${product.name}, size ${size}, added to your bag`);
      setIsOpen(true);
    },
    [showToast],
  );

  const setQty = useCallback((productId: string, size: string, qty: number) => {
    setLines((prev) =>
      qty <= 0
        ? prev.filter((l) => !(l.productId === productId && l.size === size))
        : prev.map((l) => (l.productId === productId && l.size === size ? { ...l, qty } : l)),
    );
  }, []);

  const remove = useCallback((productId: string, size: string) => {
    setLines((prev) => prev.filter((l) => !(l.productId === productId && l.size === size)));
  }, []);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  const value = useMemo<BagContextValue>(
    () => ({
      lines,
      count: lines.reduce((n, l) => n + l.qty, 0),
      ready,
      isOpen,
      open,
      close,
      add,
      setQty,
      remove,
      toast,
    }),
    [lines, ready, isOpen, open, close, add, setQty, remove, toast],
  );

  return <BagContext.Provider value={value}>{children}</BagContext.Provider>;
}

export function useBag() {
  const ctx = useContext(BagContext);
  if (!ctx) throw new Error("useBag must be used inside BagProvider");
  return ctx;
}
