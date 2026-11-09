/** Client-safe special day shapes and vocabulary, shared by the API, server pages and the UI. */
export const SPECIAL_DAY_KINDS = [
  "RELATIONSHIP_ANNIVERSARY",
  "WEDDING_ANNIVERSARY",
  "BIRTHDAY",
  "FIRST_MEETING",
  "FIRST_DATE",
  "CUSTOM",
] as const;
export type SpecialDayKindValue = (typeof SPECIAL_DAY_KINDS)[number];

export const REMINDER_OPTIONS = ["NONE", "ON_DAY", "DAY_BEFORE", "WEEK_BEFORE"] as const;
export type ReminderValue = (typeof REMINDER_OPTIONS)[number];

export interface SpecialDayDTO {
  id: string;
  title: string;
  kind: SpecialDayKindValue;
  eventDate: string; // YYYY-MM-DD, the original date
  repeatsYearly: boolean;
  reminder: ReminderValue;
  notes: string;
  createdById: string;
  createdByName: string;
  isMine: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SpecialDaysPayload {
  workspaceId: number;
  currentUserId: string;
  timezone: string;
  members: { userId: string; displayName: string }[];
  days: SpecialDayDTO[];
}

export const SPECIAL_DAY_UNDO_WINDOW_MS = 10 * 60 * 1000;
