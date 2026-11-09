import "server-only";
import { prisma } from "@/lib/prisma";
import { assertWithinLimit } from "@/server/services/plan-limits";
import { AppError } from "@/server/errors";
import { recordAuditEvent } from "@/server/services/audit";
import { getActiveWorkspaceForUser } from "@/server/services/workspaces";
import type { CreateNoteInput, NoteColorValue, UpdateNoteInput } from "@/lib/validations/notes";

/** How long a deleted note can be restored by a partner. */
import { NOTE_UNDO_WINDOW_MS as UNDO_MS } from "@/lib/notes-types";
/** How long a deleted note can be restored by a partner. */
export const NOTE_UNDO_WINDOW_MS = UNDO_MS;

import type { NoteDTO, NotesPayload } from "@/lib/notes-types";

export type { NoteDTO, NotesPayload };

type NoteRow = {
  id: string;
  title: string;
  body: string;
  color: NoteColorValue;
  pinned: boolean;
  authorId: string;
  createdAt: Date;
  updatedAt: Date;
  author: { displayName: string };
};

function toDTO(note: NoteRow, currentUserId: string): NoteDTO {
  return {
    id: note.id,
    title: note.title,
    body: note.body,
    color: note.color,
    pinned: note.pinned,
    authorId: note.authorId,
    authorName: note.authorId === currentUserId ? "You" : note.author.displayName,
    isMine: note.authorId === currentUserId,
    createdAt: note.createdAt.toISOString(),
    updatedAt: note.updatedAt.toISOString(),
  };
}

/** Resolves the caller's active workspace, or fails. Every note query is scoped to this id. */
async function requireWorkspace(userId: string) {
  const workspace = await getActiveWorkspaceForUser(userId);
  if (!workspace) throw new AppError("NO_WORKSPACE", "Create a workspace or join your partner first.", 409);
  return workspace;
}

/** Shared notes for the caller's workspace, pinned first, then most recently changed. */
export async function listNotes(userId: string): Promise<NotesPayload> {
  const workspace = await requireWorkspace(userId);
  const rows = await prisma.note.findMany({
    where: { workspaceId: workspace.id, deletedAt: null },
    include: { author: { select: { displayName: true } } },
    orderBy: [{ pinned: "desc" }, { updatedAt: "desc" }],
    take: 300,
  });
  return {
    workspaceId: workspace.id,
    currentUserId: userId,
    members: workspace.members.map((m) => ({ userId: m.userId, displayName: m.displayName })),
    notes: rows.map((r) => toDTO(r, userId)),
  };
}

export async function createNote(userId: string, input: CreateNoteInput): Promise<NoteDTO> {
  const workspace = await requireWorkspace(userId);
  await assertWithinLimit(workspace.id, "notes", await prisma.note.count({ where: { workspaceId: workspace.id, deletedAt: null } }));
  const title = input.title || input.body.trim().split("\n")[0]?.slice(0, 120) || "Untitled note";

  const row = await prisma.note.create({
    data: {
      workspaceId: workspace.id,
      authorId: userId,
      title,
      body: input.body,
      color: input.color,
      pinned: input.pinned,
    },
    include: { author: { select: { displayName: true } } },
  });
  await recordAuditEvent("note.created", userId, { workspaceId: workspace.id });
  return toDTO(row, userId);
}

/** Loads a live note that belongs to the caller's workspace. Any member may edit a shared note. */
async function findOwnedNote(userId: string, noteId: string) {
  const workspace = await requireWorkspace(userId);
  const note = await prisma.note.findFirst({
    where: { id: noteId, workspaceId: workspace.id, deletedAt: null },
    include: { author: { select: { displayName: true } } },
  });
  if (!note) throw new AppError("NOT_FOUND", "This note could not be found. It may have been removed.", 404);
  return { workspace, note };
}

export async function updateNote(userId: string, noteId: string, input: UpdateNoteInput): Promise<NoteDTO> {
  await findOwnedNote(userId, noteId);
  const row = await prisma.note.update({
    where: { id: noteId },
    data: input,
    include: { author: { select: { displayName: true } } },
  });
  return toDTO(row, userId);
}

/** Soft delete. The note stays recoverable for NOTE_UNDO_WINDOW_MS. */
export async function deleteNote(userId: string, noteId: string): Promise<void> {
  await findOwnedNote(userId, noteId);
  await prisma.note.update({ where: { id: noteId }, data: { deletedAt: new Date() } });
  await recordAuditEvent("note.deleted", userId);
}

/** Restores a note deleted within the undo window. Only members of the same workspace can restore it. */
export async function restoreNote(userId: string, noteId: string): Promise<NoteDTO> {
  const workspace = await requireWorkspace(userId);
  const note = await prisma.note.findFirst({
    where: { id: noteId, workspaceId: workspace.id, deletedAt: { gt: new Date(Date.now() - NOTE_UNDO_WINDOW_MS) } },
    include: { author: { select: { displayName: true } } },
  });
  if (!note) throw new AppError("NOT_FOUND", "This note can no longer be restored.", 404);

  const row = await prisma.note.update({
    where: { id: noteId },
    data: { deletedAt: null },
    include: { author: { select: { displayName: true } } },
  });
  return toDTO(row, userId);
}
