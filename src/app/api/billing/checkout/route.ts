import { checkoutSchema } from "@/lib/validations/billing";
import { jsonOk, parseBody, withApiUser } from "@/server/authorization/api";
import { createCheckout } from "@/server/services/billing";

/** POST /api/billing/checkout: starts a Razorpay order for Pro or Max. The price is set on the server. */
export async function POST(request: Request) {
  return withApiUser(
    async (user) => {
      const input = await parseBody(request, checkoutSchema);
      return jsonOk(await createCheckout(user.id, input.plan, input.cycle));
    },
    { requireOnboarded: true }
  );
}
