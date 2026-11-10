import type { Metadata } from "next";
import { Suspense } from "react";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { ConfessionBoard } from "@/components/confession/confession-board";
import { getCurrentUser } from "@/server/authorization/session";
import { listConfessions } from "@/server/services/confessions";

export const metadata: Metadata = {
  title: "Confession Room",
  robots: { index: false, follow: false },
};

export default function ConfessionRoomPage() {
  return (
    <Suspense fallback={<div role="status" aria-label="Loading the Confession Room" className="h-96 animate-pulse rounded-3xl bg-ld-surface-container" />}>
      <ConfessionContent />
    </Suspense>
  );
}

async function ConfessionContent() {
  await connection();
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const payload = await listConfessions(user.id);
  return <ConfessionBoard initial={payload.confessions} partnerName={payload.partnerName} usage={payload.usage} />;
}
