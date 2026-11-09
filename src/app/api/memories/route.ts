import { createMemorySchema, memoryFilterSchema } from "@/lib/validations/memories";
import { jsonOk, parseBody, withApiUser } from "@/server/authorization/api";
import { AppError } from "@/server/errors";
import { createMemory, listMemories } from "@/server/services/memories";

/** GET /api/memories?category=&favourite=true&year=&q=  : memories for the caller's workspace. */
export async function GET(request: Request) {
  return withApiUser(
    async (user) => {
      const params = Object.fromEntries(new URL(request.url).searchParams.entries());
      const parsed = memoryFilterSchema.safeParse(params);
      if (!parsed.success) throw new AppError("VALIDATION_FAILED", "Unknown filter for memories.", 400);
      return jsonOk(await listMemories(user.id, parsed.data));
    },
    { requireOnboarded: true }
  );
}

/** POST /api/memories: save a memory whose photos were already uploaded to private storage. */
export async function POST(request: Request) {
  return withApiUser(
    async (user) => {
      const input = await parseBody(request, createMemorySchema);
      return jsonOk({ memory: await createMemory(user.id, input) }, 201);
    },
    { requireOnboarded: true }
  );
}
