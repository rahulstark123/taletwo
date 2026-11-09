import "server-only";
import { PLAN_LIMITS, limitMessage, type PlanLimits } from "@/config/plan-limits";
import type { PlanId } from "@/config/subscriptions";
import { AppError } from "@/server/errors";
import { getActivePlan } from "@/server/services/billing";
import { getActiveWorkspaceForUser } from "@/server/services/workspaces";

/** The plan a space is on right now. Free when nothing is active. */
export async function planForWorkspace(workspaceId: number): Promise<PlanId> {
  const current = await getActivePlan(workspaceId);
  return current.plan;
}

/** Limits for a space, read from its active plan. */
export async function limitsForWorkspace(workspaceId: number): Promise<{ plan: PlanId; limits: PlanLimits }> {
  const plan = await planForWorkspace(workspaceId);
  return { plan, limits: PLAN_LIMITS[plan] };
}

const WHAT: Record<keyof Pick<PlanLimits, "notes" | "bucketItems" | "activePlans" | "specialDays" | "calendarEvents" | "photos">, string> = {
  notes: "shared notes",
  bucketItems: "bucket list dreams",
  activePlans: "active plans",
  specialDays: "special days",
  calendarEvents: "calendar events",
  photos: "photos",
};

/**
 * Stops an action that would go over the plan's limit. `current` is how many already exist; `adding` is how
 * many more would be created. Throws a friendly error that tells the person what their plan allows.
 */
export async function assertWithinLimit(workspaceId: number, key: keyof typeof WHAT, current: number, adding = 1): Promise<void> {
  const { plan, limits } = await limitsForWorkspace(workspaceId);
  const limit = limits[key];
  if (current + adding > limit) {
    throw new AppError("PLAN_LIMIT", limitMessage(plan, WHAT[key], limit), 403);
  }
}

/** The plan of the signed-in person's couple space. Free when they have no space yet. */
export async function planForUser(userId: string): Promise<PlanId> {
  const space = await getActiveWorkspaceForUser(userId);
  return space ? planForWorkspace(space.id) : "free";
}
