import type { QuestionCategoryValue } from "@/lib/daily-questions";

export type RevealModeValue = "WHEN_BOTH_ANSWER" | "AT_MIDNIGHT";

export const REVEAL_MODE_LABEL: Record<RevealModeValue, { title: string; hint: string }> = {
  WHEN_BOTH_ANSWER: { title: "When we both answer", hint: "Answers appear together as soon as you have both replied." },
  AT_MIDNIGHT: { title: "At midnight", hint: "Answers appear together when the day changes, even if one of you is still writing." },
};

/** Today's question as one person sees it. The partner's answer is null until it is revealed. */
export interface DailyQuestionView {
  workspaceId: number;
  currentUserId: string;
  timezone: string;
  day: string; // YYYY-MM-DD in the workspace timezone
  question: { text: string; category: QuestionCategoryValue; index: number };
  revealMode: RevealModeValue;
  partner: { userId: string | null; displayName: string };
  mine: { body: string; updatedAt: string; heartedByPartner: boolean } | null;
  partnerStatus: { answered: boolean; revealed: boolean; body: string | null; hearted: boolean; heartedByMe: boolean };
  canEdit: boolean;
}

export interface DailyHistoryItem {
  day: string;
  question: { text: string; category: QuestionCategoryValue; index: number };
  mine: string | null;
  partner: { displayName: string; answered: boolean; body: string | null };
}

export interface DailyHistoryPayload {
  workspaceId: number;
  items: DailyHistoryItem[];
}
