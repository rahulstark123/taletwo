import { jsonOk, withApiUser } from "@/server/authorization/api";
import { listMyReceipts } from "@/server/services/receipts";

/** GET /api/billing/receipts: the caller's own paid orders, newest first. */
export async function GET() {
  return withApiUser(async (user) => jsonOk({ receipts: await listMyReceipts(user.id) }), { requireOnboarded: true });
}
