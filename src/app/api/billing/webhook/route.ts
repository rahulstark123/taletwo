import { NextResponse } from "next/server";
import { verifyWebhookSignature } from "@/server/billing/razorpay";
import { errorResponse } from "@/server/authorization/api";
import { handleCapturedPayment } from "@/server/services/billing";

/**
 * POST /api/billing/webhook: Razorpay calls this after a payment is captured. Not a user route, so there
 * is no session. The signature check is the only gate, so it runs before anything else.
 */
export async function POST(request: Request) {
  try {
    const raw = await request.text();
    const signature = request.headers.get("x-razorpay-signature") ?? "";
    if (!signature || !verifyWebhookSignature(raw, signature)) {
      return NextResponse.json({ ok: false, error: { code: "FORBIDDEN", message: "Invalid signature." } }, { status: 400 });
    }
    const event = JSON.parse(raw) as { event?: string; payload?: { payment?: { entity?: { id?: string; order_id?: string } } } };
    if (event.event === "payment.captured") {
      const entity = event.payload?.payment?.entity;
      if (entity?.id && entity.order_id) await handleCapturedPayment(entity.order_id, entity.id);
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    return errorResponse(error);
  }
}
