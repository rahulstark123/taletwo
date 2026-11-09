import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import type { Trend } from "@/server/admin/stats";

/** A number with its change against the previous 30 days. Green up, red down. */
export function StatCard({ label, value, trend, hint }: { label: string; value: number; trend?: Trend; hint?: string }) {
  const change = trend?.change ?? null;
  const up = change !== null && change > 0;
  const down = change !== null && change < 0;
  return (
    <div className="rounded-2xl bg-ld-surface-container-lowest p-5 shadow-sm">
      <p className="text-ld-label-sm text-ld-on-surface-variant">{label}</p>
      <p className="mt-2 font-display text-[32px] leading-none text-ld-on-surface">{value.toLocaleString("en-IN")}</p>
      <div className="mt-3 flex flex-wrap items-center gap-2 text-ld-caption">
        {trend ? (
          <span className={up ? "inline-flex items-center gap-1 text-ld-tertiary" : down ? "inline-flex items-center gap-1 text-ld-error" : "inline-flex items-center gap-1 text-ld-on-surface-variant"}>
            {up ? <ArrowUpRight className="size-3.5" aria-hidden="true" /> : down ? <ArrowDownRight className="size-3.5" aria-hidden="true" /> : <Minus className="size-3.5" aria-hidden="true" />}
            {change === null ? "New this period" : `${change > 0 ? "+" : ""}${change}% vs last 30 days`}
          </span>
        ) : null}
        {hint && <span className="text-ld-on-surface-variant">{hint}</span>}
      </div>
    </div>
  );
}
