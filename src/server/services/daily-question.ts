import "server-only";
import { prisma } from "@/lib/prisma";
import { QUESTION_BANK, questionIndexFor, workspaceToday, type QuestionCategoryValue } from "@/lib/daily-questions";
import type { DailyHistoryPayload, DailyQuestionView, RevealModeValue } from "@/lib/daily-question-types";
import { AppError } from "@/server/errors";
import { recordAuditEvent } from "@/server/services/audit";
import { getActiveWorkspaceForUser } from "@/server/services/workspaces";

export type { DailyQuestionView, DailyHistoryPayload };

const HISTORY_DAYS = 60;

async function requireWorkspace(userId: string) {
  const summary = await getActiveWorkspaceForUser(userId);
  if (!summary) throw new AppError("NO_WORKSPACE", "Create a workspace or join your partner first.", 409);
  const workspace = await prisma.workspace.findUniqueOrThrow({
    where: { id: summary.id },
    select: { id: true, timezone: true, questionReveal: true },
  });
  return { summary, workspace };
}

/** The partner is the other active member. In a two-person space there is exactly one. */
function partnerOf(members: { userId: string; displayName: string }[], me: string) {
  return members.find((m) => m.userId !== me) ?? null;
}

/**
 * Whether a day's answers are visible to both partners.
 * Past days are always visible. Today follows the workspace's reveal mode.
 */
function revealedFor(day: string, today: string, mode: RevealModeValue, bothAnswered: boolean) {
  if (day < today) return true;
  if (mode === "AT_MIDNIGHT") return false;
  return bothAnswered;
}

/** Builds today's view for one person. The partner's text is only included after the reveal. */
export async function getTodayView(userId: string): Promise<DailyQuestionView> {
  const { summary, workspace } = await requireWorkspace(userId);
  const today = workspaceToday(workspace.timezone);
  const mode = workspace.questionReveal as RevealModeValue;
  const partner = partnerOf(summary.members, userId);

  const answers = await prisma.dailyAnswer.findMany({
    where: { workspaceId: workspace.id, day: new Date(`${today}T00:00:00Z`) },
  });
  const mine = answers.find((a) => a.userId === userId) ?? null;
  const theirs = partner ? answers.find((a) => a.userId === partner.userId) ?? null : null;
  const bothAnswered = Boolean(mine && theirs);
  const revealed = revealedFor(today, today, mode, bothAnswered);

  const index = questionIndexFor(workspace.id, today);
  const q = QUESTION_BANK[index];

  return {
    workspaceId: workspace.id,
    currentUserId: userId,
    timezone: workspace.timezone,
    day: today,
    question: { text: q.text, category: q.category, index },
    revealMode: mode,
    partner: { userId: partner?.userId ?? null, displayName: partner?.displayName ?? "Your partner" },
    mine: mine ? { body: mine.body, updatedAt: mine.updatedAt.toISOString(), heartedByPartner: Boolean(mine.heartedAt) } : null,
    partnerStatus: {
      answered: Boolean(theirs),
      revealed: revealed && Boolean(theirs),
      body: revealed && theirs ? theirs.body : null,
      hearted: Boolean(theirs?.heartedAt),
      heartedByMe: Boolean(theirs?.heartedAt),
    },
    canEdit: !revealed,
  };
}

/** Saves or updates the caller's answer for today. Locked once the answers are revealed. */
export async function saveTodayAnswer(userId: string, body: string): Promise<DailyQuestionView> {
  const { workspace } = await requireWorkspace(userId);
  const today = workspaceToday(workspace.timezone);
  const day = new Date(`${today}T00:00:00Z`);

  const existing = await prisma.dailyAnswer.findUnique({
    where: { workspaceId_userId_day: { workspaceId: workspace.id, userId, day } },
  });
  const current = await getTodayView(userId);
  if (existing && !current.canEdit) {
    throw new AppError("VALIDATION_FAILED", "Answers are locked now that they have been revealed.", 409);
  }
  if (!current.canEdit) {
    throw new AppError("VALIDATION_FAILED", "Answers are already revealed for today. See you tomorrow.", 409);
  }

  await prisma.dailyAnswer.upsert({
    where: { workspaceId_userId_day: { workspaceId: workspace.id, userId, day } },
    create: { workspaceId: workspace.id, userId, day, questionIndex: current.question.index, body },
    update: { body, questionIndex: current.question.index },
  });
  await recordAuditEvent("daily_question.answered", userId, { workspaceId: workspace.id });
  return getTodayView(userId);
}

/** Lets the partner show they loved an answer. Only possible after it is revealed. Toggles on and off. */
export async function toggleHeart(userId: string): Promise<DailyQuestionView> {
  const view = await getTodayView(userId);
  if (!view.partner.userId) throw new AppError("NOT_FOUND", "Your partner has not joined yet.", 404);
  if (!view.partnerStatus.revealed) throw new AppError("VALIDATION_FAILED", "You can react once their answer is revealed.", 409);

  const { workspace } = await requireWorkspace(userId);
  const day = new Date(`${view.day}T00:00:00Z`);
  const theirs = await prisma.dailyAnswer.findUnique({
    where: { workspaceId_userId_day: { workspaceId: workspace.id, userId: view.partner.userId, day } },
  });
  if (!theirs) throw new AppError("NOT_FOUND", "Their answer could not be found.", 404);

  await prisma.dailyAnswer.update({
    where: { id: theirs.id },
    data: { heartedAt: theirs.heartedAt ? null : new Date() },
  });
  return getTodayView(userId);
}

export async function setRevealMode(userId: string, mode: RevealModeValue): Promise<void> {
  const { workspace } = await requireWorkspace(userId);
  await prisma.workspace.update({ where: { id: workspace.id }, data: { questionReveal: mode } });
  await recordAuditEvent("daily_question.settings_changed", userId, { workspaceId: workspace.id });
}

/**
 * Past days with at least one answer. Each day shows the question, the caller's answer, and the partner's
 * answer. Past days are always revealed, so both answers are shown.
 */
export async function getHistory(userId: string, category?: QuestionCategoryValue): Promise<DailyHistoryPayload> {
  const { summary, workspace } = await requireWorkspace(userId);
  const today = workspaceToday(workspace.timezone);
  const partner = partnerOf(summary.members, userId);
  const from = new Date(Date.parse(`${today}T00:00:00Z`) - HISTORY_DAYS * 86_400_000);

  const rows = await prisma.dailyAnswer.findMany({
    where: { workspaceId: workspace.id, day: { gte: from, lt: new Date(`${today}T00:00:00Z`) } },
    orderBy: { day: "desc" },
  });

  const byDay = new Map<string, typeof rows>();
  rows.forEach((r) => {
    const key = r.day.toISOString().slice(0, 10);
    byDay.set(key, [...(byDay.get(key) ?? []), r]);
  });

  const items = [...byDay.entries()].map(([day, list]) => {
    const index = list[0].questionIndex;
    const q = QUESTION_BANK[index];
    const mineRow = list.find((r) => r.userId === userId);
    const theirRow = partner ? list.find((r) => r.userId === partner.userId) : undefined;
    return {
      day,
      question: { text: q.text, category: q.category, index },
      mine: mineRow?.body ?? null,
      partner: { displayName: partner?.displayName ?? "Your partner", answered: Boolean(theirRow), body: theirRow?.body ?? null },
    };
  });

  return {
    workspaceId: workspace.id,
    items: items.filter((i) => !category || i.question.category === category),
  };
}
