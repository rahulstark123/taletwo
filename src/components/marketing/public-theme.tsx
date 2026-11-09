"use client";

import type { ReactNode } from "react";
import { useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Light or dark for the public pages (landing, pricing, about and so on). Visitors are not signed in, so
 * the choice is remembered in this browser only. It is a convenience, not account data.
 */
type Mode = "light" | "dark";
const KEY = "tt-public-theme";
const listeners = new Set<() => void>();

function readMode(): Mode {
  try {
    return window.localStorage.getItem(KEY) === "dark" ? "dark" : "light";
  } catch {
    return "light";
  }
}

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  window.addEventListener("storage", onChange);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onChange);
  };
}

function usePublicMode(): Mode {
  return useSyncExternalStore(subscribe, readMode, () => "light");
}

function setPublicMode(next: Mode) {
  try {
    window.localStorage.setItem(KEY, next);
  } catch {
    // Storage can be blocked. The switch still works for this visit.
  }
  listeners.forEach((listener) => listener());
}

/** Wraps the public pages. Adds the dark class when the visitor has chosen dark. */
export function PublicThemeScope({ className, children }: { className?: string; children: ReactNode }) {
  const mode = usePublicMode();
  return (
    <div className={cn(className, mode === "dark" && "dark")} style={{ colorScheme: mode }}>
      {children}
    </div>
  );
}

/** Sun and moon button. Switches the public pages between light and dark at once. */
export function PublicThemeToggle({ className }: { className?: string }) {
  const mode = usePublicMode();
  const dark = mode === "dark";
  return (
    <button
      type="button"
      onClick={() => setPublicMode(dark ? "light" : "dark")}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      title={dark ? "Light mode" : "Dark mode"}
      className={cn(
        "inline-flex size-10 items-center justify-center rounded-full border border-ld-outline-variant bg-ld-surface-container-lowest text-ld-on-surface transition-colors hover:bg-ld-surface-container",
        className
      )}
    >
      {dark ? <Sun className="size-4" aria-hidden="true" /> : <Moon className="size-4" aria-hidden="true" />}
    </button>
  );
}
