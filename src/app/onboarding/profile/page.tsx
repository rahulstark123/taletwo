import type { Metadata } from "next";
import { Suspense } from "react";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth/auth-shell";
import { ProfileStep } from "@/components/onboarding/profile-step";
import { StepIndicator } from "@/components/onboarding/step-indicator";
import { requireVerifiedUser } from "@/server/authorization/session";
import { getMe } from "@/server/services/users";
import { joinFromSignupCode } from "@/server/services/signup-join";

export const metadata: Metadata = { title: "Set up your profile", robots: { index: false, follow: false } };

export default function OnboardingProfilePage() {
  return (
    <Suspense fallback={<div className="min-h-dvh bg-ld-surface" aria-busy="true" />}>
      <ProfileContent />
    </Suspense>
  );
}

async function ProfileContent() {
  await connection();
  const user = await requireVerifiedUser();
  const me = await getMe(user.id);
  if (me.onboardingCompleted) redirect("/app");

  // A sign-up that entered a partner's code joins that space now and goes straight to the app.
  if (await joinFromSignupCode(user.id, user.user_metadata?.space_code)) redirect("/app");

  return (
    <AuthShell title="Tell us about you" description="Step 1 of 3. This is how your partner will see you.">
      <div className="space-y-8">
        <StepIndicator current={1} />
        <ProfileStep initialDisplayName={me.displayName} initialStartDate={me.relationshipStartDate} />
      </div>
    </AuthShell>
  );
}
