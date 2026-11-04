"use client";

import { useEffect, useId, useRef, useState } from "react";
import { CaretDown, Check } from "@phosphor-icons/react";

export type DropdownOption = { value: string; label: string };

/**
 * A themed select: a square label button that opens a stitched card of
 * options. Follows the select-only combobox pattern, so it works with the
 * keyboard (arrows, Home, End, Enter, Escape, type to jump) and screen
 * readers. With `name` it submits its value in forms like a native select.
 */
export function Dropdown({
  options,
  value: controlled,
  defaultValue,
  onChange,
  name,
  id,
  label,
  invalid,
  describedBy,
  className = "",
}: {
  options: DropdownOption[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  /** Submits the value under this name in a form. */
  name?: string;
  id?: string;
  /** Accessible name when there is no visible <label htmlFor>. */
  label?: string;
  invalid?: boolean;
  describedBy?: string;
  className?: string;
}) {
  const auto = useId();
  const buttonId = id ?? `${auto}-button`;
  const listId = `${auto}-list`;
  const [own, setOwn] = useState(defaultValue ?? options[0]?.value ?? "");
  const value = controlled ?? own;
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const typed = useRef({ text: "", at: 0 });

  const selectedIndex = Math.max(0, options.findIndex((o) => o.value === value));
  const selected = options[selectedIndex];

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [open]);

  useEffect(() => {
    if (open) document.getElementById(`${listId}-${active}`)?.scrollIntoView({ block: "nearest" });
  }, [open, active, listId]);

  function show() {
    setActive(selectedIndex);
    setOpen(true);
  }

  function choose(i: number) {
    const next = options[i]?.value;
    setOpen(false);
    buttonRef.current?.focus();
    if (next === undefined || next === value) return;
    if (controlled === undefined) setOwn(next);
    onChange?.(next);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLButtonElement>) {
    const last = options.length - 1;
    const move = (i: number) => {
      e.preventDefault();
      if (!open) show();
      setActive(Math.min(last, Math.max(0, i)));
    };
    switch (e.key) {
      case "ArrowDown":
        return open ? move(active + 1) : move(selectedIndex);
      case "ArrowUp":
        return open ? move(active - 1) : move(selectedIndex);
      case "Home":
        return move(0);
      case "End":
        return move(last);
      case "Enter":
      case " ":
        e.preventDefault();
        return open ? choose(active) : show();
      case "Escape":
        if (open) {
          e.preventDefault();
          setOpen(false);
        }
        return;
      case "Tab":
        if (open) choose(active);
        return;
    }
    if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
      const now = Date.now();
      typed.current = { text: (now - typed.current.at > 600 ? "" : typed.current.text) + e.key.toLowerCase(), at: now };
      const hit = options.findIndex((o) => o.label.toLowerCase().startsWith(typed.current.text));
      if (hit >= 0) move(hit);
    }
  }

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      {name && <input type="hidden" name={name} value={value} />}
      <button
        ref={buttonRef}
        id={buttonId}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-activedescendant={open ? `${listId}-${active}` : undefined}
        aria-label={label}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        onClick={() => (open ? setOpen(false) : show())}
        onKeyDown={onKeyDown}
        className={`title-4 flex w-full items-center justify-between gap-3 rounded-sm border bg-surface px-3 py-2 text-left text-fg transition-colors duration-300 ease-brand hover:bg-surface-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink ${
          invalid ? "border-danger" : "border-line"
        }`}
      >
        <span className="truncate">{selected?.label}</span>
        <CaretDown
          size={14}
          weight="bold"
          aria-hidden
          className={`shrink-0 text-muted transition-transform duration-300 ease-brand ${open ? "rotate-180" : ""}`}
        />
      </button>

      <ul
        id={listId}
        role="listbox"
        aria-labelledby={buttonId}
        hidden={!open}
        className="stitched absolute left-0 right-0 z-50 mt-1 max-h-72 min-w-max overflow-y-auto rounded-md border border-line bg-surface p-2 shadow-[4px_5px_0_0_var(--color-surface-3)] [--stitch:var(--color-thread)]"
      >
        {options.map((o, i) => {
          const isSelected = o.value === value;
          return (
            <li
              key={o.value}
              id={`${listId}-${i}`}
              role="option"
              aria-selected={isSelected}
              onPointerEnter={() => setActive(i)}
              onClick={() => choose(i)}
              className={`body-5 relative z-[2] flex items-center justify-between gap-4 rounded-sm px-3 py-2 text-fg ${
                i === active ? "bg-surface-3" : ""
              } ${isSelected ? "font-semibold" : ""}`}
            >
              {o.label}
              {isSelected && <Check size={14} weight="bold" aria-hidden className="text-thread" />}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
