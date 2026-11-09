import { updateNoteSchema } from "@/lib/validations/notes";
import { jsonOk, parseBody, withApiUser } from "@/server/authorization/api";
import { deleteNote, updateNote } from "@/server/services/notes";

type Params = { params: Promise<{ id: string }> };

/** PATCH /api/notes/:id: edit a note, change its colour, or pin/unpin it. */
export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params;
  return withApiUser(
    async (user) => {
      const input = await parseBody(request, updateNoteSchema);
      return jsonOk({ note: await updateNote(user.id, id, input) });
    },
    { requireOnboarded: true }
  );
}

/** DELETE /api/notes/:id: soft delete. The response allows an undo within the undo window. */
export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params;
  return withApiUser(
    async (user) => {
      await deleteNote(user.id, id);
      return jsonOk({ deleted: true, undoUntil: new Date(Date.now() + 10 * 60 * 1000).toISOString() });
    },
    { requireOnboarded: true }
  );
}
