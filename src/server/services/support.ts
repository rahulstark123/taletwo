import "server-only";
import { prisma } from "@/lib/prisma";
import type { SupportRequestDTO } from "@/lib/support-types";
import type { CreateSupportInput } from "@/lib/validations/support";
import { recordAuditEvent } from "@/server/services/audit";

/** Support is personal: each person sees only the requests they raised. */
export async function listMySupportRequests(userId: string): Promise<SupportRequestDTO[]> {
  const rows = await prisma.supportRequest.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { replies: { orderBy: { createdAt: "asc" }, select: { id: true, body: true, createdAt: true } } },
  });
  return rows.map((r) => ({
    id: r.id,
    type: r.type,
    category: r.category,
    priority: r.priority,
    status: r.status,
    subject: r.subject,
    message: r.message,
    createdAt: r.createdAt.toISOString(),
    replies: r.replies.map((x) => ({ id: x.id, body: x.body, createdAt: x.createdAt.toISOString() })),
  }));
}

/** Saves a ticket or suggestion from the signed-in user. Suggestions always use the NORMAL priority. */
export async function createSupportRequest(userId: string, input: CreateSupportInput): Promise<SupportRequestDTO> {
  const row = await prisma.supportRequest.create({
    data: {
      userId,
      type: input.type,
      category: input.category,
      priority: input.type === "TICKET" ? input.priority : "NORMAL",
      subject: input.subject,
      message: input.message,
    },
  });
  await recordAuditEvent("support.request_created", userId, { type: input.type });
  return {
    id: row.id,
    type: row.type,
    category: row.category,
    priority: row.priority,
    status: row.status,
    subject: row.subject,
    message: row.message,
    createdAt: row.createdAt.toISOString(),
    replies: [],
  };
}
