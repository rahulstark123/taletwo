import { jsonOk, withApiUser } from "@/server/authorization/api";
import { restoreNote } from "@/server/services/notes";

type Params = { params: Promise<{ id: string }> };

/** POST /api/notes/:id/restore: undo a recent delete. */
export async function POST(_request: Request, { params }: Params) {
  const { id } = await params;
  return withApiUser(async (user) => jsonOk({ note: await restoreNote(user.id, id) }), { requireOnboarded: true });
}
