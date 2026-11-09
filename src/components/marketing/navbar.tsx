"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Wordmark } from "@/components/brand/logo";
import { PublicThemeToggle } from "@/components/marketing/public-theme";
import { MARKETING_NAV } from "@/config/navigation";
import { cn } from "@/lib/utils";

export function MarketingNavbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-ld-surface-container-highest bg-ld-surface/90 shadow-[0_1px_8px_rgba(64,56,50,0.03)] backdrop-blur-md">
      <div className="mx-auto flex h-20 max-w-[1240px] items-center justify-between gap-4 px-5 md:px-6 lg:px-8">
        <Wordmark />

        <nav aria-label="Primary" className="hidden items-center gap-10 md:flex">
          {MARKETING_NAV.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "text-ld-body-md transition-colors duration-200 hover:text-ld-on-surface",
                  active ? "font-medium text-ld-primary" : "text-ld-on-surface-variant"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-4 md:flex">
          <PublicThemeToggle />
          <Link
            href="/login"
            className="px-2.5 py-1 text-ld-label-md text-ld-on-surface-variant transition-colors duration-200 hover:text-ld-on-surface"
          >
            Log In
          </Link>
          <Link
            href="/signup"
            className="inline-flex items-center justify-center rounded-full bg-ld-primary-container px-6 py-2 text-ld-label-md text-ld-on-primary shadow-[0_4px_14px_rgba(201,126,139,0.25)] transition-all duration-300 hover:bg-ld-primary"
          >
            Get Started
          </Link>
        </div>

        <PublicThemeToggle className="md:hidden" />

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? "Close menu" : "Open menu"}
          className="inline-flex size-10 items-center justify-center rounded-md border border-ld-outline-variant bg-ld-surface-container-lowest text-ld-on-surface md:hidden"
        >
          {open ? <X className="size-5" aria-hidden="true" /> : <Menu className="size-5" aria-hidden="true" />}
        </button>
      </div>

      {open && (
        <div id="mobile-menu" className="border-t border-ld-surface-container-highest bg-ld-surface-container-lowest px-5 py-4 md:hidden">
          <nav aria-label="Mobile" className="flex flex-col">
            {MARKETING_NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-3 text-ld-title-md text-ld-on-surface hover:bg-ld-surface-container-low"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="inline-flex h-12 items-center justify-center rounded-full bg-ld-surface-container-low text-ld-label-md text-ld-on-surface"
            >
              Log In
            </Link>
            <Link
              href="/signup"
              onClick={() => setOpen(false)}
              className="inline-flex h-12 items-center justify-center rounded-full bg-ld-primary-container text-ld-label-md text-ld-on-primary"
            >
              Get Started
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
