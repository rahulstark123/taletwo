import { jsonOk, withApiUser } from "@/server/authorization/api";
import { restoreSpecialDay } from "@/server/services/special-days";

type Params = { params: Promise<{ id: string }> };

/** POST /api/special-days/:id/restore: undo a recent delete. */
export async function POST(_request: Request, { params }: Params) {
  const { id } = await params;
  return withApiUser(async (user) => jsonOk({ day: await restoreSpecialDay(user.id, id) }), { requireOnboarded: true });
}
