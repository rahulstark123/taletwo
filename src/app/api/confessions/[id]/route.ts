import { jsonOk, withApiUser } from "@/server/authorization/api";
import { deleteConfession, getConfession } from "@/server/services/confessions";

type Params = { params: Promise<{ id: string }> };

/** GET /api/confessions/:id: ciphertext and a short-lived link to the encrypted recording, for unlocking. */
export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  return withApiUser(async (user) => jsonOk({ confession: await getConfession(user.id, id) }), { requireOnboarded: true });
}

/** DELETE /api/confessions/:id: only the author can delete a confession. */
export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params;
  return withApiUser(
    async (user) => {
      await deleteConfession(user.id, id);
      return jsonOk({ deleted: true });
    },
    { requireOnboarded: true }
  );
}
