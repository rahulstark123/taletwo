import { BUCKET_UNDO_WINDOW_MS } from "@/lib/bucket-types";
import { completeBucketSchema, updateBucketSchema } from "@/lib/validations/bucket";
import { jsonOk, parseBody, withApiUser } from "@/server/authorization/api";
import { completeBucketItem, deleteBucketItem, updateBucketItem } from "@/server/services/bucket";

type Params = { params: Promise<{ id: string }> };

/** PATCH /api/bucket-list/:id: edit a dream's details. */
export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params;
  return withApiUser(
    async (user) => {
      const input = await parseBody(request, updateBucketSchema);
      return jsonOk({ item: await updateBucketItem(user.id, id, input) });
    },
    { requireOnboarded: true }
  );
}

/** PUT /api/bucket-list/:id: mark done (with date and memory) or put back on the list. */
export async function PUT(request: Request, { params }: Params) {
  const { id } = await params;
  return withApiUser(
    async (user) => {
      const input = await parseBody(request, completeBucketSchema);
      return jsonOk({ item: await completeBucketItem(user.id, id, input) });
    },
    { requireOnboarded: true }
  );
}

/** DELETE /api/bucket-list/:id: soft delete with an undo window. */
export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params;
  return withApiUser(
    async (user) => {
      await deleteBucketItem(user.id, id);
      return jsonOk({ deleted: true, undoUntil: new Date(Date.now() + BUCKET_UNDO_WINDOW_MS).toISOString() });
    },
    { requireOnboarded: true }
  );
}
