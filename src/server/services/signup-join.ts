import "server-only";
import { prisma } from "@/lib/prisma";
import { isSpaceCodeShape, normalizeSpaceCode } from "@/lib/space-code";
import { AppError } from "@/server/errors";
import { completeOnboarding } from "@/server/services/users";
import { acceptSpaceCode } from "@/server/services/workspaces";

/**
 * Someone who entered a partner's space code on the sign-up form is joined straight after verifying
 * their email, so they skip the set-up steps. Returns true when they are now in a space and onboarding
 * is complete. Any failure returns false, and the normal steps take over.
 */
export async function joinFromSignupCode(userId: string, rawCode: unknown): Promise<boolean> {
  if (typeof rawCode !== "string") return false;
  const code = normalizeSpaceCode(rawCode);
  if (!isSpaceCodeShape(code)) return false;

  const profile = await prisma.userProfile.findUnique({ where: { id: userId }, select: { onboardingCompletedAt: true } });
  if (!profile || profile.onboardingCompletedAt) return Boolean(profile?.onboardingCompletedAt);

  try {
    await acceptSpaceCode(userId, code);
  } catch (error) {
    // Already in a space (for example from an earlier attempt) is fine. Anything else falls back to the steps.
    if (!(error instanceof AppError && error.code === "ALREADY_IN_WORKSPACE")) return false;
  }
  try {
    await completeOnboarding(userId);
    return true;
  } catch {
    return false;
  }
}
