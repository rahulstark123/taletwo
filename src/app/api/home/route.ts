import { jsonOk, withApiUser } from "@/server/authorization/api";
import { getHomeData } from "@/server/services/home";

/** GET /api/home: everything the home page shows, for the caller's couple space. */
export async function GET() {
  return withApiUser(async (user) => jsonOk(await getHomeData(user.id)), { requireOnboarded: true });
}
