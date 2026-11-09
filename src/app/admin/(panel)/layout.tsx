import { Suspense, type ReactNode } from "react";
import { connection } from "next/server";
import Link from "next/link";
import { requireAdmin } from "@/server/admin/guard";
import { AdminNav } from "@/components/admin/admin-nav";

export const metadata = { robots: { index: false, follow: false } };

/** Every admin page sits behind requireAdmin(); anyone else is sent to the admin sign-in. */
export default function AdminPanelLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<div className="min-h-dvh bg-ld-surface" aria-busy="true" />}>
      <PanelShell>{children}</PanelShell>
    </Suspense>
  );
}

async function PanelShell({ children }: { children: ReactNode }) {
  await connection();
  const admin = await requireAdmin();
  return (
    <div className="min-h-dvh bg-ld-surface text-ld-on-surface">
      <header className="border-b border-ld-outline-variant/40 bg-ld-surface-container-lowest">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-4">
          <Link href="/admin" className="font-display text-ld-title-lg">
            TaleTwo <span className="italic text-ld-primary">admin</span>
          </Link>
          <p className="text-ld-caption text-ld-on-surface-variant">Signed in as {admin.email}</p>
        </div>
        <div className="mx-auto max-w-6xl px-5 pb-3">
          <AdminNav />
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-5 py-8">{children}</main>
    </div>
  );
}
