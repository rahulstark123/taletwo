import { getCurrentUser } from "@/server/authorization/session";
import { errorResponse } from "@/server/authorization/api";
import { AppError } from "@/server/errors";
import { getConfessionAudio } from "@/server/services/confessions";

type Params = { params: Promise<{ id: string }> };

/**
 * GET /api/confessions/:id/audio: the encrypted recording, served by the app itself. The caller must be
 * allowed to see the confession. The response is ciphertext; only the password can open it.
 */
export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  try {
    const user = await getCurrentUser();
    if (!user) throw new AppError("UNAUTHENTICATED", "Please sign in again.", 401);
    const bytes = await getConfessionAudio(user.id, id);
    return new Response(bytes as unknown as BodyInit, {
      status: 200,
      headers: { "content-type": "application/octet-stream", "cache-control": "private, no-store" },
    });
  } catch (error) {
    return errorResponse(error);
  }
}
