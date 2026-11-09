"use client";

import { useState } from "react";
import { Check, CircleDashed, Crown, Info, Minus } from "lucide-react";
import {
  APP_PLANS,
  PLAN_FEATURES,
  priceFor,
  yearlySavingPercent,
  type AppPlan,
  type BillingCycle,
  type FeatureValue,
  type PlanId,
} from "@/config/subscriptions";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { CurrentPlan } from "@/lib/billing-types";
import { CheckoutModal } from "@/components/subscriptions/checkout-modal";
import { ReceiptsModal } from "@/components/subscriptions/receipts-modal";
import { Receipt } from "lucide-react";

const RANK: Record<PlanId, number> = { free: 0, pro: 1, max: 2 };

function priceLabel(plan: AppPlan, cycle: BillingCycle) {
  if (plan.monthlyMinor === 0) return "Free";
  return formatPrice({ interval: cycle, amountMinor: priceFor(plan, cycle), currency: "INR" });
}

/** Yearly plans show what the year works out to per month, so the two options compare easily. */
function monthlyEquivalent(plan: AppPlan) {
  return formatPrice({ interval: "month", amountMinor: Math.round(plan.yearlyMinor / 12), currency: "INR" });
}

function untilLabel(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Kolkata" });
}

function Cell({ value }: { value: FeatureValue }) {
  if (value === true) {
    return (
      <span className="inline-flex size-6 items-center justify-center rounded-full bg-ld-tertiary-fixed/60 text-ld-on-tertiary-fixed-variant">
        <Check className="size-3.5" aria-label="Included" />
      </span>
    );
  }
  if (value === false) {
    return (
      <span className="inline-flex size-6 items-center justify-center text-ld-on-surface-variant/50">
        <Minus className="size-3.5" aria-label="Not included" />
      </span>
    );
  }
  return <span className="text-ld-body-sm text-ld-on-surface">{value}</span>;
}

interface SubscriptionsViewProps {
  currentPlan: CurrentPlan;
  userName: string;
  userEmail: string;
}

/** Plans, prices, a feature comparison, and the buy flow for Pro and Max. */
export function SubscriptionsView({ currentPlan, userName, userEmail }: SubscriptionsViewProps) {
  const [cycle, setCycle] = useState<BillingCycle>("month");
  const [current, setCurrent] = useState<CurrentPlan>(currentPlan);
  const [buying, setBuying] = useState<AppPlan | null>(null);
  const [showReceipts, setShowReceipts] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const yearSaving = Math.max(...APP_PLANS.map(yearlySavingPercent));

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <p className="inline-flex items-start gap-2 rounded-2xl bg-ld-surface-container p-4 text-ld-body-sm text-ld-on-surface-variant">
          <Info className="mt-0.5 size-4 shrink-0 text-ld-primary" aria-hidden="true" />
          <span>
            Pro and Max are one-time payments for one month or one year, paid securely through Razorpay. They do not renew automatically. One payment covers both partners in your space.
          </span>
        </p>
        {notice && (
          <p role="status" className="rounded-2xl bg-ld-tertiary-fixed/60 p-4 text-ld-body-sm text-ld-on-tertiary-fixed-variant">
            {notice}
          </p>
        )}
      </section>

      <div className="grid gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
        <div className="hidden sm:block" aria-hidden="true" />
        <div className="flex justify-center">
        <div role="radiogroup" aria-label="Billing period" className="inline-flex items-center gap-1 rounded-full bg-ld-surface-container p-1">
          {(["month", "year"] as const).map((c) => {
            const active = cycle === c;
            return (
              <button
                key={c}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => setCycle(c)}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full px-5 py-2 text-ld-label-sm transition-colors",
                  active ? "bg-ld-surface-container-lowest text-ld-on-surface shadow-sm" : "text-ld-on-surface-variant hover:text-ld-on-surface"
                )}
              >
                {c === "month" ? "Monthly" : "Yearly"}
                {c === "year" && (
                  <span className="rounded-full bg-ld-tertiary-fixed/70 px-2 py-0.5 text-[11px] font-semibold text-ld-on-tertiary-fixed-variant">
                    Save up to {yearSaving}%
                  </span>
                )}
              </button>
            );
          })}
        </div>
        </div>
        <div className="flex justify-center sm:justify-end">
          <button
            type="button"
            onClick={() => setShowReceipts(true)}
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-ld-surface-container-lowest px-4 text-ld-label-sm text-ld-on-surface ring-1 ring-ld-outline-variant/50 transition-colors hover:bg-ld-surface"
          >
            <Receipt className="size-4 text-ld-primary" aria-hidden="true" />
            My receipts
          </button>
        </div>
      </div>

      <section aria-label="Plans" className="grid gap-5 md:grid-cols-3">
        {APP_PLANS.map((plan) => {
          const isPaid = plan.monthlyMinor > 0;
          const isCurrent = current.plan === plan.id;
          const includedInCurrent = RANK[current.plan] > RANK[plan.id];
          return (
            <article
              key={plan.id}
              className={cn(
                "relative flex flex-col rounded-3xl bg-ld-surface-container-lowest p-7 shadow-sm",
                plan.id === "pro" && "ring-2 ring-ld-primary/30 shadow-md"
              )}
            >
              {plan.highlight && (
                <span className="absolute right-5 top-5 rounded-full bg-ld-primary px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-ld-on-primary">
                  {plan.highlight}
                </span>
              )}
              <div className="flex items-center gap-2">
                {plan.id === "max" && <Crown className="size-5 text-ld-primary" aria-hidden="true" />}
                <h2 className="font-display text-ld-headline-md text-ld-on-surface">{plan.name}</h2>
              </div>
              <p className="mt-2 min-h-[48px] text-ld-body-sm text-ld-on-surface-variant">{plan.tagline}</p>
              <div className="my-5 flex items-baseline gap-1.5">
                <span className="font-display text-[40px] font-bold text-ld-on-surface">{priceLabel(plan, cycle)}</span>
                {isPaid && <span className="text-ld-body-sm text-ld-on-surface-variant">{cycle === "month" ? "/ month" : "/ year"}</span>}
              </div>
              {isPaid && cycle === "year" && (
                <p className="-mt-3 mb-4 text-ld-caption text-ld-on-surface-variant">About {monthlyEquivalent(plan)} a month, paid once a year</p>
              )}

              <div className="mt-auto space-y-2">
                {isCurrent && isPaid && current.currentPeriodEnd && (
                  <p className="text-center text-ld-caption text-ld-on-surface-variant">Active until {untilLabel(current.currentPeriodEnd)}</p>
                )}
                {!isPaid ? (
                  <button type="button" disabled className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-ld-surface-container text-ld-label-md text-ld-on-surface-variant">
                    {current.plan === "free" ? (
                      <>
                        <CircleDashed className="size-4" aria-hidden="true" />
                        Your current plan
                      </>
                    ) : (
                      "Included in your plan"
                    )}
                  </button>
                ) : includedInCurrent ? (
                  <button type="button" disabled className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-ld-surface-container text-ld-label-md text-ld-on-surface-variant">
                    Included in your plan
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setBuying(plan)}
                    className={cn(
                      "inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl text-ld-label-md transition-opacity hover:opacity-90",
                      isCurrent ? "bg-ld-surface-container text-ld-on-surface" : "bg-ld-primary text-ld-on-primary shadow-[0_4px_14px_rgba(201,126,139,0.3)]"
                    )}
                  >
                    {isCurrent ? (
                      <>
                        <CircleDashed className="size-4" aria-hidden="true" />
                        Extend {plan.name}
                      </>
                    ) : (
                      `Buy ${plan.name}`
                    )}
                  </button>
                )}
              </div>
            </article>
          );
        })}
      </section>

      <section aria-labelledby="compare-heading" className="space-y-4">
        <h2 id="compare-heading" className="font-display text-ld-title-lg text-ld-on-surface">
          Compare plans
        </h2>
        <div className="overflow-x-auto rounded-3xl bg-ld-surface-container-lowest shadow-sm">
          <table className="w-full min-w-[560px] border-separate border-spacing-0 text-left">
            <thead>
              <tr>
                <th scope="col" className="sticky left-0 bg-ld-surface-container-lowest px-5 py-4 text-ld-label-sm text-ld-on-surface-variant">
                  Feature
                </th>
                {APP_PLANS.map((p) => (
                  <th key={p.id} scope="col" className="px-5 py-4 text-center font-display text-ld-title-lg text-ld-on-surface">
                    {p.name}
                  </th>
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
      </section>

      {showReceipts && <ReceiptsModal onClose={() => setShowReceipts(false)} />}

      {buying && (
        <CheckoutModal
          key={`${buying.id}-${cycle}`}
          plan={buying}
          cycle={cycle}
          userName={userName}
          userEmail={userEmail}
          onClose={() => setBuying(null)}
          onPaid={(next) => {
            setCurrent(next);
            setBuying(null);
            setNotice(`Thank you. ${APP_PLANS.find((p) => p.id === next.plan)?.name ?? "Your"} is active until ${next.currentPeriodEnd ? untilLabel(next.currentPeriodEnd) : "the end of your period"}.`);
          }}
        />
      )}
    </div>
  );
}

function FeatureGroupRows({ title, rows }: { title: string; rows: (typeof PLAN_FEATURES)[number]["rows"] }) {
  return (
    <>
      <tr>
        <th scope="rowgroup" colSpan={4} className="bg-ld-surface-container px-5 py-2.5 text-left text-ld-label-sm font-semibold text-ld-primary">
          {title}
        </th>
      </tr>
      {rows.map((row) => (
        <tr key={row.label} className="border-t border-ld-outline-variant/30">
          <th scope="row" className="sticky left-0 bg-ld-surface-container-lowest px-5 py-3 text-ld-body-sm font-normal text-ld-on-surface">
            {row.label}
          </th>
          <td className="px-5 py-3 text-center"><Cell value={row.free} /></td>
          <td className="px-5 py-3 text-center"><Cell value={row.pro} /></td>
          <td className="px-5 py-3 text-center"><Cell value={row.max} /></td>
        </tr>
      ))}
    </>
  );
}
