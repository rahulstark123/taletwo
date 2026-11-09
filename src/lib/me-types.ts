import type { WorkspaceSummary } from "@/lib/workspace-types";

/** Client-safe shape of the signed-in user's profile. */
export type ThemeValue = "LIGHT" | "DARK" | "SYSTEM";

export interface MeResponse {
  id: string;
  email: string;
  displayName: string;
  avatarUrl: string | null;
  relationshipStartDate: string | null;
  timezone: string;
  country: string | null;
  currency: string | null;
  theme: ThemeValue;
  onboardingCompleted: boolean;
  workspace: WorkspaceSummary | null;
}
