"use client";

import type { UploadPurpose, UploadResult, UploadedFile } from "@/lib/uploads";

/** Sends one compressed photo to the server, which checks it and stores it privately. */
export async function uploadPhotoFile(purpose: UploadPurpose, file: File, memoryId?: string): Promise<UploadResult> {
  const form = new FormData();
  form.append("purpose", purpose);
  form.append("file", file, file.name || "photo");
  if (memoryId) form.append("memoryId", memoryId);
  try {
    const res = await fetch("/api/uploads", { method: "POST", body: form, credentials: "same-origin" });
    const json = (await res.json()) as { ok: true; data: { photo: UploadedFile } } | { ok: false; error: { code: string; message: string } };
    if (!json.ok) return { ok: false, error: json.error };
    return { ok: true, data: json.data.photo };
  } catch {
    return { ok: false, error: { code: "NETWORK", message: "The photo could not be uploaded. Please check your connection and try again." } };
  }
}

/** Removes photos that were uploaded but not saved, or photos a memory dropped. Best effort. */
export async function deletePhotoPaths(purpose: UploadPurpose, paths: string[]): Promise<void> {
  if (paths.length === 0) return;
  try {
    await fetch("/api/uploads", {
      method: "DELETE",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ purpose, paths }),
      credentials: "same-origin",
    });
  } catch {
    // The user's save result matters more than cleanup. Orphaned files are harmless and can be swept later.
  }
}
