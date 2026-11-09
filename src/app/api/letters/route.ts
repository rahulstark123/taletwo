import { createLetterSchema } from "@/lib/validations/letters";
import { jsonOk, parseBody, withApiUser } from "@/server/authorization/api";
import { createLetter, listLetters } from "@/server/services/letters";

/** GET /api/letters: the letters the caller can see in their space, with the plan's monthly allowance. */
export async function GET() {
  return withApiUser(async (user) => jsonOk(await listLetters(user.id)), { requireOnboarded: true });
}

/** POST /api/letters: write a letter. delivery is "now", "schedule" (needs Pro or Max) or "draft". */
export async function POST(request: Request) {
  return withApiUser(
    async (user) => {
      const input = await parseBody(request, createLetterSchema);
      return jsonOk({ letter: await createLetter(user.id, input) }, 201);
    },
    { requireOnboarded: true }
  );
}
