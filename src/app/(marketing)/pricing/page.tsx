import type { Metadata } from "next";
import { PricingTable } from "@/components/marketing/pricing-table";
import { PageHeader } from "@/components/shared/page-header";

export const metadata: Metadata = {
  title: "Pricing: free couples app with Pro and Max plans",
  description:
    "TaleTwo is free to start. Pro and Max unlock more room, unlimited notes and letters, every couple game and more. One subscription covers both partners.",
  alternates: { canonical: "/pricing" },
  openGraph: { title: "TaleTwo pricing", url: "/pricing" },
};

export default function PricingPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-14 px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
      <PageHeader
        eyebrow="Pricing"
        title="Simple plans for your shared space."
        description="Start free and upgrade whenever you want more room. One subscription covers both partners in your space."
      />
      <PricingTable />
      <p className="mx-auto max-w-2xl text-center text-xs leading-relaxed text-muted-foreground">
        Prices are shown in Indian rupees for India and US dollars elsewhere. Taxes, if any, are shown at checkout.
        Payments are processed by Razorpay.
      </p>
    </div>
  );
}
