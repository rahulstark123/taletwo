import { createWorkspace, getActiveWorkspaceForUser } from "@/server/services/workspaces";
import { jsonOk, withApiUser } from "@/server/authorization/api";

/** GET /api/workspaces: the caller's active workspace, or null. */
export async function GET() {
  return withApiUser(async (user) => jsonOk({ workspace: await getActiveWorkspaceForUser(user.id) }));
}

/** POST /api/workspaces: creates a workspace with the next sequential integer id. */
export async function POST() {
  return withApiUser(async (user) => jsonOk({ workspace: await createWorkspace(user.id) }, 201));
}
