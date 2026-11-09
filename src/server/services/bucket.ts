import "server-only";
import { prisma } from "@/lib/prisma";
import { assertWithinLimit } from "@/server/services/plan-limits";
import { BUCKET_UNDO_WINDOW_MS, type BucketItemDTO, type BucketPayload } from "@/lib/bucket-types";
import type { BucketFilter, CompleteBucketInput, CreateBucketInput, UpdateBucketInput } from "@/lib/validations/bucket";
import { AppError } from "@/server/errors";
import { recordAuditEvent } from "@/server/services/audit";
import { getActiveWorkspaceForUser } from "@/server/services/workspaces";

export type { BucketItemDTO, BucketPayload };

type Row = {
  id: string;
  title: string;
  description: string;
  category: BucketItemDTO["category"];
  priority: BucketItemDTO["priority"];
  targetDate: Date | null;
  completedAt: Date | null;
  completionMemory: string;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: { displayName: string };
};

function toDTO(r: Row, me: string): BucketItemDTO {
  return {
    id: r.id,
    title: r.title,
    description: r.description,
    category: r.category,
    priority: r.priority,
    targetDate: r.targetDate ? r.targetDate.toISOString().slice(0, 10) : null,
    completedAt: r.completedAt ? r.completedAt.toISOString() : null,
    completionMemory: r.completionMemory,
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

/** The workspace's dreams. Filters run in the database. Open dreams first, by priority, then by target date. */
export async function listBucketItems(userId: string, filter: BucketFilter = {}): Promise<BucketPayload> {
  const workspace = await requireWorkspace(userId);
  const rows = await prisma.bucketItem.findMany({
    where: {
      workspaceId: workspace.id,
      deletedAt: null,
      ...(filter.category ? { category: filter.category } : {}),
      ...(filter.status === "PENDING" ? { completedAt: null } : {}),
      ...(filter.status === "COMPLETED" ? { completedAt: { not: null } } : {}),
    },
    include: INCLUDE,
    orderBy: [{ completedAt: { sort: "asc", nulls: "first" } }, { priority: "desc" }, { targetDate: { sort: "asc", nulls: "last" } }, { createdAt: "desc" }],
    take: 500,
  });
  return {
    workspaceId: workspace.id,
    currentUserId: userId,
    members: workspace.members.map((m) => ({ userId: m.userId, displayName: m.displayName })),
    items: rows.map((r) => toDTO(r, userId)),
  };
}

export async function createBucketItem(userId: string, input: CreateBucketInput): Promise<BucketItemDTO> {
  const workspace = await requireWorkspace(userId);
  await assertWithinLimit(workspace.id, "bucketItems", await prisma.bucketItem.count({ where: { workspaceId: workspace.id, deletedAt: null } }));
  const row = await prisma.bucketItem.create({
    data: {
      workspaceId: workspace.id,
      createdById: userId,
      title: input.title,
      description: input.description,
      category: input.category,
      priority: input.priority,
      targetDate: input.targetDate ? new Date(`${input.targetDate}T00:00:00Z`) : null,
    },
    include: INCLUDE,
  });
  await recordAuditEvent("bucket.created", userId, { workspaceId: workspace.id });
  return toDTO(row, userId);
}

async function requireLiveItem(userId: string, id: string) {
  const workspace = await requireWorkspace(userId);
  const item = await prisma.bucketItem.findFirst({ where: { id, workspaceId: workspace.id, deletedAt: null } });
  if (!item) throw new AppError("NOT_FOUND", "This dream could not be found. It may have been removed.", 404);
  return item;
}

export async function updateBucketItem(userId: string, id: string, input: UpdateBucketInput): Promise<BucketItemDTO> {
  await requireLiveItem(userId, id);
  const data: Record<string, unknown> = { ...input };
  if ("targetDate" in input) data.targetDate = input.targetDate ? new Date(`${input.targetDate}T00:00:00Z`) : null;
  const row = await prisma.bucketItem.update({ where: { id }, data, include: INCLUDE });
  return toDTO(row, userId);
}

/** Marks a dream done with the day and a memory, or puts it back on the list. */
export async function completeBucketItem(userId: string, id: string, input: CompleteBucketInput): Promise<BucketItemDTO> {
  await requireLiveItem(userId, id);
  const data = input.completed
    ? { completedAt: new Date(`${input.completedOn}T12:00:00Z`), completionMemory: input.completionMemory }
    : { completedAt: null, completionMemory: "" };
  const row = await prisma.bucketItem.update({ where: { id }, data, include: INCLUDE });
  if (input.completed) await recordAuditEvent("bucket.completed", userId);
  return toDTO(row, userId);
}

export async function deleteBucketItem(userId: string, id: string): Promise<void> {
  await requireLiveItem(userId, id);
  await prisma.bucketItem.update({ where: { id }, data: { deletedAt: new Date() } });
  await recordAuditEvent("bucket.deleted", userId);
}

export async function restoreBucketItem(userId: string, id: string): Promise<BucketItemDTO> {
  const workspace = await requireWorkspace(userId);
  const found = await prisma.bucketItem.findFirst({
    where: { id, workspaceId: workspace.id, deletedAt: { gt: new Date(Date.now() - BUCKET_UNDO_WINDOW_MS) } },
  });
  if (!found) throw new AppError("NOT_FOUND", "This dream can no longer be restored.", 404);
  const row = await prisma.bucketItem.update({ where: { id }, data: { deletedAt: null }, include: INCLUDE });
  return toDTO(row, userId);
}
