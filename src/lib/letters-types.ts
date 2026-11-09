/** Client-safe types and constants for love letters. Shared by the API, the services and the UI. */

export const LETTER_PAPERS = ["CREAM", "ROSE", "SAGE", "LAVENDER"] as const;
export type LetterPaperStyle = (typeof LETTER_PAPERS)[number];
/** Folder a letter sits in, from the point of view of the person looking at it. */
export type LetterKind = "received" | "sent" | "draft" | "scheduled";

export interface LetterDTO {
  id: string;
  kind: LetterKind;
  /** Empty for a letter that is still sealed for the recipient. */
  title: string;
  /** Empty for a letter that is still sealed for the recipient. */
  body: string;
  occasion: string;
  paper: LetterPaperStyle;
  from: string;
  to: string;
  isMine: boolean;
  sealed: boolean;
  /** When it was sent (or created, for a draft). ISO string. */
  createdAt: string;
  /** When a sealed letter opens. Null when it can be read straight away. */
  opensAt: string | null;
  read: boolean;
}

export interface LettersPayload {
  workspaceId: number;
  currentUserId: string;
  currentName: string;
  partnerName: string;
  letters: LetterDTO[];
  plan: "free" | "pro" | "max";
  canSchedule: boolean;
  /** Letters the space has sent this calendar month (UTC). */
  sentThisMonth: number;
  /** Null when the plan has no monthly limit. */
  monthlyLimit: number | null;
}

export const LETTER_TITLE_MAX = 80;
export const LETTER_BODY_MAX = 2000;

export const LETTER_OCCASIONS = [
  "Just because",
  "Open when you miss me",
  "Open when you feel sad",
  "Open on our anniversary",
  "Open when you need motivation",
  "Open when you need a smile",
] as const;

export const LETTER_TEMPLATES = [
  { key: "blank", label: "Blank page", body: "" },
  {
    key: "morning",
    label: "Good morning",
    body: "Good morning, my love. I hope your coffee is warm and your day is kind to you. I am thinking of you.",
  },
  {
    key: "miss",
    label: "I miss you",
    body: "I miss the sound of your laugh in the next room. Counting the hours until I can hold your hand again.",
  },
  {
    key: "thanks",
    label: "Thank you",
    body: "Thank you for the small things you do every day. They add up to a whole life I am grateful for.",
  },
  {
    key: "anniversary",
    label: "Our anniversary",
    body: "Every year with you is my favourite year. Here is to the next one, and the one after that.",
  },
  {
    key: "smile",
    label: "Need a smile",
    body: "Here is a little reminder: you are brilliant, you are loved, and I think you look incredible when you are concentrating.",
  },
] as const;
