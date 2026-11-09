import "server-only";
import { prisma } from "@/lib/prisma";
import { SPECIAL_DAY_UNDO_WINDOW_MS, type SpecialDayDTO, type SpecialDaysPayload } from "@/lib/special-days-types";
import type { CreateSpecialDayInput, UpdateSpecialDayInput } from "@/lib/validations/special-days";
import { AppError } from "@/server/errors";
import { recordAuditEvent } from "@/server/services/audit";
import { getActiveWorkspaceForUser } from "@/server/services/workspaces";

export type { SpecialDayDTO, SpecialDaysPayload };

type Row = {
  id: string;
  title: string;
  kind: SpecialDayDTO["kind"];
  eventDate: Date;
  repeatsYearly: boolean;
  reminder: SpecialDayDTO["reminder"];
  notes: string;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: { displayName: string };
};

function toDTO(r: Row, me: string): SpecialDayDTO {
  return {
    id: r.id,
    title: r.title,
    kind: r.kind,
    eventDate: r.eventDate.toISOString().slice(0, 10),
    repeatsYearly: r.repeatsYearly,
    reminder: r.reminder,
    notes: r.notes,
    createdById: r.createdById,
    createdByName: r.createdById === me ? "You" : r.createdBy.displayName,
    isMine: r.createdById === me,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  };
}

async function requireWorkspace(userId: string) {
  const workspace = await getActiveWorkspaceForUser(userId);
  if (!workspace) throw new AppError("NO_WORKSPACE", "Create a workspace or join your partner first.", 409);
  return workspace;
}

const INCLUDE = { createdBy: { select: { displayName: true } } } as const;

/** Special days for the workspace. The viewer's timezone is returned so countdowns match their calendar. */
export async function listSpecialDays(userId: string): Promise<SpecialDaysPayload> {
  const workspace = await requireWorkspace(userId);
  const [rows, profile] = await Promise.all([
    prisma.specialDay.findMany({
      where: { workspaceId: workspace.id, deletedAt: null },
      include: INCLUDE,
      orderBy: [{ eventDate: "asc" }],
      take: 300,
    }),
    prisma.userProfile.findUnique({ where: { id: userId }, select: { timezone: true } }),
  ]);
  return {
    workspaceId: workspace.id,
    currentUserId: userId,
    timezone: profile?.timezone ?? "UTC",
    members: workspace.members.map((m) => ({ userId: m.userId, displayName: m.displayName })),
    days: (rows as Row[]).map((r) => toDTO(r, userId)),
  };
}

export async function createSpecialDay(userId: string, input: CreateSpecialDayInput): Promise<SpecialDayDTO> {
  const workspace = await requireWorkspace(userId);
  const row = (await prisma.specialDay.create({
    data: {
      workspaceId: workspace.id,
      createdById: userId,
      title: input.title,
      kind: input.kind,
      eventDate: new Date(`${input.eventDate}T00:00:00Z`),
      repeatsYearly: input.repeatsYearly,
      reminder: input.reminder,
      notes: input.notes,
    },
    include: INCLUDE,
  })) as Row;
  await recordAuditEvent("special_day.created", userId, { workspaceId: workspace.id });
  return toDTO(row, userId);
}

async function requireLive(userId: string, id: string) {
  const workspace = await requireWorkspace(userId);
  const day = await prisma.specialDay.findFirst({ where: { id, workspaceId: workspace.id, deletedAt: null } });
  if (!day) throw new AppError("NOT_FOUND", "This special day could not be found. It may have been removed.", 404);
  return day;
}

export async function updateSpecialDay(userId: string, id: string, input: UpdateSpecialDayInput): Promise<SpecialDayDTO> {
  await requireLive(userId, id);
  const data: Record<string, unknown> = { ...input };
  if ("eventDate" in input && input.eventDate) data.eventDate = new Date(`${input.eventDate}T00:00:00Z`);
  const row = (await prisma.specialDay.update({ where: { id }, data, include: INCLUDE })) as Row;
  return toDTO(row, userId);
}

export async function deleteSpecialDay(userId: string, id: string): Promise<void> {
  await requireLive(userId, id);
  await prisma.specialDay.update({ where: { id }, data: { deletedAt: new Date() } });
  await recordAuditEvent("special_day.deleted", userId);
}

export async function restoreSpecialDay(userId: string, id: string): Promise<SpecialDayDTO> {
  const workspace = await requireWorkspace(userId);
  const found = await prisma.specialDay.findFirst({
    where: { id, workspaceId: workspace.id, deletedAt: { gt: new Date(Date.now() - SPECIAL_DAY_UNDO_WINDOW_MS) } },
  });
  if (!found) throw new AppError("NOT_FOUND", "This day can no longer be restored.", 404);
  const row = (await prisma.specialDay.update({ where: { id }, data: { deletedAt: null }, include: INCLUDE })) as Row;
  return toDTO(row, userId);
}
