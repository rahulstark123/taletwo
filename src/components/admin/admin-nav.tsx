"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/support", label: "Support" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/payments", label: "Payments" },
];

/** Tabs across the top of the admin panel. The current tab is highlighted. */
export function AdminNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Admin sections" className="flex flex-wrap gap-2">
      {TABS.map((t) => {
        const active = t.href === "/admin" ? pathname === "/admin" : pathname.startsWith(t.href);
        return (
          <Link
            key={t.href}
            href={t.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "rounded-full px-4 py-2 text-ld-label-sm transition-colors",
              active ? "bg-ld-primary text-ld-on-primary" : "bg-ld-surface-container text-ld-on-surface hover:bg-ld-surface-container-high"
            )}
          >
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
