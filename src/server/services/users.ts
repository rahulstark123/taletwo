import "server-only";
import { prisma } from "@/lib/prisma";
import { AppError } from "@/server/errors";
import { getActiveWorkspaceForUser } from "@/server/services/workspaces";
import { deletePrivateObjects, readUrl } from "@/server/storage/r2";

/** A short-lived link to the user's own profile photo, or null. Only the owner's path is ever signed. */
async function signAvatar(path: string | null): Promise<string | null> {
  if (!path) return null;
  try {
    return await readUrl("avatars", path);
  } catch {
    return null;
  }
}

export type { ThemeValue, MeResponse } from "@/lib/me-types";
import type { MeResponse, ThemeValue } from "@/lib/me-types";

export interface UpdateProfileInput {
  displayName: string;
  relationshipStartDate: string | null;
  timezone: string;
  country?: string | null;
  currency?: string | null;
  theme: ThemeValue;
  /** Storage path of a new photo, or null to remove it. Omit to leave the photo unchanged. */
  avatarPath?: string | null;
}

/** The signed-in user's profile, preferences and active workspace. Single source for /api/me and pages. */
export async function getMe(userId: string): Promise<MeResponse> {
  const profile = await prisma.userProfile.findUnique({
    where: { id: userId },
    include: { preference: true },
  });
  if (!profile) throw new AppError("NOT_FOUND", "We could not find your profile. Please log in again.", 404);

  const workspace = await getActiveWorkspaceForUser(userId);

  return {
    id: profile.id,
    email: profile.email,
    displayName: profile.displayName,
    avatarUrl: await signAvatar(profile.avatarPath),
    relationshipStartDate: profile.relationshipStartDate ? profile.relationshipStartDate.toISOString().slice(0, 10) : null,
    timezone: profile.timezone,
    country: profile.country,
    currency: profile.currency,
    theme: profile.preference?.theme ?? "SYSTEM",
    onboardingCompleted: profile.onboardingCompletedAt !== null,
    workspace,
  };
}

/** Updates the profile fields collected in onboarding step 1 and the account preferences. */
export async function updateMyProfile(userId: string, input: UpdateProfileInput): Promise<MeResponse> {
  const current = await prisma.userProfile.findUniqueOrThrow({ where: { id: userId }, select: { avatarPath: true } });
  if (input.avatarPath && !input.avatarPath.startsWith(`${userId}/`)) {
    throw new AppError("VALIDATION_FAILED", "That photo does not belong to your account. Please upload it again.", 400);
  }
  const avatarChanged = input.avatarPath !== undefined && input.avatarPath !== current.avatarPath;

  await prisma.$transaction(async (tx) => {
    await tx.userProfile.update({
      where: { id: userId },
      data: {
        displayName: input.displayName,
        relationshipStartDate: input.relationshipStartDate ? new Date(`${input.relationshipStartDate}T00:00:00Z`) : null,
        timezone: input.timezone,
        ...(input.country !== undefined ? { country: input.country } : {}),
        ...(input.currency !== undefined ? { currency: input.currency } : {}),
        ...(avatarChanged ? { avatarPath: input.avatarPath ?? null } : {}),
      },
    });
    await tx.userPreference.upsert({
      where: { userId },
      create: { userId, theme: input.theme },
      update: { theme: input.theme },
    });
  });
  // Remove the old photo file once the new one is saved. The owner policy allows this.
  if (avatarChanged && current.avatarPath) {
    await deletePrivateObjects("avatars", [current.avatarPath]);
  }
  return getMe(userId);
}

/** Marks onboarding finished. Requires an active workspace, so nobody reaches the app without one. */
export async function completeOnboarding(userId: string): Promise<void> {
  const workspace = await getActiveWorkspaceForUser(userId);
  if (!workspace) throw new AppError("NO_WORKSPACE", "Create a workspace or join your partner first.", 409);

  await prisma.userProfile.update({
    where: { id: userId },
    data: { onboardingCompletedAt: new Date() },
  });
}

/** Saves the appearance choice. Light, dark or follow the device. */
export async function setTheme(userId: string, theme: ThemeValue): Promise<void> {
  await prisma.userPreference.upsert({
    where: { userId },
    create: { userId, theme },
    update: { theme },
  });
}
