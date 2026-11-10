import type { PlanId } from "@/config/subscriptions";

/**
 * What each plan allows. These numbers are the ones shown on the Subscriptions page, so the comparison and
 * the app always agree. Infinity means no limit. Client-safe.
 */
export const UNLIMITED = Number.POSITIVE_INFINITY;

export interface PlanLimits {
  notes: number;
  bucketItems: number;
  activePlans: number;
  specialDays: number;
  calendarEvents: number;
  /** Photos across all memories in the space. */
  photos: number;
  /** Days of daily-question history visible. */
  historyDays: number;
  /** Reveal modes available: Free only gets "when we both answer". */
  allRevealModes: boolean;
  /** Partnership and finance topics in Astro AI. */
  partnerTopics: boolean;
  /** Couple games available. Free gets only the first two. */
  games: number;
  /** Letters the space can send each calendar month (UTC). */
  lettersPerMonth: number;
  /** Whether a letter can be scheduled to open on a future day. */
  scheduledLetters: boolean;
  /** Astro AI chat sessions a person can start each day. */
  astroChatSessionsPerDay: number;
  /** Confessions each person can save each calendar month (UTC). */
  confessionsPerMonth: number;
}

export const PLAN_LIMITS: Record<PlanId, PlanLimits> = {
  free: {
    notes: 20,
    bucketItems: 15,
    activePlans: 5,
    specialDays: 5,
    calendarEvents: 20,
    photos: 30,
    historyDays: 7,
    allRevealModes: false,
    partnerTopics: false,
    games: 2,
    lettersPerMonth: 2,
    scheduledLetters: false,
    astroChatSessionsPerDay: 3,
    confessionsPerMonth: 2,
  },
  pro: {
    notes: UNLIMITED,
    bucketItems: UNLIMITED,
    activePlans: UNLIMITED,
    specialDays: 100,
    calendarEvents: UNLIMITED,
    photos: 2000,
    historyDays: UNLIMITED,
    allRevealModes: true,
    partnerTopics: true,
    games: UNLIMITED,
    lettersPerMonth: UNLIMITED,
    scheduledLetters: true,
    astroChatSessionsPerDay: 30,
    confessionsPerMonth: 10,
  },
  max: {
    notes: UNLIMITED,
    bucketItems: UNLIMITED,
    activePlans: UNLIMITED,
    specialDays: UNLIMITED,
    calendarEvents: UNLIMITED,
    photos: UNLIMITED,
    historyDays: UNLIMITED,
    allRevealModes: true,
    partnerTopics: true,
    games: UNLIMITED,
    lettersPerMonth: UNLIMITED,
    scheduledLetters: true,
    astroChatSessionsPerDay: UNLIMITED,
    confessionsPerMonth: UNLIMITED,
  },
};

/** The two games the Free plan can open. */
export const FREE_GAME_SLUGS = ["truth-or-dare", "guess-my-answer"] as const;

export function limitMessage(plan: PlanId, what: string, limit: number): string {
  const planName = plan === "free" ? "Free" : plan === "pro" ? "Pro" : "Max";
  const next = plan === "free" ? "Upgrade to Pro for more." : plan === "pro" ? "Upgrade to Max for no limits." : "";
  return `Your ${planName} plan allows ${limit.toLocaleString("en-US")} ${what}. ${next}`.trim();
}
