"use client";

import imageCompression from "browser-image-compression";

/**
 * Compresses a photo in the browser before it is uploaded (open-source: browser-image-compression, MIT).
 *
 * - Resizes the longest side to 1600 px, which is plenty for a phone or laptop screen.
 * - Re-encodes as WebP at high compression, targeting about 500 KB.
 * - Re-encoding through a canvas also removes EXIF metadata, including GPS location, before upload.
 * - Runs in a web worker so the page stays responsive.
 */
export const COMPRESS_OPTIONS = {
  maxSizeMB: 0.5,
  maxWidthOrHeight: 1600,
  fileType: "image/webp" as const,
  initialQuality: 0.8,
  useWebWorker: true,
  preserveExif: false,
};

/** Hard ceiling after compression. Anything still larger is refused rather than uploaded. */
export const COMPRESSED_MAX_BYTES = 3 * 1024 * 1024;

export interface CompressedPhoto {
  file: File;
  originalBytes: number;
}

export async function compressPhoto(original: File, overrides: Partial<typeof COMPRESS_OPTIONS> = {}): Promise<CompressedPhoto> {
  const compressed = await imageCompression(original, { ...COMPRESS_OPTIONS, ...overrides });
  // Keep a clear file name with the right extension for the new format.
  const base = original.name.replace(/\.[^.]+$/, "") || "photo";
  const file = new File([compressed], `${base}.webp`, { type: "image/webp", lastModified: Date.now() });
  if (file.size > COMPRESSED_MAX_BYTES) {
    throw new Error(`"${original.name}" is still too large after compression. Try a smaller photo.`);
  }
  return { file, originalBytes: original.size };
}

/** "2.4 MB" or "430 KB" for display. */
export function formatBytes(bytes: number) {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}
