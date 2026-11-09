import { updatePlanSchema } from "@/lib/validations/plans";
import { jsonOk, parseBody, withApiUser } from "@/server/authorization/api";
import { PLAN_UNDO_WINDOW_MS } from "@/lib/plans-types";
import { deletePlan, updatePlan } from "@/server/services/plans";

type Params = { params: Promise<{ id: string }> };

/** PATCH /api/plans/:id: edit details, status, checklist or audience. */
export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params;
  return withApiUser(
    async (user) => {
      const input = await parseBody(request, updatePlanSchema);
      return jsonOk({ plan: await updatePlan(user.id, id, input) });
    },
    { requireOnboarded: true }
  );
}

/** DELETE /api/plans/:id: soft delete with an undo window. */
export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params;
  return withApiUser(
    async (user) => {
      await deletePlan(user.id, id);
      return jsonOk({ deleted: true, undoUntil: new Date(Date.now() + PLAN_UNDO_WINDOW_MS).toISOString() });
    },
    { requireOnboarded: true }
  );
}
