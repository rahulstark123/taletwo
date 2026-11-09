/**
 * Timezone-aware calendar helpers.
 * Day arithmetic runs on calendar dates in the relevant timezone, never on raw
 * millisecond differences, so "days together" and countdowns do not drift at
 * midnight or across DST changes.
 */

export const DEFAULT_TIMEZONE = "UTC";

export interface CalendarDate {
  year: number;
  month: number; // 1-12
  day: number; // 1-31
}

/** Calendar date of `instant` as seen in `timeZone`. */
export function calendarDateIn(instant: Date, timeZone: string = DEFAULT_TIMEZONE): CalendarDate {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(instant);
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value);
  return { year: get("year"), month: get("month"), day: get("day") };
}

const DAY_MS = 86_400_000;

/** Whole calendar days from `from` to `to`, both read in `timeZone`. Negative if `to` is earlier. */
export function daysBetween(from: Date, to: Date, timeZone: string = DEFAULT_TIMEZONE): number {
  const a = calendarDateIn(from, timeZone);
  const b = calendarDateIn(to, timeZone);
  return Math.round((Date.UTC(b.year, b.month - 1, b.day) - Date.UTC(a.year, a.month - 1, a.day)) / DAY_MS);
}

/**
 * Days from `now` until the next occurrence of an annual date (month/day) in
 * `timeZone`. Returns 0 when that date is today.
 */
export function daysUntilNextAnnual(
  month: number,
  day: number,
  now: Date,
  timeZone: string = DEFAULT_TIMEZONE
): number {
  const today = calendarDateIn(now, timeZone);
  const todayMs = Date.UTC(today.year, today.month - 1, today.day);
  let candidate = Date.UTC(today.year, month - 1, day);
  if (candidate < todayMs) {
    candidate = Date.UTC(today.year + 1, month - 1, day);
  }
  return Math.round((candidate - todayMs) / DAY_MS);
}

/** Formats an instant as a calendar date in `timeZone`, e.g. "14 March 2024". */
export function formatDate(
  date: Date,
  options: Intl.DateTimeFormatOptions = { day: "numeric", month: "long", year: "numeric" },
  timeZone: string = DEFAULT_TIMEZONE
): string {
  return new Intl.DateTimeFormat("en-GB", { timeZone, ...options }).format(date);
}
