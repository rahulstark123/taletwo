/**
 * Subscription plans: Free, Pro and Max. Client-safe data only. The public pricing page and the in-app
 * Subscriptions page both read this file, so they always show the same prices and features.
 *
 * Prices are in minor units (paise for INR, cents for USD) so billing never handles floats. India pays in
 * rupees; everywhere else pays in US dollars. Payments run through Razorpay, and limits are enforced on
 * the server (see config/plan-limits.ts).
 */

import { PLAN_AI_CREDITS_PER_MONTH, SIGNUP_AI_CREDITS } from "@/config/ai-credits";

export type PlanId = "free" | "pro" | "max";

export type BillingCycle = "month" | "year";

export interface AppPlan {
  id: PlanId;
  name: string;
  tagline: string;
  /** Monthly price in paise. 0 for Free. */
  monthlyMinor: number;
  /** Yearly price in paise, paid once a year. 0 for Free. */
  yearlyMinor: number;
  /** US dollar prices in cents, used outside India. */
  usdMonthlyMinor: number;
  usdYearlyMinor: number;
  highlight?: string;
}

/** The currency a plan is paid in: rupees in India, US dollars elsewhere. */
export type PriceCurrency = "INR" | "USD";

export function priceCurrencyFor(workspaceCurrency: string | null | undefined): PriceCurrency {
  return workspaceCurrency === "INR" ? "INR" : "USD";
}

/** Price in minor units for the cycle and currency. */
export function priceFor(plan: AppPlan, cycle: BillingCycle, currency: PriceCurrency = "INR"): number {
  if (currency === "USD") return cycle === "year" ? plan.usdYearlyMinor : plan.usdMonthlyMinor;
  return cycle === "year" ? plan.yearlyMinor : plan.monthlyMinor;
}

/** Whole-number percentage saved by paying yearly instead of twelve monthly payments. */
export function yearlySavingPercent(plan: AppPlan): number {
  if (!plan.monthlyMinor || !plan.yearlyMinor) return 0;
  return Math.round((1 - plan.yearlyMinor / (plan.monthlyMinor * 12)) * 100);
}

export const APP_PLANS: AppPlan[] = [
  {
    id: "free",
    name: "Free",
    tagline: "Everything you need to start your shared space.",
    monthlyMinor: 0,
    yearlyMinor: 0,
    usdMonthlyMinor: 0,
    usdYearlyMinor: 0,
  },
  {
    id: "pro",
    name: "Pro",
    tagline: "Room for the whole story, with the full connection features.",
    monthlyMinor: 9900,
    yearlyMinor: 99900,
    usdMonthlyMinor: 200,
    usdYearlyMinor: 2000,
    highlight: "Most popular",
  },
  {
    id: "max",
    name: "Max",
    tagline: "No limits, early access and priority help for couples who use TaleTwo every day.",
    monthlyMinor: 29900,
    yearlyMinor: 299900,
    usdMonthlyMinor: 500,
    usdYearlyMinor: 5000,
    highlight: "No limits",
  },
];

/** A feature value: text for a limit, or a boolean for a yes/no feature. */
export type FeatureValue = string | boolean;

export interface FeatureRow {
  label: string;
  free: FeatureValue;
  pro: FeatureValue;
  max: FeatureValue;
}

export interface FeatureGroup {
  title: string;
  rows: FeatureRow[];
}

export const PLAN_FEATURES: FeatureGroup[] = [
  {
    title: "Your space",
    rows: [
      { label: "Couple space for two people", free: true, pro: true, max: true },
      { label: "Shared notes", free: "20", pro: "Unlimited", max: "Unlimited" },
      { label: "Bucket list items", free: "15", pro: "Unlimited", max: "Unlimited" },
      { label: "Active plans", free: "5", pro: "Unlimited", max: "Unlimited" },
      { label: "Special days", free: "5", pro: "100", max: "Unlimited" },
      { label: "Custom calendar events", free: "20", pro: "Unlimited", max: "Unlimited" },
    ],
  },
  {
    title: "Memories",
    rows: [
      { label: "Photos stored", free: "30", pro: "2,000", max: "Unlimited (fair use)" },
      { label: "Export all memories", free: false, pro: true, max: true },
    ],
  },
  {
    title: "Connection",
    rows: [
      { label: "Daily question", free: true, pro: true, max: true },
      { label: "Question history", free: "Last 7 days", pro: "Full history", max: "Full history" },
      { label: "Reveal modes for answers", free: "When both answer", pro: "All modes", max: "All modes" },
      { label: "Couple games", free: "2 games", pro: "All 21 games", max: "All 21 games" },
    ],
  },
  {
    title: "Love letters",
    rows: [
      { label: "Letters per month", free: "2", pro: "Unlimited", max: "Unlimited" },
      { label: "Scheduled “Open when” letters", free: false, pro: true, max: true },
    ],
  },
  {
    title: "Astro AI (preview)",
    rows: [
      { label: "AI credits", free: `${SIGNUP_AI_CREDITS} once, at signup`, pro: `${PLAN_AI_CREDITS_PER_MONTH.pro} a month`, max: `${PLAN_AI_CREDITS_PER_MONTH.max} a month` },
      { label: "Numerology", free: true, pro: true, max: true },
      { label: "Chat sessions", free: "3 a day", pro: "30 a day", max: "Unlimited (fair use)" },
      { label: "Partnership and finance topics", free: false, pro: true, max: true },
    ],
  },
  {
    title: "Reminders and help",
    rows: [
      { label: "Reminders for special days", free: "On the day", pro: "Day before and week before", max: "All reminders" },
      { label: "Early access to new features", free: false, pro: false, max: true },
    ],
  },
];
