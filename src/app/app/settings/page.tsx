import type { Metadata } from "next";
import { Suspense } from "react";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { SettingsBoard } from "@/components/settings/settings-board";
import { getCurrentUser } from "@/server/authorization/session";
import { getMe } from "@/server/services/users";
import { ensureSpaceCode } from "@/server/services/space-code";

export const metadata: Metadata = {
  title: "Settings",
  robots: { index: false, follow: false },
};

export default function SettingsPage() {
  return (
    <Suspense fallback={<div role="status" aria-label="Loading settings" className="h-96 animate-pulse rounded-3xl bg-ld-surface-container" />}>
      <SettingsContent />
    </Suspense>
  );
}

async function SettingsContent() {
  await connection();
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const me = await getMe(user.id);

  return (
    <SettingsBoard
      initial={{
        displayName: me.displayName,
        email: me.email,
        verified: Boolean(user.email_confirmed_at),
        theme: me.theme,
        workspaceName: me.workspace?.name ?? null,
        memberCount: me.workspace?.members.length ?? 0,
        spaceCode: await ensureSpaceCode(user.id),
        country: me.workspace?.country ?? "IN",
        currency: me.workspace?.currency ?? "INR",
      }}
    />
  );
}
