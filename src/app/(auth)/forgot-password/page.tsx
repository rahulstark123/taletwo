import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export const metadata: Metadata = { title: "Reset password", robots: { index: false, follow: false } };

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      title="Forgot your password?"
      description="Enter your email and we will send you a link to choose a new one."
      footer={
        <Link href="/login" className="font-semibold text-ld-primary hover:underline">
          Back to log in
        </Link>
      }
    >
      <ForgotPasswordForm />
    </AuthShell>
  );
}
