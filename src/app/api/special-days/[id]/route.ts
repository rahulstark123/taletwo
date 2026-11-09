import { SPECIAL_DAY_UNDO_WINDOW_MS } from "@/lib/special-days-types";
import { updateSpecialDaySchema } from "@/lib/validations/special-days";
import { jsonOk, parseBody, withApiUser } from "@/server/authorization/api";
import { deleteSpecialDay, updateSpecialDay } from "@/server/services/special-days";

type Params = { params: Promise<{ id: string }> };

/** PATCH /api/special-days/:id: edit a special day. */
export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params;
  return withApiUser(
    async (user) => {
      const input = await parseBody(request, updateSpecialDaySchema);
      return jsonOk({ day: await updateSpecialDay(user.id, id, input) });
    },
    { requireOnboarded: true }
  );
}

/** DELETE /api/special-days/:id: soft delete with an undo window. */
export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params;
  return withApiUser(
    async (user) => {
      await deleteSpecialDay(user.id, id);
      return jsonOk({ deleted: true, undoUntil: new Date(Date.now() + SPECIAL_DAY_UNDO_WINDOW_MS).toISOString() });
    },
    { requireOnboarded: true }
  );
}
