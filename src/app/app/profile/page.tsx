import type { Metadata } from "next";
import { Suspense } from "react";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { ProfileForm } from "@/components/profile/profile-form";
import { getCurrentUser } from "@/server/authorization/session";
import { getMe } from "@/server/services/users";

export const metadata: Metadata = {
  title: "Profile",
  robots: { index: false, follow: false },
};

export default function ProfilePage() {
  return (
    <Suspense fallback={<div className="h-[32rem] animate-pulse rounded-3xl bg-ld-surface-container" aria-busy="true" />}>
      <ProfileContent />
    </Suspense>
  );
}

async function ProfileContent() {
  await connection();
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const me = await getMe(user.id);
  const partner = me.workspace?.members.find((m) => m.userId !== me.id) ?? null;
  return (
    <ProfileForm
      me={me}
      workspaceId={me.workspace?.id ?? null}
      partnerName={partner?.displayName ?? null}
      memberCount={me.workspace?.members.length ?? 0}
    />
  );
}
