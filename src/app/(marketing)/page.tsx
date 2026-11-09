import type { Metadata } from "next";
import { SITE } from "@/config/site";
import { LandingHero } from "@/components/landing/hero";
import {
  BrandMoment,
  FamilySection,
  FeatureShowcase,
  FinalCta,
  HowItWorksLanding,
  PrivacyGuarantee,
} from "@/components/landing/sections";
import { LandingPlanCards } from "@/components/landing/plan-cards";
import { AstroCreditsSection, ModulesGrid, SpaceCodeSection, SupportAndPlansStrip } from "@/components/landing/new-features";
import { LandingFaq } from "@/components/landing/faq";

export const metadata: Metadata = {
  title: { absolute: `${SITE.name} — ${SITE.tagline}` },
  description: SITE.description,
  alternates: { canonical: "/" },
  openGraph: {
    title: `${SITE.name} — ${SITE.tagline}`,
    description: SITE.description,
    url: "/",
    siteName: SITE.name,
    type: "website",
  },
  twitter: { card: "summary_large_image", title: `${SITE.name} — ${SITE.tagline}`, description: SITE.description },
};

/** Landing page: one idea per section, couples first, family as an optional add-on. */
export default function LandingPage() {
  return (
    <div className="bg-ld-surface text-ld-on-surface">
      <LandingHero />
      <FeatureShowcase />
      <ModulesGrid />
      <SpaceCodeSection />
      <AstroCreditsSection />
      <FamilySection />
      <BrandMoment />
      <HowItWorksLanding />
      <PrivacyGuarantee />
      <LandingPlanCards />
      <SupportAndPlansStrip />
      <LandingFaq />
      <FinalCta />
    </div>
  );
}
