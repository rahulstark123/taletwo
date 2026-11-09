import type { Metadata } from "next";
import { Suspense } from "react";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { SubscriptionsView } from "@/components/subscriptions/subscriptions-view";
import type { CurrentPlan } from "@/lib/billing-types";
import { getCurrentUser } from "@/server/authorization/session";
import { getActivePlan } from "@/server/services/billing";
import { getActiveWorkspaceForUser } from "@/server/services/workspaces";
import { getMe } from "@/server/services/users";

export const metadata: Metadata = {
  title: "Subscriptions",
  robots: { index: false, follow: false },
};

export default function SubscriptionsPage() {
  return (
    <Suspense fallback={<div role="status" aria-label="Loading plans" className="h-96 animate-pulse rounded-3xl bg-ld-surface-container" />}>
      <SubscriptionsContent />
    </Suspense>
  );
}

async function SubscriptionsContent() {
  await connection();
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const me = await getMe(user.id);
  const workspace = await getActiveWorkspaceForUser(user.id);
  const currentPlan: CurrentPlan = workspace
    ? await getActivePlan(workspace.id)
    : { plan: "free", cycle: null, currentPeriodEnd: null };

  return <SubscriptionsView currentPlan={currentPlan} userName={me.displayName} userEmail={me.email} />;
}
