import { Suspense } from "react";
import type { Metadata } from "next";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth/auth-shell";
import { AdminLoginForm } from "@/components/admin/admin-login-form";
import { getAdminUser } from "@/server/admin/guard";

export const metadata: Metadata = { title: "Admin sign in", robots: { index: false, follow: false } };

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-dvh bg-ld-surface" aria-busy="true" />}>
      <LoginContent />
    </Suspense>
  );
}

async function LoginContent() {
  await connection();
  if (await getAdminUser()) redirect("/admin");
  return (
    <AuthShell title="Admin sign in" description="For the TaleTwo team only.">
      <AdminLoginForm />
    </AuthShell>
  );
}
