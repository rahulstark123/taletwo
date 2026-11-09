/**
 * AI credits for Astro AI. Client-safe config.
 *
 * Every new account starts with SIGNUP_AI_CREDITS. Each Astro AI feature costs credits when it runs.
 * Costs are kept here so the hub, the topic pages and the server all show and charge the same numbers.
 */

export const SIGNUP_AI_CREDITS = 50;

/** Credits added each month while a paid plan is active. Free adds none beyond the signup grant. */
export const PLAN_AI_CREDITS_PER_MONTH: Record<"free" | "pro" | "max", number> = {
  free: 0,
  pro: 100,
  max: 250,
};

export interface AiFeatureCost {
  credits: number;
  /** What one charge buys, shown to the user before they use it. */
  covers: string;
}

export const AI_FEATURE_COSTS = {
  chat: { credits: 5, covers: "One chat session, up to 10 questions" },
  numerology: { credits: 2, covers: "One AI numerology reading. The Life Path number itself is free" },
  partnership: { credits: 4, covers: "One partnership compatibility report for both of you" },
  finance: { credits: 3, covers: "One finance guidance session" },
  career: { credits: 3, covers: "One career timing and strengths reading" },
  health: { credits: 2, covers: "One wellbeing reading (not medical advice)" },
  "daily-horoscope": { credits: 2, covers: "Today's note for both of you. Viewing it again the same day is free" },
  festivals: { credits: 2, covers: "One auspicious-days check for a date you choose" },
} satisfies Record<string, AiFeatureCost>;

export type AiFeature = keyof typeof AI_FEATURE_COSTS;

export function costOf(feature: AiFeature): number {
  return AI_FEATURE_COSTS[feature].credits;
}
