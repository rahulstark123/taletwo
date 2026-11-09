import type { PlanAudienceValue, PlanKindValue, PlanStatusValue } from "@/lib/validations/plans";

/** Client-safe plan shapes shared by the API, server pages and the plans UI. */
export interface ChecklistItem {
  id: string;
  text: string;
  done: boolean;
}

export interface PlanDTO {
  id: string;
  title: string;
  description: string;
  kind: PlanKindValue;
  audience: PlanAudienceValue;
  status: PlanStatusValue;
  startsAt: string | null;
  location: string;
  budgetRupees: number | null;
  checklist: ChecklistItem[];
  createdById: string;
  createdByName: string;
  isMine: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PlansPayload {
  workspaceId: number;
  /** The space currency. Budgets are whole units of this currency. */
  currency: string;
  currentUserId: string;
  members: { userId: string; displayName: string }[];
  plans: PlanDTO[];
}

/** How long a deleted plan can be restored. */
export const PLAN_UNDO_WINDOW_MS = 10 * 60 * 1000;
