import { jsonOk, withApiUser } from "@/server/authorization/api";
import { restoreMemory } from "@/server/services/memories";

type Params = { params: Promise<{ id: string }> };

/** POST /api/memories/:id/restore: undo a recent delete. */
export async function POST(_request: Request, { params }: Params) {
  const { id } = await params;
  return withApiUser(async (user) => jsonOk({ memory: await restoreMemory(user.id, id) }), { requireOnboarded: true });
}
