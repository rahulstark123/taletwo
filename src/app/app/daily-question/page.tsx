import type { Metadata } from "next";
import { Suspense } from "react";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { QuestionBoard } from "@/components/daily-question/question-board";
import { getCurrentUser } from "@/server/authorization/session";
import { getTodayView } from "@/server/services/daily-question";

export const metadata: Metadata = {
  title: "Daily question",
  robots: { index: false, follow: false },
};

export default function DailyQuestionPage() {
  return (
    <Suspense fallback={<div className="h-80 animate-pulse rounded-3xl bg-ld-surface-container" aria-busy="true" />}>
      <DailyQuestionContent />
    </Suspense>
  );
}

async function DailyQuestionContent() {
  await connection();
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const view = await getTodayView(user.id);
  return <QuestionBoard initial={view} />;
}
