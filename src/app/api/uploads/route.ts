import { z } from "zod";
import { UPLOAD_PURPOSES } from "@/lib/uploads";
import { jsonOk, withApiUser } from "@/server/authorization/api";
import { AppError } from "@/server/errors";
import { deletePhotos, uploadPhoto } from "@/server/services/uploads";

const deleteSchema = z.object({
  purpose: z.enum(UPLOAD_PURPOSES),
  paths: z.array(z.string().min(1).max(512)).min(1).max(50),
});

/**
 * POST /api/uploads: multipart form with `purpose` ("memory" | "avatar"), `file`, and `memoryId` for
 * memory photos. The file is checked for type, size and content, then stored privately in R2.
 */
export async function POST(request: Request) {
  return withApiUser(
    async (user) => {
      let form: FormData;
      try {
        form = await request.formData();
      } catch {
        throw new AppError("VALIDATION_FAILED", "The upload could not be read. Please try again.", 400);
      }
      const purpose = form.get("purpose");
      const file = form.get("file");
      const memoryId = form.get("memoryId");
      if (purpose !== "memory" && purpose !== "avatar") throw new AppError("VALIDATION_FAILED", "Unknown upload type.", 400);
      if (!(file instanceof File)) throw new AppError("VALIDATION_FAILED", "Please choose a photo to upload.", 400);
      const id = typeof memoryId === "string" && /^[0-9a-f-]{36}$/i.test(memoryId) ? memoryId : undefined;
      return jsonOk({ photo: await uploadPhoto(user.id, purpose, file, id) }, 201);
    },
    { requireOnboarded: true }
  );
}

/** DELETE /api/uploads: remove photos that were uploaded but never saved, or photos a memory dropped. */
export async function DELETE(request: Request) {
  return withApiUser(
    async (user) => {
      let raw: unknown;
      try {
        raw = await request.json();
      } catch {
        throw new AppError("VALIDATION_FAILED", "The request body must be valid JSON.", 400);
      }
      const parsed = deleteSchema.safeParse(raw);
      if (!parsed.success) throw new AppError("VALIDATION_FAILED", "Please check the photo list.", 400);
      await deletePhotos(user.id, parsed.data.purpose, parsed.data.paths);
      return jsonOk({ deleted: parsed.data.paths.length });
    },
    { requireOnboarded: true }
  );
}
