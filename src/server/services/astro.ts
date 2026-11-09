import "server-only";
import { prisma } from "@/lib/prisma";
import { AI_FEATURE_COSTS } from "@/config/ai-credits";
import { limitMessage } from "@/config/plan-limits";
import type { AstroReplyInput, AstroTopicSlug } from "@/lib/validations/astro";
import { generateReply, type ChatTurn } from "@/server/astro/groq";
import { systemPromptFor } from "@/server/astro/prompts";
import { AppError } from "@/server/errors";
import { chatSessionsToday, getBalance, refundCredits, spendCredits } from "@/server/services/ai-credits";
import { limitsForWorkspace } from "@/server/services/plan-limits";
import { getActiveWorkspaceForUser } from "@/server/services/workspaces";

export interface AstroReplyResult {
  reply: string;
  topic: AstroTopicSlug;
  /** Credits taken for this reply. Zero when the reply was already paid for today or a chat question was free. */
  cost: number;
  charged: boolean;
  /** True when the reply came from today's stored copy of a daily reading. */
  cached: boolean;
  balance: number;
}

const DAY_MS = 24 * 60 * 60 * 1000;

/** What a single non-chat reading asks when the person gives no note of their own. */
const DEFAULT_ASK: Record<Exclude<AstroTopicSlug, "chat">, string> = {
  partnership: "Give us our compatibility reading.",
  numerology: "Give me my numerology reading.",
  finance: "Give us guidance for our money conversations this month.",
  career: "Give me a career timing and strengths reading.",
  health: "Give me gentle wellbeing guidance for this month.",
  "daily-horoscope": "Give us today's note.",
  festivals: "Suggest good dates for us in the coming weeks.",
};

/** Calendar day in a timezone, YYYY-MM-DD. */
function dayKeyIn(timezone: string, now: Date): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: timezone, year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
}

/** Facts the model may use. Birth details are used for this reply only and are not stored. */
function contextBlock(names: string[], birth: AstroReplyInput["birth"], today: string): string {
  const lines = [`Today's date: ${today}`];
  if (names.length) lines.push(`Names of the two partners: ${names.join(" and ")}`);
  const hasBirth = birth && (birth.date || birth.time || birth.place);
  lines.push(
    hasBirth
      ? `Birth details given: date ${birth?.date ?? "not given"}, time ${birth?.time ?? "not given"}, place ${birth?.place || "not given"}`
      : "Birth details: not given"
  );
  return lines.join("\n");
}

/**
 * Runs one Astro AI request for the caller's space. Checks the plan first, then charges credits, asks the
 * model, and refunds the charge if no reply comes back.
 */
export async function askAstro(userId: string, input: AstroReplyInput): Promise<AstroReplyResult> {
  const workspace = await getActiveWorkspaceForUser(userId);
  if (!workspace) throw new AppError("NO_WORKSPACE", "Create a workspace or join your partner first.", 409);

  const topic = input.topic;
  const { plan, limits } = await limitsForWorkspace(workspace.id);
  if ((topic === "partnership" || topic === "finance") && !limits.partnerTopics) {
    throw new AppError("PLAN_LIMIT", "Partnership and finance topics are part of Pro and Max. Upgrade to open them.", 403);
  }

  const { timezone } = await prisma.workspace.findUniqueOrThrow({ where: { id: workspace.id }, select: { timezone: true } });
  const today = dayKeyIn(timezone, new Date());

  // A daily reading is written once per day. Viewing it again the same day costs nothing.
  if (topic === "daily-horoscope") {
    const stored = await prisma.astroReading.findUnique({
      where: { workspaceId_topic_dayKey: { workspaceId: workspace.id, topic, dayKey: today } },
    });
    if (stored) {
      return { reply: stored.content, topic, cost: 0, charged: false, cached: true, balance: await getBalance(userId) };
    }
  }

  // A chat session is charged once, when its first question is asked. Follow-up questions in the session are free.
  const newChatSession = topic === "chat" && input.messages.length === 1;
  if (newChatSession) {
    const used = await chatSessionsToday(userId, new Date(Date.now() - DAY_MS));
    if (used >= limits.astroChatSessionsPerDay) {
      throw new AppError("PLAN_LIMIT", limitMessage(plan, "Astro AI chat sessions a day", limits.astroChatSessionsPerDay), 403);
    }
  }

  const charged = topic === "chat" ? newChatSession : true;
  const cost = AI_FEATURE_COSTS[topic].credits;
  if (charged) await spendCredits(userId, topic);

  const names = workspace.members.map((m) => m.displayName);
  const turns: ChatTurn[] =
    topic === "chat"
      ? input.messages.map((m) => ({ role: m.role, content: m.content }))
      : [{ role: "user", content: input.note?.trim() || DEFAULT_ASK[topic] }];

  let reply: string;
  try {
    reply = await generateReply([
      { role: "system", content: systemPromptFor(topic) },
      { role: "system", content: contextBlock(names, input.birth, today) },
      ...turns,
    ]);
  } catch (error) {
    if (charged) await refundCredits(userId, topic, cost);
    throw error;
  }

  if (topic === "daily-horoscope") {
    await prisma.astroReading.upsert({
      where: { workspaceId_topic_dayKey: { workspaceId: workspace.id, topic, dayKey: today } },
      create: { workspaceId: workspace.id, topic, dayKey: today, content: reply },
      update: {},
    });
  }

  return { reply, topic, cost: charged ? cost : 0, charged, cached: false, balance: await getBalance(userId) };
}
