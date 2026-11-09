import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { listPeopleForAdmin } from "@/server/admin/people";

export const metadata: Metadata = { title: "Admin users", robots: { index: false, follow: false } };

export default async function AdminUsersPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  await connection();
  const { q = "" } = await searchParams;
  const rows = await listPeopleForAdmin(q);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-ld-headline-md">Users</h1>
        <form className="flex gap-2" action="/admin/users" method="get">
          <label htmlFor="admin-search" className="sr-only">Search by name or email</label>
          <input
            id="admin-search"
            name="q"
            defaultValue={q}
            placeholder="Search name or email"
            className="h-10 w-64 rounded-full border border-ld-outline-variant bg-ld-surface-container-lowest px-4 text-ld-body-sm text-ld-on-surface focus:border-ld-primary focus:outline-none"
          />
          <button type="submit" className="h-10 rounded-full bg-ld-primary px-5 text-ld-label-sm text-ld-on-primary">Search</button>
        </form>
      </div>

      {rows.length === 0 ? (
        <p className="rounded-2xl bg-ld-surface-container p-6 text-ld-body-sm text-ld-on-surface-variant">No one matches that search.</p>
      ) : (
        <div className="overflow-x-auto rounded-3xl bg-ld-surface-container-lowest shadow-sm">
          <table className="w-full min-w-[640px] text-left text-ld-body-sm">
            <thead className="text-ld-caption text-ld-on-surface-variant">
              <tr>
                <th scope="col" className="px-5 py-3 font-medium">Name</th>
                <th scope="col" className="px-5 py-3 font-medium">Email</th>
                <th scope="col" className="px-5 py-3 font-medium">Verified</th>
                <th scope="col" className="px-5 py-3 font-medium">Space</th>
                <th scope="col" className="px-5 py-3 font-medium">Plan</th>
                <th scope="col" className="px-5 py-3 font-medium">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ld-outline-variant/30">
              {rows.map((r) => (
                <tr key={r.id} className="hover:bg-ld-surface-container-low">
                  <td className="px-5 py-3"><Link href={`/admin/users/${r.id}`} className="font-medium text-ld-primary hover:underline">{r.name}</Link></td>
                  <td className="px-5 py-3">{r.email}</td>
                  <td className="px-5 py-3">{r.verified ? "Yes" : "No"}</td>
                  <td className="px-5 py-3">{r.spaceId ? "Yes" : "No"}</td>
                  <td className="px-5 py-3 capitalize">{r.plan}</td>
                  <td className="px-5 py-3">{new Date(r.joined).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
