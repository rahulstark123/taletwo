import { createConfessionSchema } from "@/lib/validations/confessions";
import { jsonOk, parseBody, withApiUser } from "@/server/authorization/api";
import { createConfession, listConfessions } from "@/server/services/confessions";

/** GET /api/confessions: the confessions the caller can see, without titles or text. */
export async function GET() {
  return withApiUser(async (user) => jsonOk(await listConfessions(user.id)), { requireOnboarded: true });
}

/** POST /api/confessions: save an already-encrypted confession. The server never receives the password. */
export async function POST(request: Request) {
  return withApiUser(
    async (user) => {
      const input = await parseBody(request, createConfessionSchema);
      return jsonOk({ confession: await createConfession(user.id, input) }, 201);
    },
    { requireOnboarded: true }
  );
}
