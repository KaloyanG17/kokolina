/** A selvedge edge used as a divider: clean cotton band with the red identification line. */
export function Selvedge({ className = "" }: { className?: string }) {
  return (
    <div aria-hidden className={`relative h-4 bg-cotton ${className}`}>
      <div className="absolute inset-x-0 top-1/2 h-0.5 -translate-y-1/2 bg-selvedge" />
      <div className="absolute inset-x-0 top-0.5 border-t border-dotted border-ink/30" />
      <div className="absolute inset-x-0 bottom-0.5 border-t border-dotted border-ink/30" />
    </div>
  );
}
