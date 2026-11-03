"use client";

import { useEffect } from "react";
import { useBag } from "@/components/bag-provider";

/** Empties the bag once the order is paid. */
export function ClearBag() {
  const { ready, clear } = useBag();
  useEffect(() => {
    if (ready) clear();
  }, [ready, clear]);
  return null;
}
