import "server-only";
import { prisma } from "@/lib/prisma";

const DAY = 24 * 60 * 60 * 1000;

export interface Trend {
  current: number;
  previous: number;
  /** Percentage change from the previous 30 days. Null when there was nothing before. */
  change: number | null;
}

function trend(current: number, previous: number): Trend {
  return { current, previous, change: previous === 0 ? null : Math.round(((current - previous) / previous) * 100) };
}

export interface DailyPoint {
  day: string;
  users: number;
  workspaces: number;
}

export interface Overview {
  totals: { users: number; verifiedUsers: number; workspaces: number; couples: number; openTickets: number };
  users: Trend;
  workspaces: Trend;
  tickets: Trend;
  paidPlans: { pro: number; max: number };
  revenue: { currency: string; current: number; previous: number }[];
  daily: DailyPoint[];
}

/** The numbers the admin overview shows. Everything compares the last 30 days with the 30 before. */
export async function getOverview(): Promise<Overview> {
  const now = new Date();
  const d30 = new Date(now.getTime() - 30 * DAY);
  const d60 = new Date(now.getTime() - 60 * DAY);

  const [
    users,
    verifiedUsers,
    workspaces,
    usersLast30,
    usersPrev30,
    workspacesLast30,
    workspacesPrev30,
    ticketsLast30,
    ticketsPrev30,
    openTickets,
    activeSubs,
    recentUsers,
    recentWorkspaces,
    membership,
  ] = await Promise.all([
    prisma.userProfile.count(),
    prisma.userProfile.count({ where: { emailVerifiedAt: { not: null } } }),
    prisma.workspace.count(),
    prisma.userProfile.count({ where: { createdAt: { gte: d30 } } }),
    prisma.userProfile.count({ where: { createdAt: { gte: d60, lt: d30 } } }),
    prisma.workspace.count({ where: { createdAt: { gte: d30 } } }),
    prisma.workspace.count({ where: { createdAt: { gte: d60, lt: d30 } } }),
    prisma.supportRequest.count({ where: { createdAt: { gte: d30 } } }),
    prisma.supportRequest.count({ where: { createdAt: { gte: d60, lt: d30 } } }),
    prisma.supportRequest.count({ where: { status: { in: ["OPEN", "IN_PROGRESS"] } } }),
    prisma.subscription.findMany({ where: { currentPeriodEnd: { gt: now } }, select: { plan: true } }),
    prisma.userProfile.findMany({ where: { createdAt: { gte: d30 } }, select: { createdAt: true } }),
    prisma.workspace.findMany({ where: { createdAt: { gte: d30 } }, select: { createdAt: true } }),
    prisma.workspaceMember.groupBy({ by: ["workspaceId"], where: { status: "ACTIVE" }, _count: { _all: true } }),
  ]);

  // Revenue for the last 30 days and the 30 before, per currency, in whole units.
  const revenueByCurrency = new Map<string, { current: number; previous: number }>();
  const paidRows = await prisma.payment.findMany({
    where: { status: "PAID", paidAt: { gte: d60 } },
    select: { currency: true, amountMinor: true, paidAt: true },
  });
  for (const row of paidRows) {
    const bucket = revenueByCurrency.get(row.currency) ?? { current: 0, previous: 0 };
    const isCurrent = row.paidAt !== null && row.paidAt >= d30;
    if (isCurrent) bucket.current += row.amountMinor / 100;
    else bucket.previous += row.amountMinor / 100;
    revenueByCurrency.set(row.currency, bucket);
  }

  // A day-by-day count for the chart, oldest first.
  const days: DailyPoint[] = [];
  for (let i = 29; i >= 0; i -= 1) {
    const day = new Date(now.getTime() - i * DAY).toISOString().slice(0, 10);
    days.push({ day, users: 0, workspaces: 0 });
  }
  const index = new Map(days.map((d, i) => [d.day, i]));
  for (const u of recentUsers) {
    const i = index.get(u.createdAt.toISOString().slice(0, 10));
    if (i !== undefined) days[i].users += 1;
  }
  for (const w of recentWorkspaces) {
    const i = index.get(w.createdAt.toISOString().slice(0, 10));
    if (i !== undefined) days[i].workspaces += 1;
  }

  const plans = { pro: 0, max: 0 };
  for (const sub of activeSubs) {
    if (sub.plan === "pro") plans.pro += 1;
    if (sub.plan === "max") plans.max += 1;
  }

  return {
    totals: {
      users,
      verifiedUsers,
      workspaces,
      couples: membership.filter((m) => m._count._all >= 2).length,
      openTickets,
    },
    users: trend(usersLast30, usersPrev30),
    workspaces: trend(workspacesLast30, workspacesPrev30),
    tickets: trend(ticketsLast30, ticketsPrev30),
    paidPlans: plans,
    revenue: [...revenueByCurrency.entries()].map(([currency, v]) => ({ currency, current: v.current, previous: v.previous })),
    daily: days,
  };
}
