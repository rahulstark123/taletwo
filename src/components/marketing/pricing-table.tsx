"use client";

import Link from "next/link";
import { useState } from "react";
import { Check, Minus } from "lucide-react";
import { APP_PLANS, PLAN_FEATURES, priceFor, yearlySavingPercent, type AppPlan, type BillingCycle, type FeatureValue } from "@/config/subscriptions";
import { formatMoney } from "@/lib/locale";
import { cn } from "@/lib/utils";

/**
 * Public pricing: plan cards and the full comparison. Every number comes from config/subscriptions.ts, the
 * same source the app's Subscriptions page uses, so the public page and the app always agree.
 */
export function PricingTable() {
  const [cycle, setCycle] = useState<BillingCycle>("month");
  const saving = Math.max(...APP_PLANS.map(yearlySavingPercent));

  return (
    <div className="space-y-12">
      <div className="flex flex-col items-center gap-3">
        <div role="radiogroup" aria-label="Billing period" className="inline-flex rounded-full bg-ld-surface-container p-1">
          {(["month", "year"] as const).map((option) => {
            const active = cycle === option;
            return (
              <button
                key={option}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => setCycle(option)}
                className={cn(
                  "min-h-10 rounded-full px-5 text-ld-label-md transition-colors",
                  active ? "bg-ld-primary text-ld-on-primary shadow-sm" : "text-ld-on-surface-variant hover:text-ld-on-surface"
                )}
              >
                {option === "month" ? "Monthly" : "Yearly"}
                {option === "year" && saving > 0 && (
                  <span className={cn("ml-2 text-ld-caption", active ? "text-ld-on-primary/85" : "text-ld-primary")}>Save {saving}%</span>
                )}
              </button>
            );
          })}
        </div>
        <p className="text-center text-ld-body-sm text-ld-on-surface-variant">
          One subscription covers both partners in your space. Prices are in Indian rupees in India and US dollars elsewhere.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {APP_PLANS.map((plan) => (
          <PlanCard key={plan.id} plan={plan} cycle={cycle} />
        ))}
      </div>

      <div className="overflow-x-auto rounded-3xl bg-ld-surface-container-lowest shadow-sm">
        <table className="w-full min-w-[640px] text-left text-ld-body-sm">
          <caption className="px-5 pb-2 pt-5 text-left font-display text-ld-title-lg text-ld-on-surface">Compare every plan</caption>
          <thead className="text-ld-label-sm text-ld-on-surface-variant">
            <tr>
              <th scope="col" className="px-5 py-3 font-medium">Feature</th>
              {APP_PLANS.map((p) => (
                <th key={p.id} scope="col" className="px-5 py-3 text-center font-medium">{p.name}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PLAN_FEATURES.map((group) => (
              <FeatureGroupRows key={group.title} title={group.title} rows={group.rows} />
            ))}
          </tbody>
        </table>
      </div>

      <p className="mx-auto max-w-2xl text-center text-ld-caption text-ld-on-surface-variant">
        Pro and Max are one-time payments for one month or one year. They do not renew automatically. Taxes, if any, are shown at checkout inside the app.
      </p>
    </div>
  );
}

function PriceLine({ plan, cycle }: { plan: AppPlan; cycle: BillingCycle }) {
  if (plan.monthlyMinor === 0) return <span className="font-display text-ld-headline-md text-ld-on-surface">Free</span>;
  const inr = priceFor(plan, cycle, "INR") / 100;
  const usd = priceFor(plan, cycle, "USD") / 100;
  const period = cycle === "year" ? "a year" : "a month";
  return (
    <div className="space-y-1">
      <p className="font-display text-ld-headline-md text-ld-on-surface">
        {formatMoney(inr, "INR")} <span className="text-ld-body-sm text-ld-on-surface-variant">{period} in India</span>
      </p>
      <p className="text-ld-caption text-ld-on-surface-variant">or {formatMoney(usd, "USD")} {period} outside India</p>
    </div>
  );
}

function PlanCard({ plan, cycle }: { plan: AppPlan; cycle: BillingCycle }) {
  const featured = plan.id === "pro";
  return (
    <article
      aria-labelledby={`plan-${plan.id}`}
      className={cn(
        "flex flex-col rounded-3xl bg-ld-surface-container-lowest p-7 shadow-sm sm:p-8",
        featured && "ring-2 ring-ld-primary"
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <h3 id={`plan-${plan.id}`} className="font-display text-ld-title-lg text-ld-on-surface">{plan.name}</h3>
        {plan.highlight && (
          <span className="rounded-full bg-ld-tertiary-fixed/60 px-3 py-1 text-ld-caption font-medium text-ld-on-tertiary-fixed-variant">{plan.highlight}</span>
        )}
      </div>
      <p className="mt-2 text-ld-body-sm text-ld-on-surface-variant">{plan.tagline}</p>
      <div className="mt-6">
        <PriceLine plan={plan} cycle={cycle} />
      </div>
      <div className="mt-auto pt-8">
        <Link
          href="/signup"
          className={cn(
            "inline-flex h-12 w-full items-center justify-center rounded-full text-ld-label-md transition-colors",
            featured ? "bg-ld-primary text-ld-on-primary hover:bg-ld-on-primary-fixed-variant" : "bg-ld-surface-container text-ld-on-surface hover:bg-ld-surface-container-high"
          )}
        >
          {plan.monthlyMinor === 0 ? "Start free" : "Create your space"}
        </Link>
        {plan.monthlyMinor > 0 && (
          <p className="mt-3 text-center text-ld-caption text-ld-on-surface-variant">Pay securely inside the app after you create your space.</p>
        )}
      </div>
    </article>
  );
}

function FeatureGroupRows({ title, rows }: { title: string; rows: { label: string; free: FeatureValue; pro: FeatureValue; max: FeatureValue }[] }) {
  return (
    <>
      <tr>
        <th scope="rowgroup" colSpan={4} className="bg-ld-surface-container px-5 py-2.5 text-left text-ld-label-sm font-semibold text-ld-primary">
          {title}
        </th>
      </tr>
      {rows.map((row) => (
        <tr key={row.label} className="border-t border-ld-outline-variant/30">
          <th scope="row" className="px-5 py-3 text-left font-normal text-ld-on-surface">{row.label}</th>
          {(["free", "pro", "max"] as const).map((id) => (
            <td key={id} className="px-5 py-3 text-center text-ld-on-surface">
              <FeatureCell value={row[id]} />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

function FeatureCell({ value }: { value: FeatureValue }) {
  if (value === true) return <Check className="mx-auto size-4 text-ld-primary" aria-label="Included" />;
  if (value === false) return <Minus className="mx-auto size-4 text-ld-outline" aria-label="Not included" />;
  return <span>{value}</span>;
}
