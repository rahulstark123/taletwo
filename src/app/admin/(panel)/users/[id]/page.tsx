import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { notFound } from "next/navigation";
import { CreditsGrant } from "@/components/admin/credits-grant";
import { getPersonForAdmin } from "@/server/admin/people";

export const metadata: Metadata = { title: "Admin user", robots: { index: false, follow: false } };

export default async function AdminUserPage({ params }: { params: Promise<{ id: string }> }) {
  await connection();
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const p = await getPersonForAdmin(id);
  if (!p) notFound();

  return (
    <div className="space-y-8">
      <Link href="/admin/users" className="text-ld-label-sm text-ld-on-surface-variant hover:text-ld-on-surface">← All users</Link>

      <section className="grid gap-4 rounded-3xl bg-ld-surface-container-lowest p-6 shadow-sm sm:grid-cols-3">
        <div><p className="text-ld-caption text-ld-on-surface-variant">Name</p><p className="font-semibold">{p.name}</p></div>
        <div><p className="text-ld-caption text-ld-on-surface-variant">Email</p><p>{p.email}</p></div>
        <div><p className="text-ld-caption text-ld-on-surface-variant">Verified</p><p>{p.verified ? "Yes" : "No"}</p></div>
        <div><p className="text-ld-caption text-ld-on-surface-variant">Partner</p><p>{p.partnerName ?? "Not connected yet"}</p></div>
        <div><p className="text-ld-caption text-ld-on-surface-variant">Plan</p><p className="capitalize">{p.plan}</p></div>
        <div><p className="text-ld-caption text-ld-on-surface-variant">AI credits</p><p>{p.credits}</p></div>
        <div><p className="text-ld-caption text-ld-on-surface-variant">Support requests</p><p>{p.supportRequests}</p></div>
        <div><p className="text-ld-caption text-ld-on-surface-variant">Joined</p><p>{new Date(p.joined).toLocaleDateString("en-GB", { timeZone: "UTC" })}</p></div>
      </section>

      <section className="space-y-3 rounded-3xl bg-ld-surface-container-lowest p-6 shadow-sm">
        <h2 className="font-display text-ld-title-lg">Give AI credits</h2>
        <CreditsGrant userId={p.id} />
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-ld-title-lg">Payments</h2>
        {p.payments.length === 0 ? (
          <p className="text-ld-body-sm text-ld-on-surface-variant">No payments yet.</p>
        ) : (
          <ul className="divide-y divide-ld-outline-variant/30 rounded-2xl bg-ld-surface-container-lowest shadow-sm">
            {p.payments.map((x) => (
              <li key={x.id} className="flex flex-wrap justify-between gap-2 px-5 py-3 text-ld-body-sm">
                <span className="capitalize">{x.plan} · {x.cycle}</span>
                <span>{x.currency} {x.amount.toLocaleString("en-US")}</span>
                <span className="text-ld-on-surface-variant">{x.status}</span>
                <span className="text-ld-on-surface-variant">{new Date(x.date).toLocaleDateString("en-GB", { timeZone: "UTC" })}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
