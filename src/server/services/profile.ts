import "server-only";
import type { User } from "@supabase/supabase-js";
import { prisma } from "@/lib/prisma";
import { ensureWallet } from "@/server/services/ai-credits";
import { ensureSpaceCode } from "@/server/services/space-code";

/** Fallback display name when the user did not provide one: the part of the email before "@". */
function fallbackName(email: string) {
  return email.split("@")[0]?.slice(0, 60) || "Partner";
}

/**
 * Creates the profile and default preferences for a Supabase user if they are missing.
 * Idempotent: safe to call on every sign-in, callback and first visit.
 */
export async function ensureUserProfile(user: User) {
  const email = (user.email ?? "").toLowerCase();
  if (!email) throw new Error("Authenticated user has no email address.");

  const metaName = typeof user.user_metadata?.full_name === "string" ? user.user_metadata.full_name.trim() : "";
  const displayName = (metaName || fallbackName(email)).slice(0, 60);
  const verifiedAt = user.email_confirmed_at ? new Date(user.email_confirmed_at) : null;

  // Fast path: on almost every request the profile already matches. One read avoids a transaction.
  const existing = await prisma.userProfile.findUnique({ where: { id: user.id }, select: { id: true, email: true, emailVerifiedAt: true } });
  if (existing && existing.email === email && (!verifiedAt || existing.emailVerifiedAt)) {
    return existing;
  }

  const profile = await prisma.$transaction(async (tx) => {
    // Supabase guarantees each email belongs to one auth user. If a profile still holds this email
    // under a different id, its auth account was deleted and it is stale. Release the email so the
    // current account can use it. The old row and its data are kept, only the email is changed.
    await tx.userProfile.updateMany({
      where: { email, NOT: { id: user.id } },
      data: { email: `released-${crypto.randomUUID()}@taletwo.invalid` },
    });

    const profile = await tx.userProfile.upsert({
      where: { id: user.id },
      create: { id: user.id, email, displayName, emailVerifiedAt: verifiedAt },
      update: verifiedAt ? { email, emailVerifiedAt: verifiedAt } : { email },
    });
    await tx.userPreference.upsert({
      where: { userId: user.id },
      create: { userId: user.id },
      update: {},
    });
    return profile;
  });
  // The signup grant and the space code are created here, once, for every account that has a profile.
  await ensureWallet(user.id);
  await ensureSpaceCode(user.id);
  return profile;
}
