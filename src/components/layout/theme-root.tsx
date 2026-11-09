"use client";

import type { ReactNode } from "react";
import { useEffect, useSyncExternalStore } from "react";
import { getThemeOverride, subscribeThemeOverride } from "@/components/layout/theme-store";

export type ThemeChoice = "LIGHT" | "DARK" | "SYSTEM";

const DARK_QUERY = "(prefers-color-scheme: dark)";

function subscribe(onChange: () => void) {
  const media = window.matchMedia(DARK_QUERY);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

function deviceIsDark() {
  return window.matchMedia(DARK_QUERY).matches;
}

function serverDevice() {
  return false;
}

/** Whether the current theme shows dark right now. Follows the device when the choice is "Match device". */
export function useIsDark(savedTheme: ThemeChoice): boolean {
  const systemDark = useSyncExternalStore(subscribe, deviceIsDark, serverDevice);
  const chosen = useSyncExternalStore(subscribeThemeOverride, getThemeOverride, () => null);
  const theme = chosen ?? savedTheme;
  return theme === "DARK" || (theme === "SYSTEM" && systemDark);
}

/**
 * Applies the person's theme to everything inside it. Light and dark are set explicitly. "Match device"
 * follows the phone or computer and updates live if that changes. The dark class switches the colour
 * tokens defined in globals.css, so every screen follows without per-component changes.
 */
export function ThemeRoot({ theme, children }: { theme: ThemeChoice; children: ReactNode }) {
  const dark = useIsDark(theme);

  // Menus and pop-ups are drawn in a portal at the end of the page, outside this wrapper, so the dark class
  // is also set on the page root. It is removed again when the signed-in app is left.
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", dark);
    root.style.colorScheme = dark ? "dark" : "light";
    return () => {
      root.classList.remove("dark");
      root.style.colorScheme = "";
    };
  }, [dark]);

  return (
    <div className={dark ? "dark" : undefined} style={{ colorScheme: dark ? "dark" : "light" }}>
      {children}
    </div>
  );
}
