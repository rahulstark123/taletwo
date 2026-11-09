import "server-only";
import { prisma } from "@/lib/prisma";
import {
  MEMORY_UNDO_WINDOW_MS,
  type MemoriesPayload,
  type MemoryDTO,
  type MemoryMediaDTO,
} from "@/lib/memories-types";
import type { CreateMemoryInput, MemoryFilter, UpdateMemoryInput, UploadedMedia } from "@/lib/validations/memories";
import { MEMORY_MAX_PHOTOS } from "@/lib/validations/memories";
import { AppError } from "@/server/errors";
import { deletePrivateObjects, readUrl } from "@/server/storage/r2";
import { recordAuditEvent } from "@/server/services/audit";
import { getActiveWorkspaceForUser } from "@/server/services/workspaces";

export type { MemoriesPayload, MemoryDTO };

type MediaRow = { id: string; storagePath: string; mimeType: string; sizeBytes: number; sortOrder: number };
type Row = {
  id: string;
  workspaceId: number;
  title: string;
  caption: string;
  memoryDate: Date;
  location: string;
  category: MemoryDTO["category"];
  tags: string[];
  favourite: boolean;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: { displayName: string };
  media: MediaRow[];
};

async function requireWorkspace(userId: string) {
  const workspace = await getActiveWorkspaceForUser(userId);
  if (!workspace) throw new AppError("NO_WORKSPACE", "Create a workspace or join your partner first.", 409);
  return workspace;
}

/**
 * Turns storage paths into short-lived signed links. Only paths already checked against the caller's
 * workspace reach this point, so a link is never issued for another couple's photo.
 */
async function signPaths(paths: string[]): Promise<Map<string, string | null>> {
  const result = new Map<string, string | null>();
  await Promise.all(
    paths.map(async (p) => {
      try {
        result.set(p, await readUrl("memories", p));
      } catch {
        result.set(p, null);
      }
    })
  );
  return result;
}

async function toDTOs(rows: Row[], me: string): Promise<MemoryDTO[]> {
  const allPaths = rows.flatMap((r) => r.media.map((m) => m.storagePath));
  const urls = await signPaths(allPaths);
  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    caption: r.caption,
    memoryDate: r.memoryDate.toISOString().slice(0, 10),
    location: r.location,
    category: r.category,
    tags: r.tags,
    favourite: r.favourite,
    media: [...r.media]
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map<MemoryMediaDTO>((m) => ({
        id: m.id,
        url: urls.get(m.storagePath) ?? null,
        mimeType: m.mimeType,
        sizeBytes: m.sizeBytes,
        sortOrder: m.sortOrder,
      })),
    createdById: r.createdById,
    createdByName: r.createdById === me ? "You" : r.createdBy.displayName,
    isMine: r.createdById === me,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  }));
}

const INCLUDE = {
  createdBy: { select: { displayName: true } },
  media: true,
} as const;

/** Memories for the caller's workspace, newest moment first. Filters and search run in the database. */
export async function listMemories(userId: string, filter: MemoryFilter = {}): Promise<MemoriesPayload> {
  const workspace = await requireWorkspace(userId);
  const yearStart = filter.year ? new Date(`${filter.year}-01-01T00:00:00Z`) : null;
  const yearEnd = filter.year ? new Date(`${Number(filter.year) + 1}-01-01T00:00:00Z`) : null;
  const q = filter.q?.trim();

  const rows = (await prisma.memory.findMany({
    where: {
      workspaceId: workspace.id,
      deletedAt: null,
      ...(filter.category ? { category: filter.category } : {}),
      ...(filter.favourite === "true" ? { favourite: true } : {}),
      ...(yearStart && yearEnd ? { memoryDate: { gte: yearStart, lt: yearEnd } } : {}),
      ...(q
        ? {
            OR: [
              { title: { contains: q, mode: "insensitive" } },
              { caption: { contains: q, mode: "insensitive" } },
              { location: { contains: q, mode: "insensitive" } },
              { tags: { has: q.toLowerCase() } },
            ],
          }
        : {}),
    },
    include: INCLUDE,
    orderBy: [{ memoryDate: "desc" }, { createdAt: "desc" }],
    take: 300,
  })) as Row[];

  return {
    workspaceId: workspace.id,
    currentUserId: userId,
    members: workspace.members.map((m) => ({ userId: m.userId, displayName: m.displayName })),
    memories: await toDTOs(rows, userId),
  };
}

/** One memory, for the detail page. Returns null when it is missing or belongs to another workspace. */
export async function getMemory(userId: string, id: string): Promise<{ memory: MemoryDTO; workspaceId: number; members: { userId: string; displayName: string }[] } | null> {
  const workspace = await requireWorkspace(userId);
  const row = (await prisma.memory.findFirst({
    where: { id, workspaceId: workspace.id, deletedAt: null },
    include: INCLUDE,
  })) as Row | null;
  if (!row) return null;
  const [memory] = await toDTOs([row], userId);
  return { memory, workspaceId: workspace.id, members: workspace.members.map((m) => ({ userId: m.userId, displayName: m.displayName })) };
}

/** Confirms every uploaded photo sits under this workspace and memory. Storage policies enforce it too. */
function assertPathsOwned(media: UploadedMedia[], workspaceId: number, memoryId: string) {
  for (const m of media) {
    if (!m.path.startsWith(`${workspaceId}/${memoryId}/`)) {
      throw new AppError("VALIDATION_FAILED", "One of the photos does not belong to this memory. Please upload again.", 400);
    }
  }
}

export async function createMemory(userId: string, input: CreateMemoryInput): Promise<MemoryDTO> {
  const workspace = await requireWorkspace(userId);
  assertPathsOwned(input.media, workspace.id, input.id);

  const row = (await prisma.memory.create({
    data: {
      id: input.id,
      workspaceId: workspace.id,
      createdById: userId,
      title: input.title,
      caption: input.caption,
      memoryDate: new Date(`${input.memoryDate}T00:00:00Z`),
      location: input.location,
      category: input.category,
      tags: input.tags.map((t) => t.toLowerCase()),
      favourite: input.favourite,
      media: {
        create: input.media.map((m, i) => ({
          storagePath: m.path,
          mimeType: m.mimeType,
          sizeBytes: m.sizeBytes,
          sortOrder: i,
        })),
      },
    },
    include: INCLUDE,
  })) as Row;
  await recordAuditEvent("memory.created", userId, { workspaceId: workspace.id });
  const [dto] = await toDTOs([row], userId);
  return dto;
}

export async function updateMemory(userId: string, id: string, input: UpdateMemoryInput): Promise<MemoryDTO> {
  const workspace = await requireWorkspace(userId);
  const existing = await prisma.memory.findFirst({
    where: { id, workspaceId: workspace.id, deletedAt: null },
    include: { media: true },
  });
  if (!existing) throw new AppError("NOT_FOUND", "This memory could not be found. It may have been removed.", 404);

  const removeIds = input.removeMediaIds ?? [];
  const toRemove = existing.media.filter((m) => removeIds.includes(m.id));
  const remaining = existing.media.length - toRemove.length;
  const adding = input.addMedia ?? [];
  if (remaining + adding.length < 1) throw new AppError("VALIDATION_FAILED", "A memory needs at least one photo.", 400);
  if (remaining + adding.length > MEMORY_MAX_PHOTOS) {
    throw new AppError("VALIDATION_FAILED", `A memory can hold up to ${MEMORY_MAX_PHOTOS} photos.`, 400);
  }
  assertPathsOwned(adding, workspace.id, id);

  const startOrder = Math.max(-1, ...existing.media.map((m) => m.sortOrder)) + 1;

  await prisma.$transaction(async (tx) => {
    if (toRemove.length) await tx.memoryMedia.deleteMany({ where: { id: { in: toRemove.map((m) => m.id) }, memoryId: id } });
    if (adding.length) {
      await tx.memoryMedia.createMany({
        data: adding.map((m, i) => ({ memoryId: id, storagePath: m.path, mimeType: m.mimeType, sizeBytes: m.sizeBytes, sortOrder: startOrder + i })),
      });
    }
    await tx.memory.update({
      where: { id },
      data: {
        ...(input.title !== undefined ? { title: input.title } : {}),
        ...(input.caption !== undefined ? { caption: input.caption } : {}),
        ...(input.memoryDate !== undefined ? { memoryDate: new Date(`${input.memoryDate}T00:00:00Z`) } : {}),
        ...(input.location !== undefined ? { location: input.location } : {}),
        ...(input.category !== undefined ? { category: input.category } : {}),
        ...(input.tags !== undefined ? { tags: input.tags.map((t) => t.toLowerCase()) } : {}),
        ...(input.favourite !== undefined ? { favourite: input.favourite } : {}),
      },
    });
  });

  // Remove the photo files of the photos taken out. Paths were checked against this workspace on save.
  if (toRemove.length) {
    await deletePrivateObjects("memories", toRemove.map((m) => m.storagePath));
  }

  const row = (await prisma.memory.findUniqueOrThrow({ where: { id }, include: INCLUDE })) as Row;
  const [dto] = await toDTOs([row], userId);
  return dto;
}

export async function deleteMemory(userId: string, id: string): Promise<void> {
  const workspace = await requireWorkspace(userId);
  const found = await prisma.memory.findFirst({ where: { id, workspaceId: workspace.id, deletedAt: null } });
  if (!found) throw new AppError("NOT_FOUND", "This memory could not be found. It may have been removed.", 404);
  await prisma.memory.update({ where: { id }, data: { deletedAt: new Date() } });
  await recordAuditEvent("memory.deleted", userId);
}

export async function restoreMemory(userId: string, id: string): Promise<MemoryDTO> {
  const workspace = await requireWorkspace(userId);
  const found = await prisma.memory.findFirst({
    where: { id, workspaceId: workspace.id, deletedAt: { gt: new Date(Date.now() - MEMORY_UNDO_WINDOW_MS) } },
  });
  if (!found) throw new AppError("NOT_FOUND", "This memory can no longer be restored.", 404);
  const row = (await prisma.memory.update({ where: { id }, data: { deletedAt: null }, include: INCLUDE })) as Row;
  const [dto] = await toDTOs([row], userId);
  return dto;
}
