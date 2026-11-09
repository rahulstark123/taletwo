import "server-only";
import { prisma } from "@/lib/prisma";
import { SIGNUP_AI_CREDITS, costOf, AI_FEATURE_COSTS, PLAN_AI_CREDITS_PER_MONTH, type AiFeature } from "@/config/ai-credits";
import type { PlanId } from "@/config/subscriptions";
import { AppError } from "@/server/errors";

/**
 * Creates the wallet with the signup grant, once. Safe to call on every sign-in: an existing wallet is
 * left alone, so no one gets the grant twice.
 */
export async function ensureWallet(userId: string): Promise<void> {
  // Fast path: the wallet almost always exists, so one read is enough.
  const existing = await prisma.aiCreditWallet.findUnique({ where: { userId }, select: { userId: true } });
  if (existing) return;
  await prisma.$transaction(async (tx) => {
    const existing = await tx.aiCreditWallet.findUnique({ where: { userId }, select: { userId: true } });
    if (existing) return;
    await tx.aiCreditWallet.create({ data: { userId, balance: SIGNUP_AI_CREDITS } });
    await tx.aiCreditEntry.create({
      data: { userId, delta: SIGNUP_AI_CREDITS, reason: "SIGNUP_GRANT", balanceAfter: SIGNUP_AI_CREDITS },
    });
  });
}

/** The plan this person's couple space is on right now. Free when nothing is active. */
async function currentPlanFor(userId: string): Promise<PlanId> {
  const membership = await prisma.workspaceMember.findFirst({
    where: { userId, status: "ACTIVE" },
    select: { workspaceId: true },
  });
  if (!membership) return "free";
  const sub = await prisma.subscription.findUnique({ where: { workspaceId: membership.workspaceId } });
  if (!sub || sub.currentPeriodEnd.getTime() <= Date.now()) return "free";
  return sub.plan as PlanId;
}

function addOneMonth(from: Date): Date {
  const next = new Date(from.getTime());
  next.setUTCMonth(next.getUTCMonth() + 1);
  return next;
}

/**
 * Adds the monthly credits of the person's plan when they are due: once a month while the plan is
 * active. Grants are applied the next time the person opens Astro AI or their balance is read, not on
 * the exact day. The row is locked first, so two requests cannot both grant the same month.
 */
export async function refreshPlanAllowance(userId: string): Promise<void> {
  const plan = await currentPlanFor(userId);
  const amount = PLAN_AI_CREDITS_PER_MONTH[plan];
  if (!amount) return;

  await prisma.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT "userId" FROM "ai_credit_wallets" WHERE "userId" = ${userId}::uuid FOR UPDATE`;
    const last = await tx.aiCreditEntry.findFirst({
      where: { userId, reason: "PLAN_ALLOWANCE" },
      orderBy: { createdAt: "desc" },
      select: { createdAt: true },
    });
    if (last && addOneMonth(last.createdAt).getTime() > Date.now()) return;

    const wallet = await tx.aiCreditWallet.update({
      where: { userId },
      data: { balance: { increment: amount } },
      select: { balance: true },
    });
    await tx.aiCreditEntry.create({
      data: { userId, delta: amount, reason: "PLAN_ALLOWANCE", feature: plan, balanceAfter: wallet.balance },
    });
  });
}

/** Wallet exists and this month's plan credits are applied. Runs before every read or charge. */
async function prepare(userId: string): Promise<void> {
  await ensureWallet(userId);
  await refreshPlanAllowance(userId);
}

/** Current balance, after any credits the plan has due. */
export async function getBalance(userId: string): Promise<number> {
  await prepare(userId);
  const wallet = await prisma.aiCreditWallet.findUniqueOrThrow({ where: { userId }, select: { balance: true } });
  return wallet.balance;
}

/**
 * Charges one use of an Astro AI feature. The balance is reduced only if it covers the cost, in a
 * single conditional update, so two requests at once cannot spend the same credits twice.
 */
export async function spendCredits(userId: string, feature: AiFeature): Promise<number> {
  await prepare(userId);
  const cost = costOf(feature);

  return prisma.$transaction(async (tx) => {
    const moved = await tx.aiCreditWallet.updateMany({
      where: { userId, balance: { gte: cost } },
      data: { balance: { decrement: cost } },
    });
    if (moved.count === 0) {
      throw new AppError(
        "INSUFFICIENT_CREDITS",
        `You need ${cost} AI credits for this. Top up or wait for your plan to add more.`,
        402
      );
    }
    const wallet = await tx.aiCreditWallet.findUniqueOrThrow({ where: { userId }, select: { balance: true } });
    await tx.aiCreditEntry.create({
      data: { userId, delta: -cost, reason: "FEATURE_CHARGE", feature, balanceAfter: wallet.balance },
    });
    return wallet.balance;
  });
}

/** Gives credits back when a charged feature fails before it produced a reply. */
export async function refundCredits(userId: string, feature: AiFeature, amount: number): Promise<void> {
  await prisma.$transaction(async (tx) => {
    const wallet = await tx.aiCreditWallet.update({
      where: { userId },
      data: { balance: { increment: amount } },
      select: { balance: true },
    });
    await tx.aiCreditEntry.create({
      data: { userId, delta: amount, reason: "REFUND", feature, balanceAfter: wallet.balance },
    });
  });
}

/** Chat sessions started today (UTC) that were charged and not refunded. */
export async function chatSessionsToday(userId: string, since: Date): Promise<number> {
  const [charged, refunded] = await Promise.all([
    prisma.aiCreditEntry.count({ where: { userId, reason: "FEATURE_CHARGE", feature: "chat", createdAt: { gte: since } } }),
    prisma.aiCreditEntry.count({ where: { userId, reason: "REFUND", feature: "chat", createdAt: { gte: since } } }),
  ]);
  return Math.max(0, charged - refunded);
}

/** What each feature costs, for display. */
export function featureCosts() {
  return AI_FEATURE_COSTS;
}
