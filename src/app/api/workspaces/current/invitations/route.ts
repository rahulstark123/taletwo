import { createInvitation } from "@/server/services/workspaces";
import { jsonOk, withApiUser } from "@/server/authorization/api";

/** POST /api/workspaces/current/invitations: creates a new invite code and link (the previous one is revoked). */
export async function POST() {
  return withApiUser(async (user) => jsonOk({ invitation: await createInvitation(user.id) }, 201));
}
