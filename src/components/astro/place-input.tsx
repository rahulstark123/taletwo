"use client";

import { useEffect, useId, useRef, useState } from "react";

interface PlaceInputProps {
  value: string;
  onChange: (value: string) => void;
}

/**
 * Place-of-birth field with city suggestions as you type. Suggestions come from the server, so the browser
 * only talks to TaleTwo. A person can still type a place that is not in the list.
 */
export function PlaceInput({ value, onChange }: PlaceInputProps) {
  const [items, setItems] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const skipNextFetch = useRef(false);
  const listId = useId();

  useEffect(() => {
    if (skipNextFetch.current) {
      skipNextFetch.current = false;
      return;
    }
    const q = value.trim();
    if (q.length < 2) return;
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/astro/places?q=${encodeURIComponent(q)}`, { signal: controller.signal, credentials: "same-origin" });
        const json = (await res.json()) as { ok: boolean; data?: { places: { label: string }[] } };
        if (json.ok && json.data) {
          setItems(json.data.places.map((p) => p.label));
          setActive(-1);
          setOpen(true);
        }
      } catch {
        // Offline or aborted: the person can keep typing the place by hand.
      }
    }, 300);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [value]);

  function pick(label: string) {
    skipNextFetch.current = true;
    onChange(label);
    setItems([]);
    setOpen(false);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open || items.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => (i + 1) % items.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => (i <= 0 ? items.length - 1 : i - 1));
    } else if (e.key === "Enter" && active >= 0) {
      e.preventDefault();
      pick(items[active]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div className="relative">
      <input
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          if (e.target.value.trim().length < 2) {
            setItems([]);
            setOpen(false);
          }
        }}
        onKeyDown={onKeyDown}
        onFocus={() => items.length > 0 && setOpen(true)}
        onBlur={() => setOpen(false)}
        placeholder="Start typing a city"
        role="combobox"
        aria-expanded={open && items.length > 0}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={open && active >= 0 ? `${listId}-${active}` : undefined}
        autoComplete="off"
        className="h-11 w-full rounded-xl border border-ld-outline-variant bg-ld-surface px-3 text-ld-body-md text-ld-on-surface placeholder:text-ld-on-surface-variant/70 focus:border-ld-primary focus:outline-none"
      />
      {open && items.length > 0 && (
        <ul id={listId} role="listbox" className="absolute z-30 mt-1 max-h-64 w-full overflow-y-auto rounded-xl bg-ld-surface-container-lowest p-1 shadow-lg ring-1 ring-ld-on-surface/10">
          {items.map((label, i) => (
            <li
              key={label}
              id={`${listId}-${i}`}
              role="option"
              aria-selected={i === active}
              onMouseDown={(e) => {
                e.preventDefault();
                pick(label);
              }}
              onMouseEnter={() => setActive(i)}
              className={`cursor-pointer rounded-lg px-3 py-2 text-ld-body-sm text-ld-on-surface ${i === active ? "bg-ld-secondary-container/60" : ""}`}
            >
              {label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
