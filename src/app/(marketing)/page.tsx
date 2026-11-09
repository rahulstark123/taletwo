import type { Metadata } from "next";
import { SITE, getAppUrl } from "@/config/site";
import { APP_PLANS } from "@/config/subscriptions";
import { LANDING_FAQS } from "@/config/faq";
import { JsonLd } from "@/components/seo/json-ld";
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
import { WriteUsSection } from "@/components/landing/write-us";

const HOME_TITLE = `${SITE.name}: a private app for couples`;
const HOME_DESCRIPTION =
  "Save shared memories, write love letters, plan together and play couple games in one private space for two. Free to start.";

export const metadata: Metadata = {
  title: { absolute: HOME_TITLE },
  description: HOME_DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: {
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
    url: "/",
    siteName: SITE.name,
    type: "website",
  },
  twitter: { card: "summary_large_image", title: HOME_TITLE, description: HOME_DESCRIPTION },
};

/** Structured data for the app and its questions. Prices come from the same plan config the pricing page uses. */
const appJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: SITE.name,
  description: HOME_DESCRIPTION,
  applicationCategory: "LifestyleApplication",
  operatingSystem: "Any modern web browser",
  url: getAppUrl(),
  offers: APP_PLANS.map((plan) => ({
    "@type": "Offer",
    name: `${plan.name} plan`,
    price: plan.monthlyMinor / 100,
    priceCurrency: "INR",
    description: plan.tagline,
  })),
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: LANDING_FAQS.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: { "@type": "Answer", text: item.a },
  })),
};

/** Landing page: one idea per section, couples first, family as an optional add-on. */
export default function LandingPage() {
  return (
    <div className="bg-ld-surface text-ld-on-surface">
      <JsonLd data={[appJsonLd, faqJsonLd]} />
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
      <WriteUsSection />
      <FinalCta />
    </div>
  );
}
