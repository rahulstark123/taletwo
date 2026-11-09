import type { Metadata } from "next";
import { Suspense } from "react";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth/auth-shell";
import { CompleteStep } from "@/components/onboarding/complete-step";
import { StepIndicator } from "@/components/onboarding/step-indicator";
import { requireVerifiedUser } from "@/server/authorization/session";
import { getMe } from "@/server/services/users";

export const metadata: Metadata = { title: "Your space is ready", robots: { index: false, follow: false } };

export default function OnboardingCompletePage() {
  return (
    <Suspense fallback={<div className="min-h-dvh bg-ld-surface" aria-busy="true" />}>
      <CompleteContent />
    </Suspense>
  );
}

async function CompleteContent() {
  await connection();
  const user = await requireVerifiedUser();
  const me = await getMe(user.id);
  if (me.onboardingCompleted) redirect("/app");
  if (!me.workspace) redirect("/onboarding/connect");

  return (
    <AuthShell title="Almost there" description="Step 3 of 3.">
      <div className="space-y-8">
        <StepIndicator current={3} />
        <CompleteStep
          members={me.workspace.members}
        />
      </div>
    </AuthShell>
  );
}
