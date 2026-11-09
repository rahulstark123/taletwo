import type { NoteColorValue } from "@/lib/validations/notes";

/** Client-safe note shapes shared by the API, server pages and the notes UI. */
export interface NoteDTO {
  id: string;
  title: string;
  body: string;
  color: NoteColorValue;
  pinned: boolean;
  authorId: string;
  authorName: string;
  isMine: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NotesPayload {
  workspaceId: number;
  currentUserId: string;
  members: { userId: string; displayName: string }[];
  notes: NoteDTO[];
}

/** How long a deleted note can be restored. Shared by the server and the UI. */
export const NOTE_UNDO_WINDOW_MS = 10 * 60 * 1000;
