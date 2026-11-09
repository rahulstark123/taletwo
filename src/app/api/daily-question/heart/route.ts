import { jsonOk, withApiUser } from "@/server/authorization/api";
import { toggleHeart } from "@/server/services/daily-question";

/** POST /api/daily-question/heart: react to your partner's revealed answer (toggles). */
export async function POST() {
  return withApiUser(async (user) => jsonOk(await toggleHeart(user.id)), { requireOnboarded: true });
}
