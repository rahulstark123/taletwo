"use client";

import { useEffect, useState } from "react";
import { Download, Loader2, Receipt, X } from "lucide-react";
import { apiCall } from "@/components/onboarding/api-client";
import { Pagination, usePagination } from "@/components/shared/pagination";
import { APP_PLANS } from "@/config/subscriptions";
import type { ReceiptDTO } from "@/lib/billing-types";
import { formatMoney } from "@/lib/locale";

const CYCLE_WORD = { month: "Monthly", year: "Yearly" } as const;

function whenLabel(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Kolkata" });
}

/** Lists the signed-in user's paid orders, each with its PDF invoice. */
export function ReceiptsModal({ onClose }: { onClose: () => void }) {
  const [receipts, setReceipts] = useState<ReceiptDTO[] | null>(null);
  const paged = usePagination(receipts ?? [], "");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    apiCall<{ receipts: ReceiptDTO[] }>("/api/billing/receipts").then((res) => {
      if (!alive) return;
      if (res.ok) setReceipts(res.data.receipts);
      else setError(res.error.message);
    });
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ld-on-surface/40 p-0 backdrop-blur-sm sm:items-center sm:p-6" role="presentation" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div role="dialog" aria-modal="true" aria-labelledby="receipts-title" className="flex max-h-[88vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-3xl bg-ld-surface-container-lowest shadow-xl sm:rounded-3xl">
        <div className="flex items-start justify-between gap-4 border-b border-ld-outline-variant/40 p-6">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-2xl bg-ld-surface-container text-ld-primary">
              <Receipt className="size-5" aria-hidden="true" />
            </span>
            <div>
              <h2 id="receipts-title" className="font-display text-ld-title-lg text-ld-on-surface">My receipts</h2>
              <p className="text-ld-caption text-ld-on-surface-variant">Every payment you have made, with its invoice.</p>
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="rounded-full p-2 text-ld-on-surface-variant hover:bg-ld-surface-container">
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {receipts === null && !error && (
            <div role="status" className="flex items-center justify-center gap-2 py-12 text-ld-body-sm text-ld-on-surface-variant">
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              Loading your receipts…
            </div>
          )}

          {error && (
            <p role="alert" className="rounded-xl bg-ld-error-container px-4 py-3 text-ld-body-sm text-ld-on-error-container">{error}</p>
          )}

          {receipts && receipts.length === 0 && (
            <p className="py-12 text-center text-ld-body-sm text-ld-on-surface-variant">No payments yet. When you buy Pro or Max, your receipts will appear here.</p>
          )}

          {receipts && receipts.length > 0 && (
            <>
            <ul className="space-y-3">
              {paged.pageItems.map((r) => {
                const planName = APP_PLANS.find((p) => p.id === r.plan)?.name ?? r.plan;
                const amount = formatMoney(r.amountMinor / 100, r.currency);
                return (
                  <li key={r.id} className="flex flex-col gap-3 rounded-2xl bg-ld-surface-container p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-0.5">
                      <p className="text-ld-label-md font-semibold text-ld-on-surface">
                        {planName} · {CYCLE_WORD[r.cycle]}
                      </p>
                      <p className="text-ld-caption text-ld-on-surface-variant">
                        Paid {whenLabel(r.paidAt)} · <span className="font-medium text-ld-tertiary">Paid</span>
                      </p>
                    </div>
                    <div className="flex items-center justify-between gap-4 sm:justify-end">
                      <span className="font-display text-ld-title-lg text-ld-on-surface">{amount}</span>
                      <a
                        href={`/api/billing/receipts/${r.id}/invoice`}
                        download
                        className="inline-flex h-10 items-center gap-2 rounded-xl bg-ld-surface-container-lowest px-4 text-ld-label-sm text-ld-primary ring-1 ring-ld-outline-variant/50 transition-colors hover:bg-ld-surface"
                      >
                        <Download className="size-4" aria-hidden="true" />
                        Invoice PDF
                      </a>
                    </div>
                  </li>
                );
              })}
            </ul>
            <Pagination
              page={paged.page}
              totalPages={paged.totalPages}
              total={paged.total}
              pageSize={paged.pageSize}
              start={paged.start}
              setPage={paged.setPage}
              label="Receipt pages"
            />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
