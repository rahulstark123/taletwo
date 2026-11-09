import type { Metadata } from "next";
import { PricingTable } from "@/components/marketing/pricing-table";
import { PageHeader } from "@/components/shared/page-header";

export const metadata: Metadata = {
  title: "Pricing: free couples app with Pro and Max plans",
  description: "Start with TaleTwo for free. Premium is one subscription that covers both connected partners.",
  alternates: { canonical: "/pricing" },
  openGraph: { title: "TaleTwo pricing", url: "/pricing" },
};

export default function PricingPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-14 px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
      <PageHeader
        eyebrow="Pricing"
        title="Simple plans for your shared space."
        description="Start free and upgrade whenever you want more room. Premium is one subscription per couple, so both partners get the full experience."
      />
      <PricingTable />
      <p className="mx-auto max-w-2xl text-center text-xs leading-relaxed text-muted-foreground">
        Prices shown are launch prices in Indian rupees and may change. Taxes and payment-method fees may apply.
        Billing is not yet active in this preview.
      </p>
    </div>
  );
}
