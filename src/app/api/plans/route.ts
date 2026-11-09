import { createPlanSchema, planFilterSchema } from "@/lib/validations/plans";
import { jsonOk, parseBody, withApiUser } from "@/server/authorization/api";
import { createPlan, listPlans } from "@/server/services/plans";
import { AppError } from "@/server/errors";

/** GET /api/plans?status=&kind=&audience=  : plans for the caller's workspace, filtered on the server. */
export async function GET(request: Request) {
  return withApiUser(
    async (user) => {
      const params = Object.fromEntries(new URL(request.url).searchParams.entries());
      const parsed = planFilterSchema.safeParse(params);
      if (!parsed.success) throw new AppError("VALIDATION_FAILED", "Unknown filter for plans.", 400);
      return jsonOk(await listPlans(user.id, parsed.data));
    },
    { requireOnboarded: true }
  );
}

/** POST /api/plans: create a plan. */
export async function POST(request: Request) {
  return withApiUser(
    async (user) => {
      const input = await parseBody(request, createPlanSchema);
      return jsonOk({ plan: await createPlan(user.id, input) }, 201);
    },
    { requireOnboarded: true }
  );
}
