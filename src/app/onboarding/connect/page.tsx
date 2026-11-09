import type { Metadata } from "next";
import { Suspense } from "react";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth/auth-shell";
import { ConnectStep } from "@/components/onboarding/connect-step";
import { StepIndicator } from "@/components/onboarding/step-indicator";
import { requireVerifiedUser } from "@/server/authorization/session";
import { getMe } from "@/server/services/users";
import { ensureSpaceCode } from "@/server/services/space-code";

export const metadata: Metadata = { title: "Connect with your partner", robots: { index: false, follow: false } };

export default function OnboardingConnectPage({ searchParams }: { searchParams: Promise<{ code?: string }> }) {
  return (
    <Suspense fallback={<div className="min-h-dvh bg-ld-surface" aria-busy="true" />}>
      <ConnectContent searchParams={searchParams} />
    </Suspense>
  );
}

async function ConnectContent({ searchParams }: { searchParams: Promise<{ code?: string }> }) {
  await connection();
  const user = await requireVerifiedUser();
  const me = await getMe(user.id);
  if (me.onboardingCompleted) redirect("/app");

  const { code } = await searchParams;
  // A code from the link, or the one entered at sign-up. Only plausible values pass; the server re-validates on join.
  const fromSignup = typeof user.user_metadata?.space_code === "string" ? user.user_metadata.space_code : null;
  const candidate = code ?? fromSignup;
  const initialCode = candidate && /^[A-Za-z0-9-]{6,20}$/.test(candidate) ? candidate : null;
  const mySpaceCode = await ensureSpaceCode(user.id);

  return (
    <AuthShell
      title="Your workspace"
      description="Step 2 of 3. Start a space for two, or join the one your partner created."
    >
      <div className="space-y-8">
        <StepIndicator current={2} />
        <ConnectStep initialWorkspace={me.workspace} initialCode={initialCode} mySpaceCode={mySpaceCode} />
      </div>
    </AuthShell>
  );
}
