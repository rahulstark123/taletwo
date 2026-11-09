import { jsonOk, withApiUser } from "@/server/authorization/api";
import { restoreBucketItem } from "@/server/services/bucket";

type Params = { params: Promise<{ id: string }> };

/** POST /api/bucket-list/:id/restore: undo a recent delete. */
export async function POST(_request: Request, { params }: Params) {
  const { id } = await params;
  return withApiUser(async (user) => jsonOk({ item: await restoreBucketItem(user.id, id) }), { requireOnboarded: true });
}
