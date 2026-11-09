import type { MemoryCategoryValue } from "@/lib/validations/memories";

/** Client-safe memory shapes. Photo URLs are short-lived signed links to private storage. */
export interface MemoryMediaDTO {
  id: string;
  url: string | null; // null if the link could not be signed (the photo is hidden, not broken)
  mimeType: string;
  sizeBytes: number;
  sortOrder: number;
}

export interface MemoryDTO {
  id: string;
  title: string;
  caption: string;
  memoryDate: string; // YYYY-MM-DD
  location: string;
  category: MemoryCategoryValue;
  tags: string[];
  favourite: boolean;
  media: MemoryMediaDTO[];
  createdById: string;
  createdByName: string;
  isMine: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MemoriesPayload {
  workspaceId: number;
  currentUserId: string;
  members: { userId: string; displayName: string }[];
  memories: MemoryDTO[];
}

export const MEMORY_SIGNED_URL_SECONDS = 60 * 60;
export const MEMORY_UNDO_WINDOW_MS = 10 * 60 * 1000;
