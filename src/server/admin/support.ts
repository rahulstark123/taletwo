import "server-only";
import { prisma } from "@/lib/prisma";

export type SupportFilter = "ALL" | "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";

export interface SupportRow {
  id: string;
  type: string;
  category: string;
  priority: string;
  status: string;
  subject: string;
  createdAt: string;
  userName: string;
  userEmail: string;
  replies: number;
}

/** Support requests from everyone, newest first, optionally limited to one status. */
export async function listSupportForAdmin(filter: SupportFilter): Promise<SupportRow[]> {
  const rows = await prisma.supportRequest.findMany({
    where: filter === "ALL" ? {} : { status: filter },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    take: 200,
    include: { user: { select: { displayName: true, email: true } }, _count: { select: { replies: true } } },
  });
  return rows.map((r) => ({
    id: r.id,
    type: r.type,
    category: r.category,
    priority: r.priority,
    status: r.status,
    subject: r.subject,
    createdAt: r.createdAt.toISOString(),
    userName: r.user.displayName,
    userEmail: r.user.email,
    replies: r._count.replies,
  }));
}

export interface SupportDetail {
  id: string;
  type: string;
  category: string;
  priority: string;
  status: string;
  subject: string;
  message: string;
  createdAt: string;
  user: { name: string; email: string; plan: string };
  replies: { id: string; body: string; createdAt: string; byTeam: boolean }[];
}

/** One request with the person who raised it and the reply thread. */
export async function getSupportForAdmin(id: string): Promise<SupportDetail | null> {
  const r = await prisma.supportRequest.findUnique({
    where: { id },
    include: {
      user: { select: { displayName: true, email: true } },
      replies: { orderBy: { createdAt: "asc" }, select: { id: true, body: true, createdAt: true, authorId: true } },
    },
  });
  if (!r) return null;
  const sub = await prisma.workspaceMember.findFirst({
    where: { userId: r.userId, status: "ACTIVE" },
    select: { workspace: { select: { subscription: { select: { plan: true, currentPeriodEnd: true } } } } },
  });
  const active = sub?.workspace.subscription && sub.workspace.subscription.currentPeriodEnd > new Date() ? sub.workspace.subscription.plan : "free";
  return {
    id: r.id,
    type: r.type,
    category: r.category,
    priority: r.priority,
    status: r.status,
    subject: r.subject,
    message: r.message,
    createdAt: r.createdAt.toISOString(),
    user: { name: r.user.displayName, email: r.user.email, plan: active },
    replies: r.replies.map((x) => ({ id: x.id, body: x.body, createdAt: x.createdAt.toISOString(), byTeam: x.authorId !== null })),
  };
}
