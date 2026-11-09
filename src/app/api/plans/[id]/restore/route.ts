import { jsonOk, withApiUser } from "@/server/authorization/api";
import { restorePlan } from "@/server/services/plans";

type Params = { params: Promise<{ id: string }> };

/** POST /api/plans/:id/restore: undo a recent delete. */
export async function POST(_request: Request, { params }: Params) {
  const { id } = await params;
  return withApiUser(async (user) => jsonOk({ plan: await restorePlan(user.id, id) }), { requireOnboarded: true });
}
