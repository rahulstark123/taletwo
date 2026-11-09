/** Client-safe calendar shapes. Dates are YYYY-MM-DD in the viewer's timezone. */
export const CALENDAR_EVENT_KINDS = ["DATE_NIGHT", "FAMILY", "REMINDER", "OTHER"] as const;
export type CalendarEventKindValue = (typeof CALENDAR_EVENT_KINDS)[number];

export type CalendarSource = "EVENT" | "PLAN" | "SPECIAL_DAY" | "BUCKET";

export interface CalendarItem {
  id: string;
  source: CalendarSource;
  /** Colour family: event kinds, plan kinds, special day kinds, or "BUCKET". */
  kind: string;
  title: string;
  date: string; // YYYY-MM-DD in the viewer's timezone
  startsAt: string | null; // ISO, only for timed items
  allDay: boolean;
  location: string;
  description: string;
  /** Where to go for more detail (plans, special days, bucket dreams). Events open in the editor. */
  href: string | null;
  /** Only the couple's own calendar events can be edited here. */
  editable: boolean;
  reminder: string;
}

export interface CalendarPayload {
  workspaceId: number;
  currentUserId: string;
  timezone: string;
  from: string;
  to: string;
  items: CalendarItem[];
}

export interface CalendarEventDTO {
  id: string;
  title: string;
  description: string;
  kind: CalendarEventKindValue;
  startsAt: string;
  endsAt: string | null;
  allDay: boolean;
  location: string;
  reminder: string;
  createdByName: string;
  isMine: boolean;
}
