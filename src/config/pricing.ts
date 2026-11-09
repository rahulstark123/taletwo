/**
 * Pricing configuration.
 *
 * Milestone 1: values live here so no UI component hardcodes a price.
 * Milestone 6: these records move to the SubscriptionPlan table and this file
 * becomes the seed/fallback. Amounts are stored in minor units (paise for INR)
 * so billing code never handles floats.
 */
export type BillingInterval = "month" | "year";

export interface PriceConfig {
  interval: BillingInterval;
  amountMinor: number; // paise for INR
  currency: "INR";
}

export interface PlanConfig {
  id: "free" | "premium";
  name: string;
  summary: string;
  prices: Partial<Record<BillingInterval, PriceConfig>>;
  features: string[];
}

export const PRICING = {
  /** One subscription covers both connected partners. */
  coverageNote: "One subscription covers both connected partners.",
  plans: [
    {
      id: "free",
      name: "Free",
      summary: "Everything you need to start your shared space.",
      prices: {},
      features: [
        "Couple connection",
        "Basic memories with limited storage",
        "Basic shared notes",
        "Limited bucket list",
        "Daily question",
        "Basic special dates",
      ],
    },
    {
      id: "premium",
      name: "Premium",
      summary: "Room for the whole story, with every feature unlocked.",
      prices: {
        month: { interval: "month", amountMinor: 9900, currency: "INR" },
        year: { interval: "year", amountMinor: 59900, currency: "INR" },
      },
      features: [
        "Expanded memory storage",
        "Unlimited notes",
        "Premium love letters",
        "Advanced timeline",
        "Full shared calendar",
        "Premium themes",
        "More customization",
      ],
    },
  ] satisfies PlanConfig[],
};

export function getPlan(id: PlanConfig["id"]): PlanConfig {
  const plan = PRICING.plans.find((p) => p.id === id);
  if (!plan) throw new Error(`Unknown plan: ${id}`);
  return plan;
}

/** Yearly saving compared with twelve monthly payments, as a whole percentage. */
export function yearlySavingPercent(): number {
  const premium = getPlan("premium");
  const monthly = premium.prices.month?.amountMinor ?? 0;
  const yearly = premium.prices.year?.amountMinor ?? 0;
  if (!monthly || !yearly) return 0;
  return Math.round((1 - yearly / (monthly * 12)) * 100);
}
