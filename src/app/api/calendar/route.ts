import { calendarRangeSchema } from "@/lib/validations/calendar";
import { jsonOk, withApiUser } from "@/server/authorization/api";
import { AppError } from "@/server/errors";
import { getCalendarRange } from "@/server/services/calendar";

/** GET /api/calendar?from=YYYY-MM-DD&to=YYYY-MM-DD: everything on the couple's calendar in that range. */
export async function GET(request: Request) {
  return withApiUser(
    async (user) => {
      const params = Object.fromEntries(new URL(request.url).searchParams.entries());
      const parsed = calendarRangeSchema.safeParse(params);
      if (!parsed.success) throw new AppError("VALIDATION_FAILED", parsed.error.issues[0]?.message ?? "Please choose a valid date range.", 400);
      return jsonOk(await getCalendarRange(user.id, parsed.data.from, parsed.data.to));
    },
    { requireOnboarded: true }
  );
}
