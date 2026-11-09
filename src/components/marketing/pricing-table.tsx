"use client";

import Link from "next/link";
import { useState } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PRICING, yearlySavingPercent, type BillingInterval, type PlanConfig } from "@/config/pricing";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

/** Monthly/yearly toggle and plan comparison. Prices come from config, never from literals here. */
export function PricingTable() {
  const [interval, setInterval] = useState<BillingInterval>("year");
  const saving = yearlySavingPercent();

  return (
    <div className="space-y-10">
      <div className="flex flex-col items-center gap-3">
        <div
          role="radiogroup"
          aria-label="Billing period"
          className="inline-flex rounded-full border border-border bg-surface p-1 shadow-soft"
        >
          {(["month", "year"] as const).map((option) => {
            const active = interval === option;
            return (
              <button
                key={option}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => setInterval(option)}
                className={cn(
                  "min-h-10 rounded-full px-5 text-sm font-medium transition-colors",
                  active ? "bg-brand-primary text-on-primary shadow-soft" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {option === "month" ? "Monthly" : "Yearly"}
                {option === "year" && saving > 0 && (
                  <span className={cn("ml-2 text-xs", active ? "text-on-primary/80" : "text-success")}>
                    Save {saving}%
                  </span>
                )}
              </button>
            );
          })}
        </div>
        <p className="text-sm text-muted-foreground">{PRICING.coverageNote}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {PRICING.plans.map((plan) => (
          <PlanCard key={plan.id} plan={plan} interval={interval} />
        ))}
      </div>
    </div>
  );
}

function PlanCard({ plan, interval }: { plan: PlanConfig; interval: BillingInterval }) {
  const price = plan.prices[interval];
  const isPremium = plan.id === "premium";

  return (
    <article
      aria-labelledby={`plan-${plan.id}`}
      className={cn(
        "flex flex-col rounded-card border bg-surface p-7 sm:p-8",
        isPremium ? "border-brand-accent shadow-card" : "border-border shadow-soft"
      )}
    >
      <div className="space-y-2">
        <h3 id={`plan-${plan.id}`} className="text-card-title text-foreground">
          {plan.name}
        </h3>
        <p className="text-sm text-muted-foreground">{plan.summary}</p>
      </div>

      <div className="mt-6 flex items-baseline gap-2">
        {price ? (
          <>
            <span className="font-display text-4xl text-foreground">{formatPrice(price)}</span>
            <span className="text-sm text-muted-foreground">/ {interval === "month" ? "month" : "year"}</span>
          </>
        ) : (
          <span className="font-display text-4xl text-foreground">Free</span>
        )}
      </div>
      {price && <p className="mt-1 text-xs text-muted-foreground">Per couple, covers both partners</p>}

      <ul className="mt-6 space-y-3 border-t border-border pt-6">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-3 text-sm text-foreground">
            <Check className="mt-0.5 size-4 shrink-0 text-success" aria-hidden="true" />
            {feature}
          </li>
        ))}
      </ul>

      <div className="mt-auto pt-8">
        {isPremium ? (
          <Button size="lg" className="w-full" render={<Link href="/signup" />}>
            Start with Premium
          </Button>
        ) : (
          <Button size="lg" variant="outline" className="w-full" render={<Link href="/signup" />}>
            Create Your Space
          </Button>
        )}
        {isPremium && (
          <p className="mt-3 text-center text-xs text-muted-foreground">
            Checkout is coming soon.
          </p>
        )}
      </div>
    </article>
  );
}
