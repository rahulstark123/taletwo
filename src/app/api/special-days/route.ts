import { createSpecialDaySchema } from "@/lib/validations/special-days";
import { jsonOk, parseBody, withApiUser } from "@/server/authorization/api";
import { createSpecialDay, listSpecialDays } from "@/server/services/special-days";

/** GET /api/special-days: the workspace's special days, with the viewer's timezone. */
export async function GET() {
  return withApiUser(async (user) => jsonOk(await listSpecialDays(user.id)), { requireOnboarded: true });
}

/** POST /api/special-days: add a special day. */
export async function POST(request: Request) {
  return withApiUser(
    async (user) => {
      const input = await parseBody(request, createSpecialDaySchema);
      return jsonOk({ day: await createSpecialDay(user.id, input) }, 201);
    },
    { requireOnboarded: true }
  );
}
