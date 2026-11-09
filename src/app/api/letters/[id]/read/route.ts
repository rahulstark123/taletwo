import { jsonOk, withApiUser } from "@/server/authorization/api";
import { markLetterRead } from "@/server/services/letters";

type Params = { params: Promise<{ id: string }> };

/** POST /api/letters/:id/read: the recipient opens a letter. Only works once it is no longer sealed. */
export async function POST(_request: Request, { params }: Params) {
  const { id } = await params;
  return withApiUser(async (user) => jsonOk({ letter: await markLetterRead(user.id, id) }), { requireOnboarded: true });
}
