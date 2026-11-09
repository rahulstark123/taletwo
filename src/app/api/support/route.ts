import { createSupportSchema } from "@/lib/validations/support";
import { jsonOk, parseBody, withApiUser } from "@/server/authorization/api";
import { createSupportRequest, listMySupportRequests } from "@/server/services/support";

/** GET /api/support: the caller's own tickets and suggestions. */
export async function GET() {
  return withApiUser(async (user) => jsonOk({ requests: await listMySupportRequests(user.id) }));
}

/** POST /api/support: raise a ticket or send an improvement suggestion. */
export async function POST(request: Request) {
  return withApiUser(async (user) => {
    const input = await parseBody(request, createSupportSchema);
    return jsonOk({ request: await createSupportRequest(user.id, input) }, 201);
  });
}
