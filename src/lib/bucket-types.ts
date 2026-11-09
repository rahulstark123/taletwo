import type { BucketCategoryValue, BucketPriorityValue } from "@/lib/validations/bucket";

/** Client-safe bucket list shapes shared by the API, server pages and the UI. */
export interface BucketItemDTO {
  id: string;
  title: string;
  description: string;
  category: BucketCategoryValue;
  priority: BucketPriorityValue;
  targetDate: string | null; // YYYY-MM-DD
  completedAt: string | null;
  completionMemory: string;
  createdById: string;
  createdByName: string;
  isMine: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BucketPayload {
  workspaceId: number;
  currentUserId: string;
  members: { userId: string; displayName: string }[];
  items: BucketItemDTO[];
}

export const BUCKET_UNDO_WINDOW_MS = 10 * 60 * 1000;
