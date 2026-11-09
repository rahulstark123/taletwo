"use client";

import type { ThemeChoice } from "@/components/layout/theme-root";

/**
 * The theme the person has just chosen in this browser. It applies at once, while the save to the
 * account runs in the background, so a change never waits for a server round trip.
 */
let override: ThemeChoice | null = null;
const listeners = new Set<() => void>();

export function setThemeOverride(next: ThemeChoice | null) {
  override = next;
  listeners.forEach((listener) => listener());
}

export function getThemeOverride(): ThemeChoice | null {
  return override;
}

export function subscribeThemeOverride(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
