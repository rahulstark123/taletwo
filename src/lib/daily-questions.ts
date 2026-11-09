import { calendarDateIn } from "@/lib/dates";

/**
 * The daily question bank. Client-safe and pure. Questions are referenced by index, so reorder or
 * append only, never delete an item that people have already answered.
 */
export const QUESTION_CATEGORIES = ["FUN", "MEMORIES", "DEEP_CONVERSATIONS", "FUTURE", "ROMANCE"] as const;
export type QuestionCategoryValue = (typeof QUESTION_CATEGORIES)[number];

export const QUESTION_CATEGORY_LABEL: Record<QuestionCategoryValue, string> = {
  FUN: "Fun",
  MEMORIES: "Memories",
  DEEP_CONVERSATIONS: "Deep conversations",
  FUTURE: "Future",
  ROMANCE: "Romance",
};

export interface DailyQuestion {
  text: string;
  category: QuestionCategoryValue;
}

export const QUESTION_BANK: DailyQuestion[] = [
  { category: "ROMANCE", text: "What is one little thing I do that makes you happy?" },
  { category: "ROMANCE", text: "When did you last feel really proud to be my partner?" },
  { category: "ROMANCE", text: "What is a word or nickname you secretly love when I say it?" },
  { category: "ROMANCE", text: "What is the most romantic thing I have ever done without realising it?" },
  { category: "ROMANCE", text: "Describe the moment you knew you liked me more than a friend." },
  { category: "ROMANCE", text: "What does a perfect slow Sunday with me look like to you?" },
  { category: "MEMORIES", text: "What is one moment with me that you wish you could relive?" },
  { category: "MEMORIES", text: "What is the smallest memory of us that still makes you smile?" },
  { category: "MEMORIES", text: "What was your first impression of me, honestly?" },
  { category: "MEMORIES", text: "Which trip together do you think about most often?" },
  { category: "MEMORIES", text: "What is a moment from our first year you would put in a time capsule?" },
  { category: "MEMORIES", text: "What is something I said that you still remember word for word?" },
  { category: "FUN", text: "If we could swap lives for one day, what would you do first?" },
  { category: "FUN", text: "What is your most unusual food combination that you secretly love?" },
  { category: "FUN", text: "Which fictional world would you most like to live in with me?" },
  { category: "FUN", text: "What is a silly talent you are quietly proud of?" },
  { category: "FUN", text: "If our relationship were a film genre, which would it be?" },
  { category: "FUN", text: "What is the weirdest dream you have had about us?" },
  { category: "DEEP_CONVERSATIONS", text: "What is one fear you have never told me about?" },
  { category: "DEEP_CONVERSATIONS", text: "What do you need from me on days when you do not feel like talking?" },
  { category: "DEEP_CONVERSATIONS", text: "What is a belief you held a few years ago that you no longer hold?" },
  { category: "DEEP_CONVERSATIONS", text: "When do you feel most understood by me?" },
  { category: "DEEP_CONVERSATIONS", text: "What is something you wish your younger self had known about love?" },
  { category: "DEEP_CONVERSATIONS", text: "How do you like to be comforted when you are upset?" },
  { category: "FUTURE", text: "Where do you see us living in five years?" },
  { category: "FUTURE", text: "What is one dream you want us to achieve together this year?" },
  { category: "FUTURE", text: "What does a happy family life look like to you?" },
  { category: "FUTURE", text: "What is one place you want us to visit before we are old?" },
  { category: "FUTURE", text: "What is a habit you want us to build together?" },
  { category: "FUTURE", text: "How would you like us to celebrate our tenth anniversary?" },
  { category: "FUN", text: "What is the best meal you have ever had, and who was with you?" },
  { category: "FUN", text: "If you could only listen to three songs for a year, which would they be?" },
  { category: "MEMORIES", text: "What is a small kindness from your childhood that you still think about?" },
  { category: "MEMORIES", text: "What is a family tradition you would like us to start?" },
  { category: "DEEP_CONVERSATIONS", text: "What makes you feel most at peace?" },
  { category: "DEEP_CONVERSATIONS", text: "What is something you are learning about yourself right now?" },
  { category: "ROMANCE", text: "What is a love note you would write to me if you had all afternoon?" },
  { category: "ROMANCE", text: "What part of my appearance do you find most attractive, and why?" },
  { category: "FUTURE", text: "What is one thing you want to learn together?" },
  { category: "FUTURE", text: "What does success look like for you in the next year?" },
  { category: "FUN", text: "What is a small adventure you would love us to have this month?" },
  { category: "MEMORIES", text: "What is the funniest thing that has happened between us?" },
  { category: "DEEP_CONVERSATIONS", text: "What does loyalty mean to you in a relationship?" },
  { category: "ROMANCE", text: "What is the best way for me to show you love, from your point of view?" },
  { category: "FUN", text: "If you could have dinner with any three people, living or not, who would they be?" },
  { category: "FUTURE", text: "What is one thing you hope we never stop doing?" },
];

/** Multiplier and offset chosen so consecutive days get different questions. 17 is coprime with the bank size. */
const STEP = 17;

/** Days since 1970-01-01 for a YYYY-MM-DD string. */
function dayNumber(iso: string) {
  return Math.floor(Date.parse(`${iso}T00:00:00Z`) / 86_400_000);
}

/**
 * The question for a workspace on a given day. Both partners get the same question, the question changes
 * every day, and the bank cycles only after going through every question.
 */
export function questionIndexFor(workspaceId: number, dayIso: string): number {
  const n = QUESTION_BANK.length;
  const raw = dayNumber(dayIso) * STEP + workspaceId * 31;
  return ((raw % n) + n) % n;
}

/** The workspace's "today" in its own timezone, as YYYY-MM-DD. */
export function workspaceToday(timezone: string, now: Date = new Date()): string {
  const d = calendarDateIn(now, timezone);
  return `${d.year}-${String(d.month).padStart(2, "0")}-${String(d.day).padStart(2, "0")}`;
}
