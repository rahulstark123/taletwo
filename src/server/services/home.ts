import "server-only";
import { AppError } from "@/server/errors";
import { daysUntilNextAnnual } from "@/lib/dates";
import { getMe } from "@/server/services/users";
import { getActivePlan, type CurrentPlan } from "@/server/services/billing";
import { getBalance } from "@/server/services/ai-credits";
import { listMemories } from "@/server/services/memories";
import { listNotes } from "@/server/services/notes";
import { listPlans } from "@/server/services/plans";
import { listBucketItems } from "@/server/services/bucket";
import { listSpecialDays } from "@/server/services/special-days";
import { getTodayView } from "@/server/services/daily-question";
import type { ActivityItem, MemoryPreview, NotePreview, PlanPreview } from "@/components/home/home-cards";

/** Everything the home page shows, computed for one signed-in person's couple space. */
export interface HomeData {
  workspaceId: number;
  timezone: string;
  now: string;
  couple: {
    me: { displayName: string; initials: string };
    partner: { displayName: string; initials: string } | null;
    relationshipStart: { year: number; month: number; day: number } | null;
    memberCount: number;
  };
  memories: MemoryPreview[];
  dailyQuestion: {
    text: string;
    category: string;
    myAnswerSubmitted: boolean;
    partnerAnswered: boolean;
    partnerName: string;
  };
  nextAnniversary: { label: string; month: number; day: number; isRelationship: boolean } | null;
  notes: NotePreview[];
  upcomingPlans: PlanPreview[];
  bucket: { total: number; completed: number; nextItems: { id: string; title: string; category: string }[] };
  activity: ActivityItem[];
  credits: number;
  plan: CurrentPlan;
}

const MODULE_LABEL = { memory: "Memories", note: "Our Notes", dream: "Bucket List" } as const;
const TONES: MemoryPreview["tone"][] = ["rose", "stone", "sage"];
const PRIORITY_ORDER: Record<string, number> = { MUST: 0, SOON: 1, SOMEDAY: 2 };

function initialsOf(name: string) {
  return name.trim().charAt(0).toUpperCase() || "?";
}

/** Splits "YYYY-MM-DD" into its month and day. */
function monthDay(iso: string): { month: number; day: number } {
  return { month: Number(iso.slice(5, 7)), day: Number(iso.slice(8, 10)) };
}

/**
 * Builds the home page data. Each part comes from the same service the module pages use, so the home
 * page and the modules always agree. Every query is scoped to the caller's active space.
 */
export async function getHomeData(userId: string): Promise<HomeData> {
  const me = await getMe(userId);
  if (!me.workspace) throw new AppError("NO_WORKSPACE", "Create a workspace or join your partner first.", 409);
  const now = new Date();

  const [memoryPayload, notePayload, planPayload, bucketPayload, specialPayload, today, credits, plan] = await Promise.all([
    listMemories(userId),
    listNotes(userId),
    listPlans(userId),
    listBucketItems(userId),
    listSpecialDays(userId),
    getTodayView(userId),
    getBalance(userId),
    getActivePlan(me.workspace.id),
  ]);

  const timezone = today.timezone;
  const partnerMember = me.workspace.members.find((m) => m.userId !== userId) ?? null;

  // Memories: the three most recent by memory date.
  const memories: MemoryPreview[] = [...memoryPayload.memories]
    .sort((a, b) => (a.memoryDate < b.memoryDate ? 1 : -1))
    .slice(0, 3)
    .map((m, i) => ({
      id: m.id,
      title: m.title,
      date: m.memoryDate,
      location: m.location || null,
      photoCount: m.media.length,
      favourite: m.favourite,
      tone: TONES[i % TONES.length],
    }));

  // Notes: pinned first, then the most recently changed.
  const notes: NotePreview[] = [...notePayload.notes]
    .sort((a, b) => Number(b.pinned) - Number(a.pinned) || (a.updatedAt < b.updatedAt ? 1 : -1))
    .slice(0, 3)
    .map((n) => ({
      id: n.id,
      title: n.title || "Untitled note",
      excerpt: n.body.slice(0, 140),
      author: n.authorName,
      updatedAt: n.updatedAt,
      pinned: n.pinned,
    }));

  // Plans: planned (not done) and dated, soonest first.
  const todayStart = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const upcomingPlans: PlanPreview[] = planPayload.plans
    .filter((p) => p.status !== "DONE" && p.startsAt && new Date(p.startsAt).getTime() >= todayStart)
    .sort((a, b) => (a.startsAt! < b.startsAt! ? -1 : 1))
    .slice(0, 3)
    .map((p) => ({
      id: p.id,
      title: p.title,
      type: p.kind.replace(/_/g, " ").toLowerCase(),
      when: p.startsAt!,
      location: p.location || null,
      checklistDone: p.checklist.filter((c) => c.done).length,
      checklistTotal: p.checklist.length,
    }));

  // Bucket list: how far along, and the next dreams to work on (most important first).
  const items = bucketPayload.items;
  const open = items.filter((i) => !i.completedAt);
  const nextItems = [...open]
    .sort((a, b) => (PRIORITY_ORDER[a.priority] ?? 9) - (PRIORITY_ORDER[b.priority] ?? 9))
    .slice(0, 3)
    .map((i) => ({ id: i.id, title: i.title, category: i.category.replace(/_/g, " ").toLowerCase() }));

  // Next anniversary: the nearest yearly special day, or the relationship anniversary if there is none.
  let nextAnniversary: HomeData["nextAnniversary"] = null;
  let best = Infinity;
  for (const d of specialPayload.days) {
    if (!d.repeatsYearly) continue;
    const md = monthDay(d.eventDate);
    const days = daysUntilNextAnnual(md.month, md.day, now, timezone);
    if (days < best) {
      best = days;
      nextAnniversary = { label: d.title, month: md.month, day: md.day, isRelationship: false };
    }
  }
  if (!nextAnniversary && me.relationshipStartDate) {
    const md = monthDay(me.relationshipStartDate);
    nextAnniversary = { label: "Our anniversary", month: md.month, day: md.day, isRelationship: true };
  }

  // Recent activity: the latest notes, memories and completed dreams, newest first.
  const activity: ActivityItem[] = [
    ...notePayload.notes.map((n) => ({
      id: `note-${n.id}`,
      actor: n.authorName,
      text: `wrote “${n.title || "a note"}”`,
      target: MODULE_LABEL.note,
      at: n.updatedAt,
    })),
    ...memoryPayload.memories.map((m) => ({
      id: `memory-${m.id}`,
      actor: m.createdByName,
      text: `saved the memory “${m.title}”`,
      target: MODULE_LABEL.memory,
      at: m.createdAt,
    })),
    ...items
      .filter((i) => i.completedAt)
      .map((i) => ({
        id: `dream-${i.id}`,
        actor: i.createdByName,
        text: `ticked off “${i.title}”`,
        target: MODULE_LABEL.dream,
        at: i.completedAt!,
      })),
  ]
    .sort((a, b) => (a.at < b.at ? 1 : -1))
    .slice(0, 6);

  return {
    workspaceId: me.workspace.id,
    timezone,
    now: now.toISOString(),
    couple: {
      me: { displayName: me.displayName, initials: initialsOf(me.displayName) },
      partner: partnerMember ? { displayName: partnerMember.displayName, initials: initialsOf(partnerMember.displayName) } : null,
      relationshipStart: me.relationshipStartDate
        ? {
            year: Number(me.relationshipStartDate.slice(0, 4)),
            month: Number(me.relationshipStartDate.slice(5, 7)),
            day: Number(me.relationshipStartDate.slice(8, 10)),
          }
        : null,
      memberCount: me.workspace.members.length,
    },
    memories,
    dailyQuestion: {
      text: today.question.text,
      category: today.question.category.replace(/_/g, " ").toLowerCase(),
      myAnswerSubmitted: today.mine !== null,
      partnerAnswered: today.partnerStatus.answered,
      partnerName: today.partner.displayName,
    },
    nextAnniversary,
    notes,
    upcomingPlans,
    bucket: { total: items.length, completed: items.length - open.length, nextItems },
    activity,
    credits,
    plan,
  };
}
