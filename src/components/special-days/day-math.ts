import { calendarDateIn, daysUntilNextAnnual } from "@/lib/dates";
import type { SpecialDayDTO } from "@/lib/special-days-types";

const DAY = 86_400_000;

/** Days from now until this special day, in the viewer's timezone. Repeating days count to their next occurrence. */
export function daysUntil(day: SpecialDayDTO, now: number, timezone: string): number {
  const [y, m, d] = day.eventDate.split("-").map(Number);
  if (day.repeatsYearly) return daysUntilNextAnnual(m, d, new Date(now), timezone);
  const today = calendarDateIn(new Date(now), timezone);
  return Math.round((Date.UTC(y, m - 1, d) - Date.UTC(today.year, today.month - 1, today.day)) / DAY);
}

/** The next date (YYYY-MM-DD) this day falls on, in the viewer's timezone. */
export function nextDate(day: SpecialDayDTO, now: number, timezone: string): string {
  const n = daysUntil(day, now, timezone);
  const today = calendarDateIn(new Date(now), timezone);
  const t = new Date(Date.UTC(today.year, today.month - 1, today.day + n));
  return t.toISOString().slice(0, 10);
}

/** For anniversaries and birthdays: which one is coming, e.g. "3rd anniversary", "30th birthday". */
export function ordinalLabel(day: SpecialDayDTO, now: number, timezone: string): string | null {
  if (!day.repeatsYearly) return null;
  if (day.kind !== "BIRTHDAY" && day.kind !== "RELATIONSHIP_ANNIVERSARY" && day.kind !== "WEDDING_ANNIVERSARY") return null;
  const startYear = Number(day.eventDate.slice(0, 4));
  const nextYear = Number(nextDate(day, now, timezone).slice(0, 4));
  const n = nextYear - startYear;
  if (n <= 0) return null;
  const word = day.kind === "BIRTHDAY" ? "birthday" : "anniversary";
  return `${ordinal(n)} ${word}`;
}

export function ordinal(n: number) {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return `${n}${s[(v - 20) % 10] || s[v] || s[0]}`;
}

/** "Sat, 18 Nov" style date for display. */
export function shortDate(iso: string) {
  return new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(`${iso}T00:00:00Z`));
}

/** "in 42 days", "tomorrow", "today", "3 days ago". */
export function relativeDays(n: number) {
  if (n === 0) return "today";
  if (n === 1) return "tomorrow";
  if (n === -1) return "yesterday";
  if (n > 0) return `in ${n} days`;
  const ago = Math.abs(n);
  if (ago < 60) return `${ago} days ago`;
  if (ago < 730) return `${Math.round(ago / 30)} months ago`;
  return `${Math.round(ago / 365)} years ago`;
}
