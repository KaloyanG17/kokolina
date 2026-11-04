import { site } from "@/data/site";

/**
 * KOKOLINA with a dot over the I. The everyday mark uses the İ glyph, so the
 * dot sits where the font designed it. The exclusive mark sets a plain I under
 * a larger red dot that still reads at menu size.
 */
export function Wordmark({ dot = "white", className = "" }: { dot?: "white" | "red"; className?: string }) {
  const word = site.brand.toUpperCase();
  const i = word.indexOf("I");
  return (
    <span className={className}>
      <span className="sr-only">{site.brand}</span>
      <span aria-hidden className="whitespace-nowrap">
        {word.slice(0, i)}
        {dot === "red" ? (
          <span className="relative inline-block leading-none">
            I
            <span className="absolute left-1/2 top-[-0.1em] size-[0.22em] min-h-1 min-w-1 -translate-x-1/2 rounded-full bg-dot" />
          </span>
        ) : (
          "İ"
        )}
        {word.slice(i + 1)}
      </span>
    </span>
  );
}
