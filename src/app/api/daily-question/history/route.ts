import { historyFilterSchema } from "@/lib/validations/daily-question";
import { jsonOk, withApiUser } from "@/server/authorization/api";
import { AppError } from "@/server/errors";
import { getHistory } from "@/server/services/daily-question";

/** GET /api/daily-question/history?category=: past questions and both answers. */
export async function GET(request: Request) {
  return withApiUser(
    async (user) => {
      const params = Object.fromEntries(new URL(request.url).searchParams.entries());
      const parsed = historyFilterSchema.safeParse(params);
      if (!parsed.success) throw new AppError("VALIDATION_FAILED", "Unknown category.", 400);
      return jsonOk(await getHistory(user.id, parsed.data.category));
    },
    { requireOnboarded: true }
  );
}
