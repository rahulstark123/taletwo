import Link from "next/link";
import { Check, Crown } from "lucide-react";
import { LandingSection, SectionIntro } from "@/components/landing/sections";
import { APP_PLANS, yearlySavingPercent, type AppPlan, type PlanId } from "@/config/subscriptions";
import { PLAN_AI_CREDITS_PER_MONTH, SIGNUP_AI_CREDITS } from "@/config/ai-credits";
import { formatMoney } from "@/lib/locale";
import { cn } from "@/lib/utils";

/** What each plan adds, in short lines. Prices come from src/config/subscriptions.ts. */
const POINTS: Record<PlanId, string[]> = {
  free: [
    "Your couple space for two",
    "Shared notes, plans, bucket list and calendar, with generous limits",
    "Daily questions and two games",
    `${SIGNUP_AI_CREDITS} Astro AI credits when you sign up`,
  ],
  pro: [
    "Unlimited notes, plans, bucket items and calendar events",
    "All twenty-one couple games",
    "Full daily question history and every reveal mode",
    "Scheduled “Open When” letters",
    `${PLAN_AI_CREDITS_PER_MONTH.pro} Astro AI credits every month`,
  ],
  max: [
    "Everything in Pro",
    "Unlimited photos, with fair use",
    "Export all your memories",
    "Early access to new features",
    `${PLAN_AI_CREDITS_PER_MONTH.max} Astro AI credits every month, plus the partnership report`,
  ],
};

function priceText(plan: AppPlan) {
  if (plan.monthlyMinor === 0) return { main: "Free", sub: "forever" };
  return {
    main: formatMoney(plan.monthlyMinor / 100, "INR"),
    sub: `or ${formatMoney(plan.yearlyMinor / 100, "INR")} a year in India · ${formatMoney(plan.usdMonthlyMinor / 100, "USD")} a month outside India`,
  };
}

/** Plan cards for the landing page. One payment covers both partners in a space. */
export function LandingPlanCards() {
  const saving = Math.max(...APP_PLANS.map(yearlySavingPercent));
  return (
    <LandingSection id="pricing" className="bg-ld-surface-container-low py-20 md:py-24">
      <div className="flex flex-col gap-12">
        <SectionIntro
          eyebrow="Simple plans"
          title="Start free. Grow together."
          body={`Pro and Max are one-time payments for a month or a year, not automatic renewals. One payment covers both partners in your space. Yearly plans save up to ${saving}%.`}
        />
        <div className="grid gap-6 md:grid-cols-3">
          {APP_PLANS.map((plan) => {
            const price = priceText(plan);
            const featured = plan.id === "pro";
            return (
              <article
                key={plan.id}
                className={cn(
                  "relative flex flex-col rounded-3xl bg-ld-surface-container-lowest p-8 shadow-sm",
                  featured && "ring-2 ring-ld-primary/30 shadow-md"
                )}
              >
                {plan.highlight && (
                  <span className="absolute right-5 top-5 rounded-full bg-ld-primary px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-ld-on-primary">
                    {plan.highlight}
                  </span>
                )}
                <div className="flex items-center gap-2">
                  {plan.id === "max" && <Crown className="size-5 text-ld-primary" aria-hidden="true" />}
                  <h3 className="font-display text-ld-headline-md text-ld-on-surface">{plan.name}</h3>
                </div>
                <p className="mt-2 text-ld-body-sm text-ld-on-surface-variant">{plan.tagline}</p>
                <div className="my-6">
                  <p className="font-display text-[40px] font-bold text-ld-on-surface">
                    {price.main}
                    {plan.monthlyMinor > 0 && <span className="text-ld-body-sm font-normal text-ld-on-surface-variant"> / month</span>}
                  </p>
                  <p className="text-ld-caption text-ld-on-surface-variant">{price.sub}</p>
                </div>
                <ul className="flex flex-col gap-3 text-ld-body-sm text-ld-on-surface">
                  {POINTS[plan.id].map((point) => (
                    <li key={point} className="flex items-start gap-2.5">
                      <Check className="mt-0.5 size-4 shrink-0 text-ld-tertiary" aria-hidden="true" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/signup"
                  className={cn(
                    "mt-8 inline-flex h-12 items-center justify-center rounded-full text-ld-label-md transition-colors",
                    featured ? "bg-ld-primary text-ld-on-primary hover:bg-ld-on-primary-fixed-variant" : "bg-ld-surface-container text-ld-on-surface hover:bg-ld-surface-container-high"
                  )}
                >
                  {plan.id === "free" ? "Start free" : `Get ${plan.name}`}
                </Link>
              </article>
            );
          })}
        </div>
      </div>
    </LandingSection>
  );
}
