import "server-only";
import { randomUUID } from "node:crypto";
import { AppError } from "@/server/errors";
import { getActiveWorkspaceForUser } from "@/server/services/workspaces";
import { deletePrivateObjects, putPrivateObject } from "@/server/storage/r2";
import {
  AVATAR_MAX_BYTES,
  AVATAR_MIME_TYPES,
  EXTENSION_FOR_MIME,
  MEMORY_MAX_BYTES,
  MEMORY_MIME_TYPES,
  type UploadedFile,
  type UploadPurpose,
} from "@/lib/uploads";

/** Checks the first bytes of the file, so a renamed non-image is rejected. */
function looksLikeType(bytes: Uint8Array, mime: string): boolean {
  if (mime === "image/jpeg") return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (mime === "image/png") return bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47;
  if (mime === "image/webp") {
    return bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 && bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50;
  }
  return false;
}

/**
 * Stores one photo for the caller. Memory photos go under the caller's active workspace and memory;
 * avatars go under the caller's own id. The client never chooses the path.
 */
export async function uploadPhoto(userId: string, purpose: UploadPurpose, file: File, memoryId?: string): Promise<UploadedFile> {
  const allowed: readonly string[] = purpose === "memory" ? MEMORY_MIME_TYPES : AVATAR_MIME_TYPES;
  const maxBytes = purpose === "memory" ? MEMORY_MAX_BYTES : AVATAR_MAX_BYTES;

  if (!allowed.includes(file.type)) {
    throw new AppError("VALIDATION_FAILED", "Please choose a photo in WebP, JPEG or PNG format.", 400);
  }
  if (file.size <= 0 || file.size > maxBytes) {
    throw new AppError("VALIDATION_FAILED", `Photos must be under ${Math.round(maxBytes / 1024 / 1024)} MB.`, 400);
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  if (!looksLikeType(bytes, file.type)) {
    throw new AppError("VALIDATION_FAILED", "That file does not look like a photo. Please choose another.", 400);
  }

  const ext = EXTENSION_FOR_MIME[file.type];
  let path: string;
  let area: "memories" | "avatars";
  if (purpose === "memory") {
    if (!memoryId) throw new AppError("VALIDATION_FAILED", "Missing memory for this photo.", 400);
    const workspace = await getActiveWorkspaceForUser(userId);
    if (!workspace) throw new AppError("NO_WORKSPACE", "Create a workspace or join your partner first.", 409);
    path = `${workspace.id}/${memoryId}/${randomUUID()}.${ext}`;
    area = "memories";
  } else {
    path = `${userId}/${randomUUID()}.${ext}`;
    area = "avatars";
  }

  await putPrivateObject(area, path, bytes, file.type);
  return { path, mimeType: file.type, sizeBytes: file.size };
}

/**
 * Deletes photos the caller owns. Memory photos must sit under the caller's workspace, and avatars
 * under the caller's own id. Anything else is refused.
 */
export async function deletePhotos(userId: string, purpose: UploadPurpose, paths: string[]): Promise<void> {
  if (paths.length === 0) return;
  if (purpose === "memory") {
    const workspace = await getActiveWorkspaceForUser(userId);
    if (!workspace || paths.some((p) => !p.startsWith(`${workspace.id}/`))) {
      throw new AppError("NOT_FOUND", "We could not find those photos.", 404);
    }
    await deletePrivateObjects("memories", paths);
    return;
  }
  if (paths.some((p) => !p.startsWith(`${userId}/`))) {
    throw new AppError("NOT_FOUND", "We could not find those photos.", 404);
  }
  await deletePrivateObjects("avatars", paths);
}
