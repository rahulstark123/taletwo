import Link from "next/link";
import { CalendarHeart, Heart } from "lucide-react";
import { greetingFor } from "@/lib/format";
import { daysBetween, formatDate } from "@/lib/dates";

interface HomeHeaderProps {
  name: string;
  initial: string;
  /** Null until someone joins the space. */
  partner: { name: string; initial: string } | null;
  /** Null until the couple sets a relationship start date in their profile. */
  relationshipStart: { year: number; month: number; day: number } | null;
  timezone: string;
  now: Date;
}

/** Greeting, today's date, partner avatars and the days-together counter. */
export function HomeHeader({ name, initial, partner, relationshipStart, timezone, now }: HomeHeaderProps) {
  const hour = Number(
    new Intl.DateTimeFormat("en-GB", { timeZone: timezone, hour: "2-digit", hourCycle: "h23" }).format(now)
  );
  const startInstant = relationshipStart
    ? new Date(Date.UTC(relationshipStart.year, relationshipStart.month - 1, relationshipStart.day))
    : null;
  // The start date counts as day 1.
  const dayCount = startInstant ? Math.max(1, daysBetween(startInstant, now, timezone) + 1) : 0;
  const today = formatDate(now, { weekday: "long", day: "numeric", month: "long" }, timezone);
  const greeting = partner ? `${greetingFor(hour)}, ${name} & ${partner.name}.` : `${greetingFor(hour)}, ${name}.`;

  return (
    <section aria-labelledby="home-greeting" className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
      <div className="space-y-3">
        <p className="text-ld-label-sm font-semibold uppercase tracking-widest text-ld-primary">{today}</p>
        <h1 id="home-greeting" className="font-display text-ld-headline-xl-mobile text-ld-on-surface md:text-ld-headline-xl">
          {greeting}
        </h1>
        <p className="text-ld-body-md text-ld-on-surface-variant">
          {partner ? "Your story, one moment at a time." : "Invite your partner to start your shared space."}
        </p>
      </div>

      <div className="flex items-center gap-4 rounded-3xl bg-ld-surface-container-lowest p-4 pr-6 shadow-sm">
        <div className="flex -space-x-2.5">
          <span className="flex size-11 items-center justify-center rounded-full bg-ld-secondary-container text-ld-label-md font-semibold text-ld-on-secondary-container ring-2 ring-ld-surface-container-lowest">
            {initial}
          </span>
          {partner ? (
            <span className="flex size-11 items-center justify-center rounded-full bg-ld-tertiary-fixed text-ld-label-md font-semibold text-ld-on-tertiary-fixed-variant ring-2 ring-ld-surface-container-lowest">
              {partner.initial}
            </span>
          ) : null}
        </div>
        <div>
          {startInstant ? (
            <>
              <p className="flex items-center gap-1.5 font-display text-ld-headline-md leading-none text-ld-on-surface">
                Day {dayCount.toLocaleString("en-GB")}
                <Heart className="size-4 fill-ld-primary text-ld-primary" aria-hidden="true" />
              </p>
              <p className="mt-1 flex items-center gap-1.5 text-ld-caption text-ld-tertiary">
                <CalendarHeart className="size-3.5" aria-hidden="true" />
                Together since {formatDate(startInstant, { day: "numeric", month: "short", year: "numeric" }, "UTC")}
              </p>
            </>
          ) : (
            <Link href="/app/profile" className="text-ld-label-sm text-ld-primary hover:underline">
              Add the day you started together
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
