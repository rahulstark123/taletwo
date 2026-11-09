import { jsonOk, withApiUser } from "@/server/authorization/api";
import { getTodayView } from "@/server/services/daily-question";

/** GET /api/daily-question: today's question and what this person is allowed to see. */
export async function GET() {
  return withApiUser(async (user) => jsonOk(await getTodayView(user.id)), { requireOnboarded: true });
}
