import "server-only";
import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { APP_PLANS, priceFor, type BillingCycle, type PlanId } from "@/config/subscriptions";
import { AppError } from "@/server/errors";
import { recordAuditEvent } from "@/server/services/audit";
import { refreshPlanAllowance } from "@/server/services/ai-credits";
import { getActiveWorkspaceForUser } from "@/server/services/workspaces";
import { createRazorpayOrder, razorpayKeyId, verifyPaymentSignature } from "@/server/billing/razorpay";

export type { CurrentPlan } from "@/lib/billing-types";
import type { CurrentPlan } from "@/lib/billing-types";

export interface CheckoutOrder {
  orderId: string;
  keyId: string;
  amountMinor: number;
  currency: string;
  plan: PlanId;
  cycle: BillingCycle;
}

const FREE: CurrentPlan = { plan: "free", cycle: null, currentPeriodEnd: null };

/** The database stores billing cycles in capitals. The app uses lowercase. Convert at this boundary only. */
type DbCycle = "MONTH" | "YEAR";
const toDbCycle = (c: BillingCycle): DbCycle => (c === "month" ? "MONTH" : "YEAR");
const fromDbCycle = (c: DbCycle): BillingCycle => (c === "MONTH" ? "month" : "year");

/** The plan a couple space is on right now. Anything expired or missing counts as Free. */
export async function getActivePlan(workspaceId: number): Promise<CurrentPlan> {
  const sub = await prisma.subscription.findUnique({ where: { workspaceId } });
  if (!sub || sub.currentPeriodEnd.getTime() <= Date.now()) return FREE;
  return {
    plan: sub.plan as PlanId,
    cycle: fromDbCycle(sub.cycle),
    currentPeriodEnd: sub.currentPeriodEnd.toISOString(),
  };
}

/** Adds one month or one year to a date, in UTC. */
function addPeriod(from: Date, cycle: DbCycle): Date {
  const next = new Date(from.getTime());
  if (cycle === "MONTH") next.setUTCMonth(next.getUTCMonth() + 1);
  else next.setUTCFullYear(next.getUTCFullYear() + 1);
  return next;
}

/**
 * Starts an order for a paid plan. The price comes from the plan config, so the browser cannot choose it.
 */
export async function createCheckout(userId: string, planId: PlanId, cycle: BillingCycle): Promise<CheckoutOrder> {
  const workspace = await getActiveWorkspaceForUser(userId);
  if (!workspace) throw new AppError("NO_WORKSPACE", "Create a workspace or join your partner first.", 409);

  const plan = APP_PLANS.find((p) => p.id === planId);
  if (!plan || plan.monthlyMinor === 0) throw new AppError("VALIDATION_FAILED", "Please choose a paid plan.", 400);

  const amountMinor = priceFor(plan, cycle);
  const order = await createRazorpayOrder({
    amountMinor,
    currency: "INR",
    receipt: `tt_${randomUUID().slice(0, 12)}`,
    notes: { workspaceId: String(workspace.id), plan: planId, cycle },
  });

  await prisma.payment.create({
    data: {
      workspaceId: workspace.id,
      userId,
      plan: planId,
      cycle: toDbCycle(cycle),
      amountMinor,
      currency: "INR",
      razorpayOrderId: order.id,
    },
  });

  return { orderId: order.id, keyId: razorpayKeyId(), amountMinor, currency: "INR", plan: planId, cycle };
}

/**
 * Marks a payment as paid and starts or extends the workspace's plan. Safe to run twice: the payment
 * row only moves from CREATED to PAID once, so a repeat call changes nothing.
 */
async function activatePayment(paymentRowId: string, razorpayPaymentId: string): Promise<void> {
  const payment = await prisma.payment.findUnique({ where: { id: paymentRowId } });
  if (!payment) return;

  await prisma.$transaction(async (tx) => {
    const moved = await tx.payment.updateMany({
      where: { id: paymentRowId, status: "CREATED" },
      data: { status: "PAID", razorpayPaymentId, paidAt: new Date() },
    });
    if (moved.count === 0) return;

    const existing = await tx.subscription.findUnique({ where: { workspaceId: payment.workspaceId } });
    const now = new Date();
    // Buying again while a period is still running adds time on the end of it.
    const start = existing && existing.currentPeriodEnd.getTime() > now.getTime() ? existing.currentPeriodEnd : now;
    const end = addPeriod(start, payment.cycle);

    await tx.subscription.upsert({
      where: { workspaceId: payment.workspaceId },
      create: { workspaceId: payment.workspaceId, plan: payment.plan, cycle: payment.cycle, currentPeriodStart: start, currentPeriodEnd: end },
      update: { plan: payment.plan, cycle: payment.cycle, currentPeriodStart: start, currentPeriodEnd: end },
    });
  });

  await recordAuditEvent("billing.payment_completed", payment.userId, { plan: payment.plan, cycle: payment.cycle });
  // Grant this month's plan credits right away, so the purchase is visible at once.
  await refreshPlanAllowance(payment.userId);
}

/** Called by the browser after Razorpay Checkout succeeds. Verifies the signature before activating. */
export async function confirmPayment(userId: string, input: { orderId: string; paymentId: string; signature: string }): Promise<CurrentPlan> {
  if (!verifyPaymentSignature(input.orderId, input.paymentId, input.signature)) {
    throw new AppError("VALIDATION_FAILED", "We could not verify this payment. If money was taken, contact support.", 400);
  }
  const payment = await prisma.payment.findUnique({ where: { razorpayOrderId: input.orderId } });
  if (!payment || payment.userId !== userId) throw new AppError("NOT_FOUND", "We could not find that payment.", 404);

  await activatePayment(payment.id, input.paymentId);
  return getActivePlan(payment.workspaceId);
}

/**
 * Webhook from Razorpay. It covers payments whose browser step never came back, for example when the
 * tab closed right after paying. Only events with a valid signature are used.
 */
export async function handleCapturedPayment(orderId: string, paymentId: string): Promise<void> {
  const payment = await prisma.payment.findUnique({ where: { razorpayOrderId: orderId } });
  if (!payment) return;
  await activatePayment(payment.id, paymentId);
}
