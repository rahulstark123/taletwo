import type { Metadata } from "next";
import { Suspense } from "react";
import { connection } from "next/server";
import { notFound, redirect } from "next/navigation";
import { MemoryDetail } from "@/components/memories/memory-detail";
import { getCurrentUser } from "@/server/authorization/session";
import { getMemory } from "@/server/services/memories";

export const metadata: Metadata = {
  title: "Memory",
  robots: { index: false, follow: false },
};

type Params = Promise<{ id: string }>;

export default function MemoryPage({ params }: { params: Params }) {
  return (
    <Suspense fallback={<div className="h-96 animate-pulse rounded-3xl bg-ld-surface-container" aria-busy="true" />}>
      <MemoryContent params={params} />
    </Suspense>
  );
}

async function MemoryContent({ params }: { params: Params }) {
  await connection();
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const found = await getMemory(user.id, id);
  if (!found) notFound();
  return <MemoryDetail initial={found.memory} workspaceId={found.workspaceId} />;
}
