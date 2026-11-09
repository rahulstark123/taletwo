import { astroReplySchema } from "@/lib/validations/astro";
import { jsonOk, parseBody, withApiUser } from "@/server/authorization/api";
import { askAstro } from "@/server/services/astro";

/** POST /api/astro/reply: one Astro AI reply for a topic. Credits and plan limits are checked on the server. */
export async function POST(request: Request) {
  return withApiUser(
    async (user) => {
      const input = await parseBody(request, astroReplySchema);
      return jsonOk(await askAstro(user.id, input));
    },
    { requireOnboarded: true }
  );
}
