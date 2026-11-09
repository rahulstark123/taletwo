/** Client-safe support constants and types. Shared by the form, the list and the API validation. */

export const SUPPORT_TYPES = ["TICKET", "SUGGESTION"] as const;
export type SupportTypeValue = (typeof SUPPORT_TYPES)[number];

export const SUPPORT_CATEGORIES = ["BUG", "ACCOUNT", "PRIVACY", "FEATURE", "DESIGN", "OTHER"] as const;
export type SupportCategoryValue = (typeof SUPPORT_CATEGORIES)[number];

export const SUPPORT_PRIORITIES = ["LOW", "NORMAL", "HIGH"] as const;
export type SupportPriorityValue = (typeof SUPPORT_PRIORITIES)[number];

export const SUPPORT_STATUSES = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"] as const;
export type SupportStatusValue = (typeof SUPPORT_STATUSES)[number];

export const SUPPORT_CATEGORY_LABEL: Record<SupportCategoryValue, string> = {
  BUG: "Something is broken",
  ACCOUNT: "Account or login",
  PRIVACY: "Privacy and data",
  FEATURE: "New feature",
  DESIGN: "Look and feel",
  OTHER: "Something else",
};

export const SUPPORT_STATUS_LABEL: Record<SupportStatusValue, string> = {
  OPEN: "Received",
  IN_PROGRESS: "In progress",
  RESOLVED: "Resolved",
  CLOSED: "Closed",
};

export const SUPPORT_SUBJECT_MAX = 120;
export const SUPPORT_MESSAGE_MAX = 3000;

export interface SupportRequestDTO {
  id: string;
  type: SupportTypeValue;
  category: SupportCategoryValue;
  priority: SupportPriorityValue;
  status: SupportStatusValue;
  subject: string;
  message: string;
  createdAt: string;
}
