import type { BillingCycle, PlanId } from "@/config/subscriptions";

/** Client-safe shape of a workspace's plan. */
export interface CurrentPlan {
  plan: PlanId;
  cycle: BillingCycle | null;
  /** ISO time the paid period ends, or null on Free. */
  currentPeriodEnd: string | null;
}

/** One paid order in the receipts list. */
export interface ReceiptDTO {
  id: string;
  plan: string;
  cycle: "month" | "year";
  amountMinor: number;
  currency: string;
  paidAt: string;
}
