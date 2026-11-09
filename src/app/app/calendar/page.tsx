import type { Metadata } from "next";
import { Suspense } from "react";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { CalendarBoard } from "@/components/calendar/calendar-board";
import { calendarDateIn } from "@/lib/dates";
import { getCurrentUser } from "@/server/authorization/session";
import { getCalendarRange } from "@/server/services/calendar";

export const metadata: Metadata = {
  title: "Calendar",
  robots: { index: false, follow: false },
};

export default function CalendarPage() {
  return (
    <Suspense fallback={<div className="h-[32rem] animate-pulse rounded-3xl bg-ld-surface-container" aria-busy="true" />}>
      <CalendarContent />
    </Suspense>
  );
}

async function CalendarContent() {
  await connection();
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  // Load the six-week grid around today, in the viewer's timezone, so the first paint is already populated.
  const probe = await getCalendarRange(user.id, "1970-01-01", "1970-01-02");
  const tz = probe.timezone;
  const now = calendarDateIn(new Date(), tz);
  const today = `${now.year}-${String(now.month).padStart(2, "0")}-${String(now.day).padStart(2, "0")}`;
  const first = new Date(Date.UTC(now.year, now.month - 1, 1));
  const weekday = (first.getUTCDay() + 6) % 7;
  const start = new Date(first.getTime() - weekday * 86_400_000);
  const end = new Date(start.getTime() + 41 * 86_400_000);
  const from = start.toISOString().slice(0, 10);
  const to = end.toISOString().slice(0, 10);
  const initial = await getCalendarRange(user.id, from, to);

  return <CalendarBoard initial={initial} today={today} />;
}
