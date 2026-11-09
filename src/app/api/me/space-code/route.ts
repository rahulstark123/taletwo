import { jsonOk, withApiUser } from "@/server/authorization/api";
import { regenerateSpaceCode } from "@/server/services/space-code";

/** POST /api/me/space-code: issues a new space code. The previous code stops working at once. */
export async function POST() {
  return withApiUser(async (user) => jsonOk({ spaceCode: await regenerateSpaceCode(user.id) }));
}
