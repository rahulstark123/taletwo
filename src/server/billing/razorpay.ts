import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { AppError } from "@/server/errors";

/**
 * Razorpay over its REST API. Secrets stay on the server. Every amount is computed on the server
 * from the plan config, never taken from the browser.
 */

const API_BASE = "https://api.razorpay.com/v1";

function env(name: string): string {
  const value = process.env[name];
  if (!value) throw new AppError("INTERNAL", "Payments are not configured yet. Please try again later.", 503);
  return value;
}

export function razorpayKeyId(): string {
  return env("RAZORPAY_KEY_ID");
}

export interface RazorpayOrder {
  id: string;
  amount: number;
  currency: string;
}

/** Creates an order for one payment. Amount is in paise. */
export async function createRazorpayOrder(input: { amountMinor: number; currency: string; receipt: string; notes: Record<string, string> }): Promise<RazorpayOrder> {
  const auth = Buffer.from(`${env("RAZORPAY_KEY_ID")}:${env("RAZORPAY_KEY_SECRET")}`).toString("base64");
  const res = await fetch(`${API_BASE}/orders`, {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Basic ${auth}` },
    body: JSON.stringify({ amount: input.amountMinor, currency: input.currency, receipt: input.receipt, notes: input.notes }),
  });
  if (!res.ok) {
    console.error("[razorpay] order creation failed", res.status);
    throw new AppError("INTERNAL", "We could not start the payment. Please try again.", 502);
  }
  return (await res.json()) as RazorpayOrder;
}

function safeEqualHex(expected: string, given: string): boolean {
  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(given, "utf8");
  return a.length === b.length && timingSafeEqual(a, b);
}

/** Checks the signature Razorpay returns after a successful checkout. */
export function verifyPaymentSignature(orderId: string, paymentId: string, signature: string): boolean {
  const expected = createHmac("sha256", env("RAZORPAY_KEY_SECRET")).update(`${orderId}|${paymentId}`).digest("hex");
  return safeEqualHex(expected, signature);
}

/** Checks the signature on a webhook call, using the webhook secret from the Razorpay dashboard. */
export function verifyWebhookSignature(rawBody: string, signature: string): boolean {
  const expected = createHmac("sha256", env("RAZORPAY_WEBHOOK_SECRET")).update(rawBody).digest("hex");
  return safeEqualHex(expected, signature);
}
