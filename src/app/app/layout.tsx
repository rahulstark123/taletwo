import { Suspense, type ReactNode } from "react";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppTopbar } from "@/components/layout/app-topbar";
import { ThemeRoot } from "@/components/layout/theme-root";
import { MobileNav } from "@/components/layout/mobile-nav";
import { APP_PLANS } from "@/config/subscriptions";
import { requireVerifiedUser } from "@/server/authorization/session";
import { getActivePlan } from "@/server/services/billing";
import { getBalance } from "@/server/services/ai-credits";
import { ensureSpaceCode } from "@/server/services/space-code";
import { getMe } from "@/server/services/users";

/**
 * Private app shell. Every /app route passes through requireVerifiedUser() (server-side check
 * against Supabase Auth) and then the onboarding gate, so no one reaches the app without a workspace.
 */
export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<div className="min-h-dvh bg-background" aria-busy="true" />}>
      <AppShell>{children}</AppShell>
    </Suspense>
  );
}

async function AppShell({ children }: { children: ReactNode }) {
  // Private content is rendered per request; it is never prerendered or cached.
  await connection();
  const user = await requireVerifiedUser();
  const me = await getMe(user.id);
  if (!me.onboardingCompleted) redirect("/onboarding/profile");

  const displayName = me.displayName;
  const userInitial = displayName.charAt(0).toUpperCase();
  const activePlan = me.workspace ? await getActivePlan(me.workspace.id) : null;
  const planName = APP_PLANS.find((p) => p.id === (activePlan?.plan ?? "free"))?.name ?? "Free";
  const creditBalance = await getBalance(user.id);
  const spaceCode = await ensureSpaceCode(user.id);

  return (
    <ThemeRoot theme={me.theme}>
    <div className="min-h-dvh bg-background">
      <AppSidebar />
      <div className="flex min-h-dvh flex-col lg:pl-64">
        <AppTopbar
          userName={displayName}
          userEmail={me.email}
          userInitial={userInitial}
          planName={planName}
          creditBalance={creditBalance}
          spaceCode={spaceCode}
          theme={me.theme}
        />
        <main id="main" className="flex-1 px-4 pb-28 pt-6 sm:px-6 lg:px-10 lg:pb-16 lg:pt-10">
          <div className="mx-auto w-full max-w-6xl">{children}</div>
        </main>
      </div>
      <MobileNav />
    </div>
    </ThemeRoot>
  );
}
