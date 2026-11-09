"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle2, Loader2, Lock, X } from "lucide-react";
import { apiCall } from "@/components/onboarding/api-client";
import { PLAN_FEATURES, priceFor, type AppPlan, type BillingCycle } from "@/config/subscriptions";
import type { CurrentPlan } from "@/lib/billing-types";
import { formatPrice } from "@/lib/format";
import { loadRazorpay, openRazorpay, type RazorpaySuccess } from "@/lib/razorpay-client";
import { cn } from "@/lib/utils";

interface CheckoutOrderResponse {
  orderId: string;
  keyId: string;
  amountMinor: number;
  currency: string;
  plan: AppPlan["id"];
  cycle: BillingCycle;
}

interface CheckoutModalProps {
  plan: AppPlan;
  cycle: BillingCycle;
  userName: string;
  /** The account's own email, sent to Razorpay so the receipt reaches the right inbox. */
  userEmail: string;
  onClose: () => void;
  onPaid: (current: CurrentPlan) => void;
}

const CYCLE_WORDS: Record<BillingCycle, { label: string; period: string }> = {
  month: { label: "Monthly", period: "one month" },
  year: { label: "Yearly", period: "one year" },
};

/** Everything the plan includes, taken from the same table as the comparison, so the two always match. */
function includedRows(plan: AppPlan) {
  return PLAN_FEATURES.flatMap((group) =>
    group.rows
      .filter((row) => row[plan.id] !== false)
      .map((row) => ({ group: group.title, label: row.label, value: row[plan.id] === true ? "Included" : String(row[plan.id]) }))
  );
}

/**
 * Step one of buying: a preview of exactly what is being bought. Step two (after Confirm) creates the
 * order on the server and opens Razorpay Checkout. Nothing is charged before the user confirms here.
 */
export function CheckoutModal({ plan, cycle, userName, userEmail, onClose, onPaid }: CheckoutModalProps) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const amountMinor = priceFor(plan, cycle);
  const price = formatPrice({ interval: cycle, amountMinor, currency: "INR" });
  const rows = includedRows(plan);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && !busy) onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [busy, onClose]);

  async function confirm() {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const order = await apiCall<CheckoutOrderResponse>("/api/billing/checkout", { method: "POST", body: { plan: plan.id, cycle } });
      if (!order.ok) throw new Error(order.error.message);
      await loadRazorpay();

      const rzp = openRazorpay({
        key: order.data.keyId,
        amount: order.data.amountMinor,
        currency: order.data.currency,
        name: "TaleTwo",
        description: `${plan.name} plan, ${CYCLE_WORDS[cycle].period}`,
        order_id: order.data.orderId,
        // Only this account's own details are prefilled. Razorpay's saved-customer memory is off, so
        // contacts from other checkouts on this browser never appear here.
        prefill: { name: userName, email: userEmail },
        remember_customer: false,
        theme: { color: "#c97e8b" },
        modal: { ondismiss: () => setBusy(false) },
        handler: async (response: RazorpaySuccess) => {
          const done = await apiCall<{ current: CurrentPlan }>("/api/billing/confirm", {
            method: "POST",
            body: {
              orderId: response.razorpay_order_id,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
            },
          });
          setBusy(false);
          if (!done.ok) {
            setError(done.error.message);
            return;
          }
          onPaid(done.data.current);
        },
      });
      rzp.on("payment.failed", (r) => {
        setBusy(false);
        setError(r.error?.description || "The payment did not go through. You have not been charged for this plan.");
      });
      rzp.open();
    } catch (e) {
      setBusy(false);
      setError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ld-on-surface/40 p-0 backdrop-blur-sm sm:items-center sm:p-6" role="presentation" onMouseDown={(e) => e.target === e.currentTarget && !busy && onClose()}>
      <div role="dialog" aria-modal="true" aria-labelledby="checkout-title" className="flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl bg-ld-surface-container-lowest shadow-xl sm:rounded-3xl">
        <div className="flex items-start justify-between gap-4 border-b border-ld-outline-variant/40 p-6">
          <div className="space-y-1">
            <p className="text-ld-label-sm font-semibold uppercase tracking-wider text-ld-primary">Review your purchase</p>
            <h2 id="checkout-title" className="font-display text-ld-title-lg text-ld-on-surface">
              {plan.name} · {CYCLE_WORDS[cycle].label}
            </h2>
          </div>
          <button type="button" onClick={onClose} disabled={busy} aria-label="Close" className="rounded-full p-2 text-ld-on-surface-variant hover:bg-ld-surface-container disabled:opacity-50">
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto p-6">
          <div className="flex items-baseline justify-between rounded-2xl bg-ld-surface-container p-5">
            <div>
              <p className="text-ld-body-sm text-ld-on-surface-variant">You pay</p>
              <p className="font-display text-[34px] font-bold text-ld-on-surface">{price}</p>
            </div>
            <p className="text-right text-ld-body-sm text-ld-on-surface-variant">
              for {CYCLE_WORDS[cycle].period}
              <br />
              one-time, no auto-renewal
            </p>
          </div>

          <ul className="space-y-2 text-ld-body-sm text-ld-on-surface-variant">
            <li className="flex gap-2"><CheckCircle2 className="mt-0.5 size-4 shrink-0 text-ld-tertiary" aria-hidden="true" />Covers both partners in your couple space.</li>
            <li className="flex gap-2"><CheckCircle2 className="mt-0.5 size-4 shrink-0 text-ld-tertiary" aria-hidden="true" />Starts as soon as payment is confirmed. If you already have time left, it is added after it.</li>
            <li className="flex gap-2"><CheckCircle2 className="mt-0.5 size-4 shrink-0 text-ld-tertiary" aria-hidden="true" />When it ends, your space goes back to Free. Your memories and notes stay.</li>
          </ul>

          <div className="space-y-2">
            <p className="text-ld-label-sm font-semibold text-ld-on-surface">What you get with {plan.name}</p>
            <div className="max-h-56 overflow-y-auto rounded-2xl ring-1 ring-ld-outline-variant/40">
              <ul className="divide-y divide-ld-outline-variant/30">
                {rows.map((r) => (
                  <li key={`${r.group}-${r.label}`} className="flex items-center justify-between gap-3 px-4 py-2.5 text-ld-body-sm">
                    <span className="text-ld-on-surface">{r.label}</span>
                    <span className="shrink-0 text-ld-on-surface-variant">{r.value}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {error && (
            <p role="alert" className="flex items-start gap-2 rounded-xl bg-ld-error-container px-4 py-3 text-ld-body-sm text-ld-on-error-container">
              <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              {error}
            </p>
          )}
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-ld-outline-variant/40 p-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="inline-flex items-center gap-1.5 text-ld-caption text-ld-on-surface-variant">
            <Lock className="size-3.5" aria-hidden="true" />
            Secure payment by Razorpay
          </p>
          <div className="flex gap-3">
            <button type="button" onClick={onClose} disabled={busy} className="h-11 flex-1 rounded-xl px-5 text-ld-label-md text-ld-on-surface-variant hover:bg-ld-surface-container disabled:opacity-50 sm:flex-none">
              Cancel
            </button>
            <button
              type="button"
              onClick={confirm}
              disabled={busy}
              className={cn("inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-ld-primary px-5 text-ld-label-md text-ld-on-primary shadow-[0_4px_14px_rgba(201,126,139,0.3)] hover:opacity-90 disabled:opacity-60 sm:flex-none")}
            >
              {busy ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
              {busy ? "Opening payment…" : `Confirm and pay ${price}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
