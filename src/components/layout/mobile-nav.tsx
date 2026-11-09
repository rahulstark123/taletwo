"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { EllipsisIcon, Images, Mail, CalendarDays, Home, X } from "lucide-react";
import { Wordmark } from "@/components/brand/logo";
import { AppNavList, isActivePath } from "@/components/layout/app-nav";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const PRIMARY = [
  { label: "Home", href: "/app", icon: Home },
  { label: "Memories", href: "/app/memories", icon: Images },
  { label: "Letters", href: "/app/letters", icon: Mail },
  { label: "Calendar", href: "/app/calendar", icon: CalendarDays },
];

/** Bottom navigation for phones and a drawer for every section. Hidden from 1024px up. */
export function MobileNav() {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const moreActive = !PRIMARY.some((item) => isActivePath(pathname, item.href));

  return (
    <>
      <nav
        aria-label="Quick navigation"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden"
      >
        <ul className="mx-auto grid max-w-md grid-cols-5">
          {PRIMARY.map((item) => {
            const active = isActivePath(pathname, item.href);
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex min-h-14 flex-col items-center justify-center gap-1 text-[11px] font-medium text-muted-foreground",
                    active && "text-foreground"
                  )}
                >
                  <Icon className={cn("size-5", active && "text-brand-primary")} aria-hidden="true" />
                  {item.label}
                </Link>
              </li>
            );
          })}
          <li>
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              aria-haspopup="dialog"
              aria-expanded={drawerOpen}
              className={cn(
                "flex h-full min-h-14 w-full flex-col items-center justify-center gap-1 text-[11px] font-medium text-muted-foreground",
                moreActive && "text-foreground"
              )}
            >
              <EllipsisIcon className={cn("size-5", moreActive && "text-brand-primary")} aria-hidden="true" />
              More
            </button>
          </li>
        </ul>
      </nav>

      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent side="left" className="w-[min(88vw,22rem)] gap-0 bg-sidebar p-0" showCloseButton={false}>
          <SheetHeader className="flex-row items-center justify-between border-b border-border px-5 py-4">
            <SheetTitle className="sr-only">Navigation</SheetTitle>
            <Wordmark />
            <button
              type="button"
              onClick={() => setDrawerOpen(false)}
              aria-label="Close navigation"
              className="inline-flex size-10 items-center justify-center rounded-md text-muted-foreground hover:bg-surface-muted"
            >
              <X className="size-5" aria-hidden="true" />
            </button>
          </SheetHeader>
          <div className="overflow-y-auto px-3 py-5" onClickCapture={() => setDrawerOpen(false)}>
            <AppNavList />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
