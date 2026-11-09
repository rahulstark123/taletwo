import { updateLetterSchema } from "@/lib/validations/letters";
import { jsonOk, parseBody, withApiUser } from "@/server/authorization/api";
import { deleteLetter, updateLetter } from "@/server/services/letters";

type Params = { params: Promise<{ id: string }> };

/** PATCH /api/letters/:id: edit a draft or a sealed scheduled letter. */
export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params;
  return withApiUser(
    async (user) => {
      const input = await parseBody(request, updateLetterSchema);
      return jsonOk({ letter: await updateLetter(user.id, id, input) });
    },
    { requireOnboarded: true }
  );
}

/** DELETE /api/letters/:id: cancel a draft or a sealed scheduled letter. Sent letters stay in the history. */
export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params;
  return withApiUser(
    async (user) => {
      await deleteLetter(user.id, id);
      return jsonOk({ deleted: true });
    },
    { requireOnboarded: true }
  );
}
