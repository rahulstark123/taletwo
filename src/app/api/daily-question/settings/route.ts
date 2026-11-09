import { revealModeSchema } from "@/lib/validations/daily-question";
import { jsonOk, parseBody, withApiUser } from "@/server/authorization/api";
import { getTodayView, setRevealMode } from "@/server/services/daily-question";

/** PATCH /api/daily-question/settings: choose when answers are revealed. */
export async function PATCH(request: Request) {
  return withApiUser(
    async (user) => {
      const { revealMode } = await parseBody(request, revealModeSchema);
      await setRevealMode(user.id, revealMode);
      return jsonOk(await getTodayView(user.id));
    },
    { requireOnboarded: true }
  );
}
