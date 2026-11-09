"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { setThemeOverride } from "@/components/layout/theme-store";
import { useState } from "react";
import { Check, ChevronRight, Coins, Copy, Crown, LogOut, Moon, Settings, Sun, UserRound } from "lucide-react";
import { apiCall } from "@/components/onboarding/api-client";
import { useIsDark, type ThemeChoice } from "@/components/layout/theme-root";
import { Wordmark } from "@/components/brand/logo";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { APP_MODULE_STATUS, APP_NAV_ACCOUNT, APP_NAV_SPACE, APP_NAV_TOP_LINKS } from "@/config/navigation";
import { logOutAction } from "@/server/actions/auth";
import { LOGOUT_MESSAGES, LoadingModal } from "@/components/shared/loading-modal";

/** Human title and trail for the current private route. */
export function getAppRouteMeta(pathname: string): { title: string; trail: { label: string; href?: string }[] } {
  if (pathname === "/app") return { title: "Home", trail: [{ label: "Your space" }] };

  const navItem = [...APP_NAV_SPACE, ...APP_NAV_ACCOUNT, ...APP_NAV_TOP_LINKS].find((item) => pathname === item.href);
  if (navItem) return { title: navItem.label, trail: [{ label: "Your space", href: "/app" }, { label: navItem.label }] };

  const status = APP_MODULE_STATUS[pathname];
  if (status) return { title: status.title, trail: [{ label: "Your space", href: "/app" }, { label: status.title }] };

  return { title: "TaleTwo", trail: [{ label: "Your space", href: "/app" }] };
}

export function AppTopbar({
  userName,
  userEmail,
  userInitial,
  planName,
  creditBalance,
  spaceCode,
  theme,
}: {
  userName: string;
  userEmail: string;
  userInitial: string;
  planName: string;
  creditBalance: number;
  spaceCode: string;
  theme: ThemeChoice;
}) {
  const isDark = useIsDark(theme);

  // Flips between light and dark, saves the choice to the account, and refreshes so every screen follows.
  // The new theme shows immediately; the save runs in the background and is undone if it fails.
  async function toggleTheme() {
    const previous = isDark ? "DARK" : "LIGHT";
    const next: ThemeChoice = isDark ? "LIGHT" : "DARK";
    setThemeOverride(next);
    const res = await apiCall<{ theme: ThemeChoice }>("/api/me/preferences", { method: "PATCH", body: { theme: next } });
    if (!res.ok) setThemeOverride(previous);
  }
  const [codeCopied, setCodeCopied] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  function startLogout() {
    setLoggingOut(true);
    logOutAction();
  }

  async function copySpaceCode() {
    try {
      await navigator.clipboard.writeText(spaceCode);
      setCodeCopied(true);
      setTimeout(() => setCodeCopied(false), 1600);
    } catch {
      // Clipboard can be blocked. The code is also visible in Settings.
    }
  }
  const pathname = usePathname();
  const { title, trail } = getAppRouteMeta(pathname);

  return (
    <>
    <header className="sticky top-0 z-20 border-b border-border/80 bg-background/90 backdrop-blur-md">
      <div className="flex h-16 items-center gap-3 px-4 sm:px-6 lg:px-10">
        <div className="lg:hidden">
          <Wordmark compact />
        </div>

        <div className="min-w-0 flex-1">
          <nav aria-label="Breadcrumb" className="hidden items-center gap-1 text-xs text-muted-foreground sm:flex">
            {trail.map((crumb, i) => (
              <span key={`${crumb.label}-${i}`} className="inline-flex items-center gap-1">
                {i > 0 && <ChevronRight className="size-3" aria-hidden="true" />}
                {crumb.href ? (
                  <Link href={crumb.href} className="hover:text-foreground">
                    {crumb.label}
                  </Link>
                ) : (
                  <span aria-current="page">{crumb.label}</span>
                )}
              </span>
            ))}
          </nav>
          <h1 className="truncate text-card-title leading-tight text-foreground sm:text-[22px]">{title}</h1>
        </div>

        <Link
          href="/app/astro-ai"
          title="AI credits. Astro AI uses them."
          aria-label={`${creditBalance} AI credits`}
          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-surface-muted"
        >
          <Coins className="size-3.5 text-primary" aria-hidden="true" />
          <span>{creditBalance}</span>
          <span className="hidden sm:inline">credits</span>
        </Link>

        <button
          type="button"
          onClick={copySpaceCode}
          title="Your space code. Your partner enters it to join you."
          aria-label={`Your space code ${spaceCode.split("").join(" ")}. Click to copy`}
          className="hidden items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 font-mono text-xs font-medium tracking-[0.12em] text-foreground transition-colors hover:bg-surface-muted md:inline-flex"
        >
          <span>{spaceCode}</span>
          {codeCopied ? (
            <Check className="size-3.5 text-primary" aria-hidden="true" />
          ) : (
            <Copy className="size-3.5 text-muted-foreground" aria-hidden="true" />
          )}
        </button>

        <span aria-hidden="true" className="hidden h-6 w-px bg-border md:block" />

        <Link
          href="/app/subscriptions"
          aria-label={`Your plan: ${planName}. Manage subscriptions`}
          title="Your plan"
          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-surface-muted"
        >
          {planName !== "Free" && <Crown className="size-3.5 text-primary" aria-hidden="true" />}
          {planName}
        </Link>

        <button
          type="button"
          onClick={toggleTheme}
          aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
          title={isDark ? "Light mode" : "Dark mode"}
          className="inline-flex size-9 items-center justify-center rounded-full border border-border bg-surface text-foreground transition-colors hover:bg-surface-muted disabled:opacity-60"
        >
          {isDark ? <Sun className="size-4" aria-hidden="true" /> : <Moon className="size-4" aria-hidden="true" />}
        </button>

        <Link
          href="/app/settings"
          aria-label="Settings"
          title="Settings"
          className="inline-flex size-9 items-center justify-center rounded-full border border-border bg-surface text-foreground transition-colors hover:bg-surface-muted"
        >
          <Settings className="size-4" aria-hidden="true" />
        </Link>

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="ghost" size="icon" className="rounded-full" aria-label="Account menu" />
            }
          >
            <Avatar className="size-8">
              <AvatarFallback className="bg-surface-muted text-xs font-semibold text-foreground">
                {userInitial}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuGroup>
              <DropdownMenuLabel className="font-normal">
                <span className="block text-sm font-medium text-foreground">{userName}</span>
                <span className="block truncate text-xs text-muted-foreground">{userEmail}</span>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem render={<Link href="/app/profile" />}>
              <UserRound className="size-4" aria-hidden="true" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem render={<Link href="/app/settings" />}>
              <Settings className="size-4" aria-hidden="true" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={startLogout} className="text-ld-error focus:text-ld-error">
              <LogOut className="size-4" aria-hidden="true" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
    <LoadingModal open={loggingOut} label="Logging you out" messages={LOGOUT_MESSAGES} />
    </>
  );
}
