import "server-only";
import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/prisma";
import type { CreateConfessionInput } from "@/lib/validations/confessions";
import { limitMessage } from "@/config/plan-limits";
import { AppError } from "@/server/errors";
import { deletePrivateObjects, getPrivateBytes, putPrivateObject } from "@/server/storage/r2";
import { limitsForWorkspace } from "@/server/services/plan-limits";
import { getActiveWorkspaceForUser } from "@/server/services/workspaces";

/** Largest encrypted recording accepted. Ten minutes of compressed speech is about 1.8 MB, well under this. */
export const CONFESSION_AUDIO_MAX_BYTES = 4 * 1024 * 1024;

export interface ConfessionListItem {
  id: string;
  authorName: string;
  isMine: boolean;
  shared: boolean;
  hasAudio: boolean;
  /** Card title chosen by the writer. Not encrypted. Null when none was given. */
  label: string | null;
  createdAt: string;
}

export interface ConfessionDetail {
  id: string;
  isMine: boolean;
  shared: boolean;
  /** Everything needed to open the confession with the lock password. Only ciphertext. */
  salt: string;
  sealed: string;
  /** True when the confession has an encrypted recording. The bytes come from its audio route. */
  hasAudio: boolean;
  createdAt: string;
}

async function requireWorkspace(userId: string) {
  const workspace = await getActiveWorkspaceForUser(userId);
  if (!workspace) throw new AppError("NO_WORKSPACE", "Create a workspace or join your partner first.", 409);
  return workspace;
}

function startOfMonthUTC(now: Date): Date {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
}

/** Confessions this person has saved this calendar month, and the plan's allowance for each person. */
async function monthlyUsage(workspaceId: number, userId: string): Promise<{ used: number; limit: number | null }> {
  const [{ limits }, used] = await Promise.all([
    limitsForWorkspace(workspaceId),
    prisma.confession.count({ where: { workspaceId, authorId: userId, deletedAt: null, createdAt: { gte: startOfMonthUTC(new Date()) } } }),
  ]);
  return { used, limit: Number.isFinite(limits.confessionsPerMonth) ? limits.confessionsPerMonth : null };
}

/** Refuses a new confession when this person has reached this month's allowance for their plan. */
async function assertConfessionAllowance(workspaceId: number, userId: string): Promise<void> {
  const { plan, limits } = await limitsForWorkspace(workspaceId);
  if (!Number.isFinite(limits.confessionsPerMonth)) return;
  const used = await prisma.confession.count({ where: { workspaceId, authorId: userId, deletedAt: null, createdAt: { gte: startOfMonthUTC(new Date()) } } });
  if (used + 1 > limits.confessionsPerMonth) {
    throw new AppError("PLAN_LIMIT", limitMessage(plan, "confessions a month", limits.confessionsPerMonth), 403);
  }
}

/** Confessions the caller can see: their own, and any the partner shared. Titles and text are never listed. */
export async function listConfessions(userId: string): Promise<{ confessions: ConfessionListItem[]; partnerName: string; usage: { used: number; limit: number | null } }> {
  const workspace = await requireWorkspace(userId);
  const usage = await monthlyUsage(workspace.id, userId);
  const rows = await prisma.confession.findMany({
    where: {
      workspaceId: workspace.id,
      deletedAt: null,
      OR: [{ authorId: userId }, { shared: true }],
    },
    include: { author: { select: { displayName: true } } },
    orderBy: { createdAt: "desc" },
    take: 200,
  });
  const partner = workspace.members.find((m) => m.userId !== userId);
  return {
    partnerName: partner?.displayName ?? "your partner",
    usage,
    confessions: rows.map((r) => ({
      id: r.id,
      authorName: r.authorId === userId ? "You" : r.author.displayName,
      isMine: r.authorId === userId,
      shared: r.shared,
      hasAudio: r.audioPath !== null,
      label: r.label,
      createdAt: r.createdAt.toISOString(),
    })),
  };
}

/** One confession for the unlock step. Returns ciphertext and a short-lived link to encrypted audio. */
export async function getConfession(userId: string, id: string): Promise<ConfessionDetail> {
  const workspace = await requireWorkspace(userId);
  const row = await prisma.confession.findFirst({
    where: {
      id,
      workspaceId: workspace.id,
      deletedAt: null,
      OR: [{ authorId: userId }, { shared: true }],
    },
  });
  if (!row) throw new AppError("NOT_FOUND", "This confession could not be found. It may have been removed.", 404);
  return {
    id: row.id,
    isMine: row.authorId === userId,
    shared: row.shared,
    salt: row.salt,
    sealed: row.sealed,
    hasAudio: row.audioPath !== null,
    createdAt: row.createdAt.toISOString(),
  };
}

/**
 * Stores one encrypted recording and returns its storage path. The path includes the workspace and the
 * uploader, so a recording can only be attached to a confession by the person who uploaded it.
 */
export async function uploadConfessionAudio(userId: string, bytes: Uint8Array): Promise<string> {
  const workspace = await requireWorkspace(userId);
  await assertConfessionAllowance(workspace.id, userId);
  if (bytes.byteLength === 0) throw new AppError("VALIDATION_FAILED", "The recording is empty. Please record again.", 400);
  if (bytes.byteLength > CONFESSION_AUDIO_MAX_BYTES) {
    throw new AppError("VALIDATION_FAILED", "The recording is too large. Keep it under ten minutes.", 413);
  }
  const path = `${workspace.id}/${userId}/${randomUUID()}.bin`;
  await putPrivateObject("confessions", path, bytes, "application/octet-stream");
  return path;
}

export async function createConfession(userId: string, input: CreateConfessionInput): Promise<{ id: string }> {
  const workspace = await requireWorkspace(userId);
  await assertConfessionAllowance(workspace.id, userId);
  if (input.audioPath && !input.audioPath.startsWith(`${workspace.id}/${userId}/`)) {
    throw new AppError("VALIDATION_FAILED", "The recording could not be attached. Please record again.", 400);
  }
  const row = await prisma.confession.create({
    data: {
      workspaceId: workspace.id,
      authorId: userId,
      shared: input.shared,
      salt: input.salt,
      sealed: input.sealed,
      label: input.label,
      audioPath: input.audioPath ?? null,
    },
    select: { id: true },
  });
  return row;
}

/** Encrypted recording bytes for a confession the caller may open. The browser decrypts them with the password. */
export async function getConfessionAudio(userId: string, id: string): Promise<Uint8Array> {
  const workspace = await requireWorkspace(userId);
  const row = await prisma.confession.findFirst({
    where: { id, workspaceId: workspace.id, deletedAt: null, OR: [{ authorId: userId }, { shared: true }] },
    select: { audioPath: true },
  });
  if (!row?.audioPath) throw new AppError("NOT_FOUND", "This recording could not be found.", 404);
  return getPrivateBytes("confessions", row.audioPath);
}

/** Only the author can remove a confession. Its recording is deleted from storage as well. */
export async function deleteConfession(userId: string, id: string): Promise<void> {
  const workspace = await requireWorkspace(userId);
  const row = await prisma.confession.findFirst({
    where: { id, workspaceId: workspace.id, authorId: userId, deletedAt: null },
    select: { id: true, audioPath: true },
  });
  if (!row) throw new AppError("NOT_FOUND", "This confession could not be found. It may have been removed.", 404);
  await prisma.confession.update({ where: { id: row.id }, data: { deletedAt: new Date(), audioPath: null } });
  if (row.audioPath) await deletePrivateObjects("confessions", [row.audioPath]);
}
