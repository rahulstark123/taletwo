import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";
import { SignupForm } from "@/components/auth/signup-form";

export const metadata: Metadata = { title: "Create your space", robots: { index: false, follow: false } };

export default function SignupPage() {
  return (
    <AuthShell
      title="Create your space"
      description="Start your private space for two. It takes a few minutes."
      footer={
        <>
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-ld-primary hover:underline">
            Log in
          </Link>
        </>
      }
    >
      <SignupForm />
    </AuthShell>
  );
}
