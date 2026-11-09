import { updateMemorySchema } from "@/lib/validations/memories";
import { MEMORY_UNDO_WINDOW_MS } from "@/lib/memories-types";
import { jsonOk, parseBody, withApiUser } from "@/server/authorization/api";
import { AppError } from "@/server/errors";
import { deleteMemory, getMemory, updateMemory } from "@/server/services/memories";

type Params = { params: Promise<{ id: string }> };

/** GET /api/memories/:id: one memory with signed photo links. */
export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  return withApiUser(
    async (user) => {
      const found = await getMemory(user.id, id);
      if (!found) throw new AppError("NOT_FOUND", "This memory could not be found. It may have been removed.", 404);
      return jsonOk({ memory: found.memory });
    },
    { requireOnboarded: true }
  );
}

/** PATCH /api/memories/:id: edit details, favourite, tags, or add and remove photos. */
export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params;
  return withApiUser(
    async (user) => {
      const input = await parseBody(request, updateMemorySchema);
      return jsonOk({ memory: await updateMemory(user.id, id, input) });
    },
    { requireOnboarded: true }
  );
}

/** DELETE /api/memories/:id: soft delete with an undo window. */
export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params;
  return withApiUser(
    async (user) => {
      await deleteMemory(user.id, id);
      return jsonOk({ deleted: true, undoUntil: new Date(Date.now() + MEMORY_UNDO_WINDOW_MS).toISOString() });
    },
    { requireOnboarded: true }
  );
}
