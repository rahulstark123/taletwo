import type { Metadata } from "next";
import { Suspense } from "react";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { SpecialDaysBoard } from "@/components/special-days/special-days-board";
import { getCurrentUser } from "@/server/authorization/session";
import { listSpecialDays } from "@/server/services/special-days";

export const metadata: Metadata = {
  title: "Special days",
  robots: { index: false, follow: false },
};

export default function SpecialDaysPage() {
  return (
    <Suspense fallback={<div className="h-72 animate-pulse rounded-3xl bg-ld-surface-container" aria-busy="true" />}>
      <SpecialDaysContent />
    </Suspense>
  );
}

async function SpecialDaysContent() {
  await connection();
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const payload = await listSpecialDays(user.id);
  return <SpecialDaysBoard initial={payload} />;
}
