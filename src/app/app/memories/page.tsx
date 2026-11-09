import type { Metadata } from "next";
import { Suspense } from "react";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { MemoriesBoard } from "@/components/memories/memories-board";
import { getCurrentUser } from "@/server/authorization/session";
import { listMemories } from "@/server/services/memories";

export const metadata: Metadata = {
  title: "Memories",
  robots: { index: false, follow: false },
};

export default function MemoriesPage() {
  return (
    <Suspense fallback={<MemoriesSkeleton />}>
      <MemoriesContent />
    </Suspense>
  );
}

async function MemoriesContent() {
  await connection();
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const payload = await listMemories(user.id);
  return <MemoriesBoard initial={payload} />;
}

function MemoriesSkeleton() {
  return (
    <div role="status" aria-label="Loading your memories" className="space-y-6">
      <div className="h-11 w-full animate-pulse rounded-full bg-ld-surface-container" />
      <div className="columns-1 gap-5 sm:columns-2 xl:columns-3">
        {[260, 200, 300, 220, 240, 280].map((h, i) => (
          <div key={i} className="mb-5 break-inside-avoid animate-pulse rounded-3xl bg-ld-surface-container" style={{ height: h }} />
        ))}
      </div>
    </div>
  );
}
