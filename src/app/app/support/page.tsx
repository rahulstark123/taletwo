import type { Metadata } from "next";
import { Suspense } from "react";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { SupportBoard } from "@/components/support/support-board";
import { getCurrentUser } from "@/server/authorization/session";
import { listMySupportRequests } from "@/server/services/support";

export const metadata: Metadata = {
  title: "Support",
  robots: { index: false, follow: false },
};

export default function SupportPage() {
  return (
    <Suspense fallback={<SupportSkeleton />}>
      <SupportContent />
    </Suspense>
  );
}

async function SupportContent() {
  await connection();
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const requests = await listMySupportRequests(user.id);
  return <SupportBoard initial={requests} />;
}

function SupportSkeleton() {
  return (
    <div role="status" aria-label="Loading support" className="grid gap-6 lg:grid-cols-2">
      <div className="h-[520px] animate-pulse rounded-3xl bg-ld-surface-container" />
      <div className="h-[320px] animate-pulse rounded-3xl bg-ld-surface-container" />
    </div>
  );
}
