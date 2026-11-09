import { confirmSchema } from "@/lib/validations/billing";
import { jsonOk, parseBody, withApiUser } from "@/server/authorization/api";
import { confirmPayment } from "@/server/services/billing";

/** POST /api/billing/confirm: checks the Razorpay signature and activates the plan. */
export async function POST(request: Request) {
  return withApiUser(
    async (user) => {
      const input = await parseBody(request, confirmSchema);
      return jsonOk({ current: await confirmPayment(user.id, input) });
    },
    { requireOnboarded: true }
  );
}
