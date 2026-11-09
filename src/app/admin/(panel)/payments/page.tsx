import type { Metadata } from "next";
import { connection } from "next/server";
import { listPaymentsForAdmin } from "@/server/admin/people";

export const metadata: Metadata = { title: "Admin payments", robots: { index: false, follow: false } };

export default async function AdminPaymentsPage() {
  await connection();
  const rows = await listPaymentsForAdmin();
  return (
    <div className="space-y-6">
      <h1 className="font-display text-ld-headline-md">Payments</h1>
      {rows.length === 0 ? (
        <p className="rounded-2xl bg-ld-surface-container p-6 text-ld-body-sm text-ld-on-surface-variant">No payments yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-3xl bg-ld-surface-container-lowest shadow-sm">
          <table className="w-full min-w-[720px] text-left text-ld-body-sm">
            <thead className="text-ld-caption text-ld-on-surface-variant">
              <tr>
                <th scope="col" className="px-5 py-3 font-medium">Date</th>
                <th scope="col" className="px-5 py-3 font-medium">Person</th>
                <th scope="col" className="px-5 py-3 font-medium">Plan</th>
                <th scope="col" className="px-5 py-3 font-medium">Amount</th>
                <th scope="col" className="px-5 py-3 font-medium">Status</th>
                <th scope="col" className="px-5 py-3 font-medium">Reference</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ld-outline-variant/30">
              {rows.map((r) => (
                <tr key={r.id}>
                  <td className="px-5 py-3">{new Date(r.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" })}</td>
                  <td className="px-5 py-3">{r.name}<span className="block text-ld-caption text-ld-on-surface-variant">{r.email}</span></td>
                  <td className="px-5 py-3 capitalize">{r.plan} · {r.cycle}</td>
                  <td className="px-5 py-3">{r.currency} {r.amount.toLocaleString("en-US")}</td>
                  <td className="px-5 py-3">{r.status}</td>
                  <td className="px-5 py-3 font-mono text-ld-caption">{r.reference ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
