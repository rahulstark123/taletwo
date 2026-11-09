import { createNoteSchema } from "@/lib/validations/notes";
import { jsonOk, parseBody, withApiUser } from "@/server/authorization/api";
import { createNote, listNotes } from "@/server/services/notes";

/** GET /api/notes: shared notes for the caller's workspace. */
export async function GET() {
  return withApiUser(async (user) => jsonOk(await listNotes(user.id)), { requireOnboarded: true });
}

/** POST /api/notes: create a shared note. */
export async function POST(request: Request) {
  return withApiUser(
    async (user) => {
      const input = await parseBody(request, createNoteSchema);
      return jsonOk({ note: await createNote(user.id, input) }, 201);
    },
    { requireOnboarded: true }
  );
}
