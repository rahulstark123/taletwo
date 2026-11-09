import "server-only";
import { prisma } from "@/lib/prisma";

export interface PersonRow {
  id: string;
  name: string;
  email: string;
  verified: boolean;
  joined: string;
  spaceId: number | null;
  plan: string;
}

/** People by name or email, newest first. The search is case-insensitive. */
export async function listPeopleForAdmin(query: string): Promise<PersonRow[]> {
  const q = query.trim();
  const rows = await prisma.userProfile.findMany({
    where: q
      ? { OR: [{ email: { contains: q, mode: "insensitive" } }, { displayName: { contains: q, mode: "insensitive" } }] }
      : {},
    orderBy: { createdAt: "desc" },
    take: 100,
    select: {
      id: true,
      displayName: true,
      email: true,
      emailVerifiedAt: true,
      createdAt: true,
      memberships: { where: { status: "ACTIVE" }, select: { workspaceId: true, workspace: { select: { subscription: { select: { plan: true, currentPeriodEnd: true } } } } } },
    },
  });
  const now = new Date();
  return rows.map((r) => {
    const m = r.memberships[0];
    const sub = m?.workspace.subscription;
    return {
      id: r.id,
      name: r.displayName,
      email: r.email,
      verified: r.emailVerifiedAt !== null,
      joined: r.createdAt.toISOString(),
      spaceId: m?.workspaceId ?? null,
      plan: sub && sub.currentPeriodEnd > now ? sub.plan : "free",
    };
  });
}

export interface PersonDetail extends PersonRow {
  credits: number;
  partnerName: string | null;
  supportRequests: number;
  payments: { id: string; plan: string; cycle: string; amount: number; currency: string; status: string; date: string }[];
}

/** One person with their space, credits, support history and payments. */
export async function getPersonForAdmin(id: string): Promise<PersonDetail | null> {
  const r = await prisma.userProfile.findUnique({
    where: { id },
    select: {
      id: true,
      displayName: true,
      email: true,
      emailVerifiedAt: true,
      createdAt: true,
      aiWallet: { select: { balance: true } },
      memberships: {
        where: { status: "ACTIVE" },
        select: {
          workspaceId: true,
          workspace: {
            select: {
              subscription: { select: { plan: true, currentPeriodEnd: true } },
              members: { where: { status: "ACTIVE" }, select: { userId: true, user: { select: { displayName: true } } } },
            },
          },
        },
      },
      _count: { select: { supportRequests: true } },
    },
  });
  if (!r) return null;
  const m = r.memberships[0];
  const sub = m?.workspace.subscription;
  const partner = m?.workspace.members.find((x) => x.userId !== r.id)?.user.displayName ?? null;
  const payments = await prisma.payment.findMany({
    where: { userId: r.id },
    orderBy: { createdAt: "desc" },
    take: 20,
    select: { id: true, plan: true, cycle: true, amountMinor: true, currency: true, status: true, createdAt: true },
  });
  return {
    id: r.id,
    name: r.displayName,
    email: r.email,
    verified: r.emailVerifiedAt !== null,
    joined: r.createdAt.toISOString(),
    spaceId: m?.workspaceId ?? null,
    plan: sub && sub.currentPeriodEnd > new Date() ? sub.plan : "free",
    credits: r.aiWallet?.balance ?? 0,
    partnerName: partner,
    supportRequests: r._count.supportRequests,
    payments: payments.map((p) => ({
      id: p.id,
      plan: p.plan,
      cycle: p.cycle === "MONTH" ? "Monthly" : "Yearly",
      amount: p.amountMinor / 100,
      currency: p.currency,
      status: p.status,
      date: p.createdAt.toISOString(),
    })),
  };
}

export interface PaymentRow {
  id: string;
  name: string;
  email: string;
  plan: string;
  cycle: string;
  amount: number;
  currency: string;
  status: string;
  reference: string | null;
  date: string;
}

/** Latest payments across the app, newest first. */
export async function listPaymentsForAdmin(): Promise<PaymentRow[]> {
  const rows = await prisma.payment.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    select: {
      id: true,
      plan: true,
      cycle: true,
      amountMinor: true,
      currency: true,
      status: true,
      razorpayPaymentId: true,
      createdAt: true,
      user: { select: { displayName: true, email: true } },
    },
  });
  return rows.map((p) => ({
    id: p.id,
    name: p.user.displayName,
    email: p.user.email,
    plan: p.plan,
    cycle: p.cycle === "MONTH" ? "Monthly" : "Yearly",
    amount: p.amountMinor / 100,
    currency: p.currency,
    status: p.status,
    reference: p.razorpayPaymentId,
    date: p.createdAt.toISOString(),
  }));
}
