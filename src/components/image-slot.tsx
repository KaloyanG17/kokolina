"use client";

import Image from "next/image";
import { useState } from "react";
import { ImageSquare } from "@phosphor-icons/react";

/**
 * Shows the photo once loaded (with a skeleton until then),
 * or a labelled empty slot while no photo has been added yet.
 */
export function ImageSlot({
  src,
  alt,
  label,
  className = "",
  sizes = "100vw",
  priority = false,
}: {
  src: string | null;
  alt: string;
  label: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
}) {
  const [loaded, setLoaded] = useState(false);

  if (!src) {
    return (
      <div
        role="img"
        aria-label={`${label} goes here`}
        className={`flex flex-col items-center justify-center gap-2 bg-surface-2 text-muted ${className}`}
      >
        <ImageSquare size={24} aria-hidden />
        <span className="caption-4">{label}</span>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden bg-surface-2 ${className}`}>
      {!loaded && <div aria-hidden className="skeleton absolute inset-0" />}
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        onLoad={() => setLoaded(true)}
        className={`object-cover transition-opacity duration-500 ease-brand ${
          loaded ? "opacity-100" : "opacity-0"
        }`}
      />
    </div>
  );
}
