import "server-only";
import { prisma } from "@/lib/prisma";
import { assertWithinLimit } from "@/server/services/plan-limits";
import { PLAN_UNDO_WINDOW_MS, type ChecklistItem, type PlanDTO, type PlansPayload } from "@/lib/plans-types";
import type { CreatePlanInput, PlanFilter, UpdatePlanInput } from "@/lib/validations/plans";
import { AppError } from "@/server/errors";
import { recordAuditEvent } from "@/server/services/audit";
import { getActiveWorkspaceForUser } from "@/server/services/workspaces";

export type { PlanDTO, PlansPayload };
export { PLAN_UNDO_WINDOW_MS };

type PlanRow = {
  id: string;
  title: string;
  description: string;
  kind: PlanDTO["kind"];
  audience: PlanDTO["audience"];
  status: PlanDTO["status"];
  startsAt: Date | null;
  location: string;
  budgetMinor: number | null;
  checklist: unknown;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: { displayName: string };
};

function parseChecklist(raw: unknown): ChecklistItem[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((i): i is ChecklistItem => typeof i === "object" && i !== null && typeof (i as ChecklistItem).text === "string")
    .map((i) => ({ id: String(i.id), text: i.text, done: Boolean(i.done) }));
}

function toDTO(p: PlanRow, currentUserId: string): PlanDTO {
  return {
    id: p.id,
    title: p.title,
    description: p.description,
    kind: p.kind,
    audience: p.audience,
    status: p.status,
    startsAt: p.startsAt ? p.startsAt.toISOString() : null,
    location: p.location,
    budgetRupees: p.budgetMinor === null ? null : Math.round(p.budgetMinor / 100),
    checklist: parseChecklist(p.checklist),
    createdById: p.createdById,
    createdByName: p.createdById === currentUserId ? "You" : p.createdBy.displayName,
    isMine: p.createdById === currentUserId,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  };
}

async function requireWorkspace(userId: string) {
  const workspace = await getActiveWorkspaceForUser(userId);
  if (!workspace) throw new AppError("NO_WORKSPACE", "Create a workspace or join your partner first.", 409);
  return workspace;
}

/** Plans for the caller's workspace. Filters run in the database. Soonest plans first, then ideas. */
export async function listPlans(userId: string, filter: PlanFilter = {}): Promise<PlansPayload> {
  const workspace = await requireWorkspace(userId);
  const rows = await prisma.plan.findMany({
    where: {
      workspaceId: workspace.id,
      deletedAt: null,
      ...(filter.status ? { status: filter.status } : {}),
      ...(filter.kind ? { kind: filter.kind } : {}),
      ...(filter.audience ? { audience: filter.audience } : {}),
    },
    include: { createdBy: { select: { displayName: true } } },
    orderBy: [{ status: "asc" }, { startsAt: { sort: "asc", nulls: "last" } }, { createdAt: "desc" }],
    take: 300,
  });
  return {
    workspaceId: workspace.id,
    currency: workspace.currency,
    currentUserId: userId,
    members: workspace.members.map((m) => ({ userId: m.userId, displayName: m.displayName })),
    plans: rows.map((r) => toDTO(r, userId)),
  };
}

export async function createPlan(userId: string, input: CreatePlanInput): Promise<PlanDTO> {
  const workspace = await requireWorkspace(userId);
  await assertWithinLimit(workspace.id, "activePlans", await prisma.plan.count({ where: { workspaceId: workspace.id, deletedAt: null, status: { not: "DONE" } } }));
  const row = await prisma.plan.create({
    data: {
      workspaceId: workspace.id,
      createdById: userId,
      title: input.title,
      description: input.description,
      kind: input.kind,
      audience: input.audience,
      status: input.status,
      startsAt: input.startsAt ? new Date(input.startsAt) : null,
      location: input.location,
      budgetMinor: input.budgetRupees === null ? null : input.budgetRupees * 100,
      checklist: input.checklist,
    },
    include: { createdBy: { select: { displayName: true } } },
  });
  await recordAuditEvent("plan.created", userId, { workspaceId: workspace.id });
  return toDTO(row, userId);
}

/** Loads a live plan from the caller's workspace. Any member can edit a shared plan. */
async function requireOwnedPlan(userId: string, planId: string) {
  const workspace = await requireWorkspace(userId);
  const plan = await prisma.plan.findFirst({
    where: { id: planId, workspaceId: workspace.id, deletedAt: null },
  });
  if (!plan) throw new AppError("NOT_FOUND", "This plan could not be found. It may have been removed.", 404);
  return { workspace, plan };
}

export async function updatePlan(userId: string, planId: string, input: UpdatePlanInput): Promise<PlanDTO> {
  await requireOwnedPlan(userId, planId);
  const data: Record<string, unknown> = { ...input };
  if ("startsAt" in input) data.startsAt = input.startsAt ? new Date(input.startsAt) : null;
  if ("budgetRupees" in input) data.budgetMinor = input.budgetRupees === null || input.budgetRupees === undefined ? null : input.budgetRupees * 100;
  delete data.budgetRupees;

  const row = await prisma.plan.update({
    where: { id: planId },
    data,
    include: { createdBy: { select: { displayName: true } } },
  });
  return toDTO(row, userId);
}

/** Soft delete. Recoverable for PLAN_UNDO_WINDOW_MS. */
export async function deletePlan(userId: string, planId: string): Promise<void> {
  await requireOwnedPlan(userId, planId);
  await prisma.plan.update({ where: { id: planId }, data: { deletedAt: new Date() } });
  await recordAuditEvent("plan.deleted", userId);
}

export async function restorePlan(userId: string, planId: string): Promise<PlanDTO> {
  const workspace = await requireWorkspace(userId);
  const row = await prisma.plan.findFirst({
    where: { id: planId, workspaceId: workspace.id, deletedAt: { gt: new Date(Date.now() - PLAN_UNDO_WINDOW_MS) } },
  });
  if (!row) throw new AppError("NOT_FOUND", "This plan can no longer be restored.", 404);
  const restored = await prisma.plan.update({
    where: { id: planId },
    data: { deletedAt: null },
    include: { createdBy: { select: { displayName: true } } },
  });
  return toDTO(restored, userId);
}
