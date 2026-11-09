import { bucketFilterSchema, createBucketSchema } from "@/lib/validations/bucket";
import { jsonOk, parseBody, withApiUser } from "@/server/authorization/api";
import { AppError } from "@/server/errors";
import { createBucketItem, listBucketItems } from "@/server/services/bucket";

/** GET /api/bucket-list?status=PENDING|COMPLETED&category=TRAVEL|...: dreams for the caller's workspace. */
export async function GET(request: Request) {
  return withApiUser(
    async (user) => {
      const params = Object.fromEntries(new URL(request.url).searchParams.entries());
      const parsed = bucketFilterSchema.safeParse(params);
      if (!parsed.success) throw new AppError("VALIDATION_FAILED", "Unknown filter for the bucket list.", 400);
      return jsonOk(await listBucketItems(user.id, parsed.data));
    },
    { requireOnboarded: true }
  );
}

/** POST /api/bucket-list: add a dream. */
export async function POST(request: Request) {
  return withApiUser(
    async (user) => {
      const input = await parseBody(request, createBucketSchema);
      return jsonOk({ item: await createBucketItem(user.id, input) }, 201);
    },
    { requireOnboarded: true }
  );
}
