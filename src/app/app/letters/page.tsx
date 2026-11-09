import type { Metadata } from "next";
import { Suspense } from "react";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { LettersBoard } from "@/components/letters/letters-board";
import { getCurrentUser } from "@/server/authorization/session";
import { listLetters } from "@/server/services/letters";

export const metadata: Metadata = {
  title: "Love letters",
  robots: { index: false, follow: false },
};

export default function LettersPage() {
  return (
    <Suspense fallback={<LettersSkeleton />}>
      <LettersContent />
    </Suspense>
  );
}

async function LettersContent() {
  await connection();
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const payload = await listLetters(user.id);
  return <LettersBoard initial={payload} />;
}

function LettersSkeleton() {
  return (
    <div role="status" aria-label="Loading your letters" className="space-y-6">
      <div className="h-6 w-80 animate-pulse rounded-full bg-ld-surface-container" />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)]">
        <div className="h-[32rem] animate-pulse rounded-3xl bg-ld-surface-container" />
        <div className="h-[32rem] animate-pulse rounded-3xl bg-ld-surface-container" />
      </div>
    </div>
  );
}
