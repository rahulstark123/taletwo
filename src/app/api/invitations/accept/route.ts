import { acceptInviteSchema } from "@/lib/validations/api";
import { jsonOk, parseBody, withApiUser } from "@/server/authorization/api";
import { acceptInvitation } from "@/server/services/workspaces";

/** POST /api/invitations/accept: joins the workspace that issued the code. */
export async function POST(request: Request) {
  return withApiUser(async (user) => {
    const { code } = await parseBody(request, acceptInviteSchema);
    return jsonOk({ workspace: await acceptInvitation(user.id, code) });
  });
}
