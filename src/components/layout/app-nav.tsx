"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { APP_NAV_ACCOUNT, APP_NAV_SPACE, type NavItem } from "@/config/navigation";
import { cn } from "@/lib/utils";

/** Route match: /app is active only on exactly /app; sections match their subtree. */
export function isActivePath(pathname: string, href: string): boolean {
  if (href === "/app") return pathname === "/app";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavGroup({
  label,
  items,
  pathname,
  onNavigate,
}: {
  label: string;
  items: NavItem[];
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <div className="space-y-1">
      <p className="px-3 pb-1 text-eyebrow text-[11px]">{label}</p>
      <ul className="space-y-0.5">
        {items.map((item) => {
          const active = isActivePath(pathname, item.href);
          const Icon = item.icon;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={onNavigate}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "group flex min-h-10 items-center gap-3 rounded-md px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground",
                  active && "bg-surface-muted text-foreground shadow-soft"
                )}
              >
                <Icon
                  aria-hidden="true"
                  className={cn("size-4 shrink-0", active ? "text-brand-primary" : "text-muted-foreground")}
                />
                <span className="truncate">{item.label}</span>
                {item.soon && (
                  <span className="ml-auto rounded-full bg-ld-tertiary-fixed/60 px-2 py-0.5 text-[10px] font-semibold text-ld-on-tertiary-fixed-variant">Soon</span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/** Full navigation: "Your space" and "Account" groups. Shared by the sidebar and the mobile drawer. */
export function AppNavList({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Private app" className="flex flex-col gap-6">
      <NavGroup label="Your space" items={APP_NAV_SPACE} pathname={pathname} onNavigate={onNavigate} />
      <NavGroup label="Account" items={APP_NAV_ACCOUNT} pathname={pathname} onNavigate={onNavigate} />
    </nav>
  );
}
