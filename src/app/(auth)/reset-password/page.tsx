import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { connection } from "next/server";
import { AuthShell } from "@/components/auth/auth-shell";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { getCurrentUser } from "@/server/authorization/session";

export const metadata: Metadata = { title: "Choose a new password", robots: { index: false, follow: false } };

/** Reachable after a recovery link has created a session (see /auth/callback). */
export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-dvh bg-ld-surface" aria-busy="true" />}>
      <ResetPasswordContent />
    </Suspense>
  );
}

async function ResetPasswordContent() {
  await connection();
  const user = await getCurrentUser();

  if (!user) {
    return (
      <AuthShell
        title="This link has expired"
        description="Reset links work once and expire after a while. Please request a new one."
        footer={
          <Link href="/forgot-password" className="font-semibold text-ld-primary hover:underline">
            Request a new link
          </Link>
        }
      >
        <p className="text-center text-ld-body-sm text-ld-on-surface-variant">
          For your security, we cannot change a password without a valid link.
        </p>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Choose a new password" description="Make it one you have not used before.">
      <ResetPasswordForm />
    </AuthShell>
  );
}
