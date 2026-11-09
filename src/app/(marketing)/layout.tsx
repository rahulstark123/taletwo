import type { ReactNode } from "react";
import { MarketingFooter } from "@/components/marketing/footer";
import { MarketingNavbar } from "@/components/marketing/navbar";
import { PublicThemeScope } from "@/components/marketing/public-theme";

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <PublicThemeScope className="flex min-h-dvh flex-col bg-background">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-surface focus:px-4 focus:py-2 focus:text-sm focus:shadow-card"
      >
        Skip to content
      </a>
      <MarketingNavbar />
      <main id="main-content" className="flex-1 pt-20">
        {children}
      </main>
      <MarketingFooter />
    </PublicThemeScope>
  );
}
