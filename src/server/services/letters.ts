import "server-only";
import { prisma } from "@/lib/prisma";
import { limitMessage } from "@/config/plan-limits";
import type { LetterDTO, LetterKind, LetterPaperStyle, LettersPayload } from "@/lib/letters-types";
import { createLetterSchema, type CreateLetterInput, type UpdateLetterInput } from "@/lib/validations/letters";
import { AppError } from "@/server/errors";
import { limitsForWorkspace } from "@/server/services/plan-limits";
import { getActiveWorkspaceForUser } from "@/server/services/workspaces";

type Member = { userId: string; displayName: string };

type LetterRow = {
  id: string;
  workspaceId: number;
  senderId: string;
  recipientId: string | null;
  title: string;
  body: string;
  occasion: string;
  paper: LetterPaperStyle;
  status: "DRAFT" | "SENT";
  opensAt: Date | null;
  sentAt: Date | null;
  readAt: Date | null;
  createdAt: Date;
  sender: { displayName: string };
  recipient: { displayName: string } | null;
};

const INCLUDE = {
  sender: { select: { displayName: true } },
  recipient: { select: { displayName: true } },
} as const;

async function requireWorkspace(userId: string) {
  const workspace = await getActiveWorkspaceForUser(userId);
  if (!workspace) throw new AppError("NO_WORKSPACE", "Create a workspace or join your partner first.", 409);
  return workspace;
}

function partnerOf(members: Member[], me: string): Member | null {
  return members.find((m) => m.userId !== me) ?? null;
}

/** A letter the recipient must not read yet: sent, with an opening time still in the future. */
function isSealedFor(row: Pick<LetterRow, "status" | "opensAt">, now: number) {
  return row.status === "SENT" && row.opensAt !== null && row.opensAt.getTime() > now;
}

/** Drafts and sealed scheduled letters can still be changed or cancelled by their writer. */
function isEditable(row: Pick<LetterRow, "status" | "opensAt">, now: number) {
  return row.status === "DRAFT" || isSealedFor(row, now);
}

function kindFor(row: LetterRow, me: string, now: number): LetterKind {
  if (row.status === "DRAFT") return "draft";
  if (row.senderId !== me) return "received";
  return row.opensAt !== null && row.opensAt.getTime() > now ? "scheduled" : "sent";
}

/** Builds the client view. A recipient never receives the title or body of a letter that is still sealed. */
function toDTO(row: LetterRow, me: string, now: number): LetterDTO {
  const sealed = row.senderId !== me && isSealedFor(row, now);
  return {
    id: row.id,
    kind: kindFor(row, me, now),
    title: sealed ? "" : row.title,
    body: sealed ? "" : row.body,
    occasion: row.occasion,
    paper: row.paper,
    from: row.sender.displayName,
    to: row.recipient?.displayName ?? "",
    isMine: row.senderId === me,
    sealed,
    createdAt: (row.sentAt ?? row.createdAt).toISOString(),
    opensAt: row.opensAt ? row.opensAt.toISOString() : null,
    read: row.senderId === me ? true : row.readAt !== null,
  };
}

function startOfMonthUTC(now: number) {
  const d = new Date(now);
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1));
}

async function sentThisMonth(workspaceId: number, now: number, excludeId?: string) {
  return prisma.letter.count({
    where: {
      workspaceId,
      deletedAt: null,
      status: "SENT",
      sentAt: { gte: startOfMonthUTC(now) },
      ...(excludeId ? { id: { not: excludeId } } : {}),
    },
  });
}

/** Stops a send that the space's plan does not allow: scheduling, and the monthly letter count. */
async function assertCanSend(workspaceId: number, opensAt: Date | null, now: number, excludeId?: string) {
  const { plan, limits } = await limitsForWorkspace(workspaceId);
  if (opensAt && !limits.scheduledLetters) {
    throw new AppError(
      "PLAN_LIMIT",
      "Scheduling a letter for its day is part of Pro and Max. Send it now, or upgrade to schedule it.",
      403
    );
  }
  if (Number.isFinite(limits.lettersPerMonth)) {
    const used = await sentThisMonth(workspaceId, now, excludeId);
    if (used + 1 > limits.lettersPerMonth) {
      throw new AppError("PLAN_LIMIT", limitMessage(plan, "letters a month", limits.lettersPerMonth), 403);
    }
  }
}

/** Letters the caller can see: their own (drafts included), and the ones sent to them. */
export async function listLetters(userId: string): Promise<LettersPayload> {
  const workspace = await requireWorkspace(userId);
  const now = Date.now();
  const [rows, { plan, limits }, used] = await Promise.all([
    prisma.letter.findMany({
      where: {
        workspaceId: workspace.id,
        deletedAt: null,
        OR: [{ senderId: userId }, { recipientId: userId, status: "SENT" }],
      },
      include: INCLUDE,
      orderBy: [{ sentAt: "desc" }, { createdAt: "desc" }],
      take: 300,
    }) as Promise<LetterRow[]>,
    limitsForWorkspace(workspace.id),
    sentThisMonth(workspace.id, now),
  ]);

  const me = workspace.members.find((m) => m.userId === userId);
  const partner = partnerOf(workspace.members, userId);
  return {
    workspaceId: workspace.id,
    currentUserId: userId,
    currentName: me?.displayName ?? "You",
    partnerName: partner?.displayName ?? "your partner",
    letters: rows.map((r) => toDTO(r, userId, now)),
    plan,
    canSchedule: limits.scheduledLetters,
    sentThisMonth: used,
    monthlyLimit: Number.isFinite(limits.lettersPerMonth) ? limits.lettersPerMonth : null,
  };
}

export async function createLetter(userId: string, input: CreateLetterInput): Promise<LetterDTO> {
  const workspace = await requireWorkspace(userId);
  const now = Date.now();
  const partner = partnerOf(workspace.members, userId);
  const isDraft = input.delivery === "draft";
  const opensAt = input.delivery === "schedule" && input.opensAt ? new Date(input.opensAt) : null;

  if (!isDraft) {
    if (!partner) throw new AppError("NO_WORKSPACE", "Your partner needs to join before you can send a letter.", 409);
    await assertCanSend(workspace.id, opensAt, now);
  }

  const row = (await prisma.letter.create({
    data: {
      workspaceId: workspace.id,
      senderId: userId,
      recipientId: partner?.userId ?? null,
      title: input.title,
      body: input.body,
      occasion: input.occasion,
      paper: input.paper,
      status: isDraft ? "DRAFT" : "SENT",
      opensAt,
      sentAt: isDraft ? null : new Date(now),
    },
    include: INCLUDE,
  })) as LetterRow;
  return toDTO(row, userId, now);
}

/** Loads a letter the caller wrote in their current space. */
async function findOwnLetter(userId: string, letterId: string) {
  const workspace = await requireWorkspace(userId);
  const row = (await prisma.letter.findFirst({
    where: { id: letterId, workspaceId: workspace.id, senderId: userId, deletedAt: null },
    include: INCLUDE,
  })) as LetterRow | null;
  if (!row) throw new AppError("NOT_FOUND", "This letter could not be found. It may have been removed.", 404);
  return { workspace, row };
}

/**
 * Edits a draft, or a scheduled letter that is still sealed. Sent letters that have opened are not changed.
 * The merged result is checked with the same rules as creating a letter.
 */
export async function updateLetter(userId: string, letterId: string, input: UpdateLetterInput): Promise<LetterDTO> {
  const { workspace, row } = await findOwnLetter(userId, letterId);
  const now = Date.now();
  if (!isEditable(row, now)) {
    throw new AppError("VALIDATION_FAILED", "This letter has been sent and can no longer be changed.", 409);
  }

  const currentDelivery = row.status === "DRAFT" ? "draft" : row.opensAt ? "schedule" : "now";
  const delivery = input.delivery ?? currentDelivery;
  if (row.status === "SENT" && delivery === "draft") {
    throw new AppError("VALIDATION_FAILED", "A letter that has been sent cannot go back to a draft.", 409);
  }

  const merged = {
    title: input.title ?? row.title,
    body: input.body ?? row.body,
    occasion: input.occasion ?? row.occasion,
    paper: input.paper ?? row.paper,
    delivery,
    opensAt: input.opensAt !== undefined ? input.opensAt : row.opensAt?.toISOString() ?? null,
  };
  const check = createLetterSchema.safeParse(merged);
  if (!check.success) {
    throw new AppError("VALIDATION_FAILED", check.error.issues[0]?.message ?? "Please check the letter and try again.", 400);
  }

  const partner = partnerOf(workspace.members, userId);
  const becomingSent = row.status === "DRAFT" && delivery !== "draft";
  const opensAt = delivery === "schedule" && merged.opensAt ? new Date(merged.opensAt) : null;

  if (becomingSent) {
    if (!partner) throw new AppError("NO_WORKSPACE", "Your partner needs to join before you can send a letter.", 409);
    await assertCanSend(workspace.id, opensAt, now);
  } else if (row.status === "SENT" && opensAt && !(await limitsForWorkspace(workspace.id)).limits.scheduledLetters) {
    throw new AppError("PLAN_LIMIT", "Scheduling a letter for its day is part of Pro and Max.", 403);
  }

  const updated = (await prisma.letter.update({
    where: { id: letterId },
    data: {
      title: merged.title,
      body: merged.body,
      occasion: merged.occasion,
      paper: merged.paper,
      status: delivery === "draft" ? "DRAFT" : "SENT",
      opensAt,
      sentAt: becomingSent ? new Date(now) : row.sentAt,
      recipientId: delivery === "draft" ? row.recipientId : partner?.userId ?? row.recipientId,
    },
    include: INCLUDE,
  })) as LetterRow;
  return toDTO(updated, userId, now);
}

/** Cancels a draft or a sealed scheduled letter. Letters that have been sent stay in the history. */
export async function deleteLetter(userId: string, letterId: string): Promise<void> {
  const { row } = await findOwnLetter(userId, letterId);
  if (!isEditable(row, Date.now())) {
    throw new AppError("VALIDATION_FAILED", "Letters that have been sent stay in your history.", 409);
  }
  await prisma.letter.update({ where: { id: letterId }, data: { deletedAt: new Date() } });
}

/** The recipient opens a letter. Marks it read once, and only after it is no longer sealed. */
export async function markLetterRead(userId: string, letterId: string): Promise<LetterDTO> {
  const workspace = await requireWorkspace(userId);
  const now = Date.now();
  const row = (await prisma.letter.findFirst({
    where: { id: letterId, workspaceId: workspace.id, recipientId: userId, status: "SENT", deletedAt: null },
    include: INCLUDE,
  })) as LetterRow | null;
  if (!row) throw new AppError("NOT_FOUND", "This letter could not be found. It may have been removed.", 404);
  if (isSealedFor(row, now)) throw new AppError("NOT_FOUND", "This letter is still sealed until its day.", 403);

  if (row.readAt === null) {
    const updated = (await prisma.letter.update({
      where: { id: letterId },
      data: { readAt: new Date(now) },
      include: INCLUDE,
    })) as LetterRow;
    return toDTO(updated, userId, now);
  }
  return toDTO(row, userId, now);
}
