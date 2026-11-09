import type { Metadata } from "next";
import { connection } from "next/server";
import { DailyChart } from "@/components/admin/daily-chart";
import { StatCard } from "@/components/admin/stat-card";
import { getOverview } from "@/server/admin/stats";

export const metadata: Metadata = { title: "Admin overview", robots: { index: false, follow: false } };

export default async function AdminOverviewPage() {
  await connection();
  const o = await getOverview();
  return (
    <div className="space-y-8">
      <section aria-labelledby="totals" className="space-y-4">
        <h1 id="totals" className="font-display text-ld-headline-md">Overview</h1>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="People signed up" value={o.totals.users} trend={o.users} hint={`${o.totals.verifiedUsers} verified`} />
          <StatCard label="Spaces created" value={o.totals.workspaces} trend={o.workspaces} hint={`${o.totals.couples} with two people`} />
          <StatCard label="Support tickets (30 days)" value={o.tickets.current} trend={o.tickets} hint={`${o.totals.openTickets} still open`} />
          <StatCard label="Paid plans right now" value={o.paidPlans.pro + o.paidPlans.max} hint={`${o.paidPlans.pro} Pro · ${o.paidPlans.max} Max`} />
        </div>
      </section>

      <section aria-labelledby="daily" className="space-y-4 rounded-3xl bg-ld-surface-container-lowest p-6 shadow-sm">
        <h2 id="daily" className="font-display text-ld-title-lg">Sign-ups and new spaces, last 30 days</h2>
        <DailyChart points={o.daily} />
      </section>

      <section aria-labelledby="revenue" className="space-y-4">
        <h2 id="revenue" className="font-display text-ld-title-lg">Payments received</h2>
        {o.revenue.length === 0 ? (
          <p className="rounded-2xl bg-ld-surface-container p-5 text-ld-body-sm text-ld-on-surface-variant">No payments in the last 60 days yet.</p>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2">
            {o.revenue.map((r) => (
              <li key={r.currency} className="rounded-2xl bg-ld-surface-container-lowest p-5 shadow-sm">
                <p className="text-ld-label-sm text-ld-on-surface-variant">{r.currency}, last 30 days</p>
                <p className="mt-2 font-display text-[28px]">{r.current.toLocaleString("en-US")}</p>
                <p className="mt-1 text-ld-caption text-ld-on-surface-variant">{r.previous.toLocaleString("en-US")} in the 30 days before</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
