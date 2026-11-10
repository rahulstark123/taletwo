import { jsonOk, withApiUser } from "@/server/authorization/api";
import { AppError } from "@/server/errors";
import { CONFESSION_AUDIO_MAX_BYTES, uploadConfessionAudio } from "@/server/services/confessions";

/**
 * POST /api/confessions/audio: stores one encrypted recording. The body is raw bytes (already encrypted in
 * the browser), so the server stores exactly what it receives and cannot play it back.
 */
export async function POST(request: Request) {
  return withApiUser(
    async (user) => {
      const declared = Number(request.headers.get("content-length") ?? "0");
      if (declared > CONFESSION_AUDIO_MAX_BYTES) {
        throw new AppError("VALIDATION_FAILED", "The recording is too large. Keep it under ten minutes.", 413);
      }
      const bytes = new Uint8Array(await request.arrayBuffer());
      return jsonOk({ path: await uploadConfessionAudio(user.id, bytes) }, 201);
    },
    { requireOnboarded: true }
  );
}
