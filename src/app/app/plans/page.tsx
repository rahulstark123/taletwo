import type { Metadata } from "next";
import { Suspense } from "react";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { PlansBoard } from "@/components/plans/plans-board";
import { getCurrentUser } from "@/server/authorization/session";
import { listPlans } from "@/server/services/plans";

export const metadata: Metadata = {
  title: "Our plans",
  robots: { index: false, follow: false },
};

export default function PlansPage() {
  return (
    <Suspense fallback={<PlansSkeleton />}>
      <PlansContent />
    </Suspense>
  );
}

async function PlansContent() {
  await connection();
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const payload = await listPlans(user.id);
  return <PlansBoard initial={payload} />;
}

function PlansSkeleton() {
  return (
    <div role="status" aria-label="Loading your plans" className="space-y-6">
      <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <div className="h-44 animate-pulse rounded-3xl bg-ld-surface-container" />
        <div className="grid grid-cols-2 gap-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-3xl bg-ld-surface-container" />
          ))}
        </div>
      </div>
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-64 animate-pulse rounded-3xl bg-ld-surface-container" />
        ))}
      </div>
    </div>
  );
}
