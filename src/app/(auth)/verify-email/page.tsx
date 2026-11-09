import type { Metadata } from "next";
import Link from "next/link";
import { MailOpen } from "lucide-react";
import { AuthShell } from "@/components/auth/auth-shell";

export const metadata: Metadata = { title: "Verify your email", robots: { index: false, follow: false } };

/** Shown after sign-up. Contains no personal data. */
export default function VerifyEmailPage() {
  return (
    <AuthShell
      title="Check your inbox"
      description="We have sent a link to confirm your email address. Open it on this device to continue."
      footer={
        <>
          Already confirmed?{" "}
          <Link href="/login" className="font-semibold text-ld-primary hover:underline">
            Log in
          </Link>
        </>
      }
    >
      <div className="flex flex-col items-center gap-4 text-center">
        <span className="flex size-12 items-center justify-center rounded-full bg-ld-secondary-container/40 text-ld-primary">
          <MailOpen className="size-5" aria-hidden="true" />
        </span>
        <p className="text-ld-caption text-ld-on-surface-variant">
          The link may take a minute to arrive. Check your spam folder if you do not see it.
        </p>
      </div>
    </AuthShell>
  );
}
