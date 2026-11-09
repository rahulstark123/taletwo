import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { connection } from "next/server";
import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = { title: "Log in", robots: { index: false, follow: false } };

export default function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  return (
    <Suspense fallback={<div className="min-h-dvh bg-ld-surface" aria-busy="true" />}>
      <LoginContent searchParams={searchParams} />
    </Suspense>
  );
}

async function LoginContent({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  await connection();
  const { error } = await searchParams;

  return (
    <AuthShell
      title="Welcome back"
      description="Log in to your private space."
      footer={
        <>
          New to TaleTwo?{" "}
          <Link href="/signup" className="font-semibold text-ld-primary hover:underline">
            Create your space
          </Link>
        </>
      }
    >
      <LoginForm linkError={error === "link"} />
    </AuthShell>
  );
}
