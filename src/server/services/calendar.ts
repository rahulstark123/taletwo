import "server-only";
import { prisma } from "@/lib/prisma";
import { calendarDateIn } from "@/lib/dates";
import type { CalendarEventDTO, CalendarItem, CalendarPayload } from "@/lib/calendar-types";
import type { CreateCalendarEventInput, UpdateCalendarEventInput } from "@/lib/validations/calendar";
import { AppError } from "@/server/errors";
import { recordAuditEvent } from "@/server/services/audit";
import { getActiveWorkspaceForUser } from "@/server/services/workspaces";

export type { CalendarItem, CalendarPayload, CalendarEventDTO };

const DAY = 86_400_000;

async function requireWorkspace(userId: string) {
  const workspace = await getActiveWorkspaceForUser(userId);
  if (!workspace) throw new AppError("NO_WORKSPACE", "Create a workspace or join your partner first.", 409);
  return workspace;
}

function keyOf(date: Date, tz: string) {
  const d = calendarDateIn(date, tz);
  return `${d.year}-${String(d.month).padStart(2, "0")}-${String(d.day).padStart(2, "0")}`;
}

/** Every date in [from, to] (inclusive) as YYYY-MM-DD. */
function datesBetween(from: string, to: string): string[] {
  const out: string[] = [];
  for (let t = Date.parse(`${from}T00:00:00Z`); t <= Date.parse(`${to}T00:00:00Z`); t += DAY) {
    out.push(new Date(t).toISOString().slice(0, 10));
  }
  return out;
}

/**
 * Everything on the couple's calendar for a date range, in the viewer's timezone.
 * Events come from the calendar table. Plans, special days and bucket dates are read from their own tables,
 * so editing them in those modules updates the calendar automatically.
 */
export async function getCalendarRange(userId: string, from: string, to: string): Promise<CalendarPayload> {
  const workspace = await requireWorkspace(userId);
  const profile = await prisma.userProfile.findUnique({ where: { id: userId }, select: { timezone: true } });
  const tz = profile?.timezone ?? "UTC";
  // Widen the database window by a day either side, then keep only what falls inside the viewer's dates.
  const windowStart = new Date(Date.parse(`${from}T00:00:00Z`) - DAY);
  const windowEnd = new Date(Date.parse(`${to}T00:00:00Z`) + 2 * DAY);
  const inRange = (d: string) => d >= from && d <= to;

  const [events, plans, specials, bucket] = await Promise.all([
    prisma.calendarEvent.findMany({
      where: { workspaceId: workspace.id, deletedAt: null, startsAt: { gte: windowStart, lt: windowEnd } },
      orderBy: { startsAt: "asc" },
    }),
    prisma.plan.findMany({
      where: { workspaceId: workspace.id, deletedAt: null, status: { not: "DONE" }, startsAt: { gte: windowStart, lt: windowEnd } },
      orderBy: { startsAt: "asc" },
    }),
    prisma.specialDay.findMany({ where: { workspaceId: workspace.id, deletedAt: null } }),
    prisma.bucketItem.findMany({
      where: { workspaceId: workspace.id, deletedAt: null, completedAt: null, targetDate: { gte: windowStart, lt: windowEnd } },
    }),
  ]);

  const items: CalendarItem[] = [];

  for (const e of events) {
    const date = e.allDay ? e.startsAt.toISOString().slice(0, 10) : keyOf(e.startsAt, tz);
    if (!inRange(date)) continue;
    items.push({
      id: e.id,
      source: "EVENT",
      kind: e.kind,
      title: e.title,
      date,
      startsAt: e.allDay ? null : e.startsAt.toISOString(),
      allDay: e.allDay,
      location: e.location,
      description: e.description,
      href: null,
      editable: true,
      reminder: e.reminder,
    });
  }

  for (const p of plans) {
    if (!p.startsAt) continue;
    const date = keyOf(p.startsAt, tz);
    if (!inRange(date)) continue;
    items.push({
      id: p.id,
      source: "PLAN",
      kind: p.audience === "FAMILY" ? "FAMILY" : p.kind,
      title: p.title,
      date,
      startsAt: p.startsAt.toISOString(),
      allDay: false,
      location: p.location,
      description: p.description,
      href: "/app/plans",
      editable: false,
      reminder: "NONE",
    });
  }

  const days = datesBetween(from, to);
  for (const s of specials) {
    const [, m, d] = s.eventDate.toISOString().slice(0, 10).split("-").map(Number);
    const original = s.eventDate.toISOString().slice(0, 10);
    for (const date of days) {
      const matches = s.repeatsYearly ? date.slice(5) === `${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}` : date === original;
      if (!matches) continue;
      items.push({
        id: `${s.id}:${date}`,
        source: "SPECIAL_DAY",
        kind: s.kind,
        title: s.title,
        date,
        startsAt: null,
        allDay: true,
        location: "",
        description: s.notes,
        href: "/app/special-days",
        editable: false,
        reminder: s.reminder,
      });
    }
  }

  for (const b of bucket) {
    if (!b.targetDate) continue;
    const date = b.targetDate.toISOString().slice(0, 10);
    if (!inRange(date)) continue;
    items.push({
      id: b.id,
      source: "BUCKET",
      kind: "BUCKET",
      title: b.title,
      date,
      startsAt: null,
      allDay: true,
      location: "",
      description: b.description,
      href: "/app/bucket-list",
      editable: false,
      reminder: "NONE",
    });
  }

  items.sort((a, b) => (a.date === b.date ? (a.startsAt ?? "").localeCompare(b.startsAt ?? "") : a.date.localeCompare(b.date)));
  return { workspaceId: workspace.id, currentUserId: userId, timezone: tz, from, to, items };
}

function toEventDTO(e: { id: string; title: string; description: string; kind: CalendarEventDTO["kind"]; startsAt: Date; endsAt: Date | null; allDay: boolean; location: string; reminder: string; createdById: string; createdBy: { displayName: string } }, me: string): CalendarEventDTO {
  return {
    id: e.id,
    title: e.title,
    description: e.description,
    kind: e.kind,
    startsAt: e.startsAt.toISOString(),
    endsAt: e.endsAt ? e.endsAt.toISOString() : null,
    allDay: e.allDay,
    location: e.location,
    reminder: e.reminder,
    createdByName: e.createdById === me ? "You" : e.createdBy.displayName,
    isMine: e.createdById === me,
  };
}

const INCLUDE = { createdBy: { select: { displayName: true } } } as const;

export async function createCalendarEvent(userId: string, input: CreateCalendarEventInput): Promise<CalendarEventDTO> {
  const workspace = await requireWorkspace(userId);
  const startsAt = input.allDay ? new Date(`${input.startsAt.slice(0, 10)}T00:00:00Z`) : new Date(input.startsAt);
  const row = await prisma.calendarEvent.create({
    data: {
      workspaceId: workspace.id,
      createdById: userId,
      title: input.title,
      description: input.description,
      kind: input.kind,
      startsAt,
      endsAt: input.endsAt ? new Date(input.endsAt) : null,
      allDay: input.allDay,
      location: input.location,
      reminder: input.reminder,
    },
    include: INCLUDE,
  });
  await recordAuditEvent("calendar.event_created", userId, { workspaceId: workspace.id });
  return toEventDTO(row, userId);
}

export async function updateCalendarEvent(userId: string, id: string, input: UpdateCalendarEventInput): Promise<CalendarEventDTO> {
  const workspace = await requireWorkspace(userId);
  const existing = await prisma.calendarEvent.findFirst({ where: { id, workspaceId: workspace.id, deletedAt: null } });
  if (!existing) throw new AppError("NOT_FOUND", "This event could not be found. It may have been removed.", 404);
  const data: Record<string, unknown> = { ...input };
  if (input.startsAt) data.startsAt = (input.allDay ?? existing.allDay) ? new Date(`${input.startsAt.slice(0, 10)}T00:00:00Z`) : new Date(input.startsAt);
  if ("endsAt" in input) data.endsAt = input.endsAt ? new Date(input.endsAt) : null;
  const row = await prisma.calendarEvent.update({ where: { id }, data, include: INCLUDE });
  return toEventDTO(row, userId);
}

export async function deleteCalendarEvent(userId: string, id: string): Promise<void> {
  const workspace = await requireWorkspace(userId);
  const existing = await prisma.calendarEvent.findFirst({ where: { id, workspaceId: workspace.id, deletedAt: null } });
  if (!existing) throw new AppError("NOT_FOUND", "This event could not be found. It may have been removed.", 404);
  await prisma.calendarEvent.update({ where: { id }, data: { deletedAt: new Date() } });
  await recordAuditEvent("calendar.event_deleted", userId);
}
