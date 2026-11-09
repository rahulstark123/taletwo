/** Client-safe upload rules. The server enforces the same limits; the browser uses them for early feedback. */

export const UPLOAD_PURPOSES = ["memory", "avatar"] as const;
export type UploadPurpose = (typeof UPLOAD_PURPOSES)[number];

/** Photos are compressed to WebP in the browser before upload, so WebP is the normal type. */
export const MEMORY_MIME_TYPES = ["image/webp", "image/jpeg", "image/png"] as const;
export const AVATAR_MIME_TYPES = ["image/webp"] as const;

export const MEMORY_MAX_BYTES = 3 * 1024 * 1024;
export const AVATAR_MAX_BYTES = 1024 * 1024;

export const EXTENSION_FOR_MIME: Record<string, string> = {
  "image/webp": "webp",
  "image/jpeg": "jpg",
  "image/png": "png",
};

/** Result of a successful upload: the stored path and the facts the memory record needs. */
export interface UploadedFile {
  path: string;
  mimeType: string;
  sizeBytes: number;
}

export type UploadResult = { ok: true; data: UploadedFile } | { ok: false; error: { code: string; message: string } };
