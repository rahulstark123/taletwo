import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { cn } from "@/lib/utils";
import { listSupportForAdmin, type SupportFilter } from "@/server/admin/support";

export const metadata: Metadata = { title: "Admin support", robots: { index: false, follow: false } };

const FILTERS: { value: SupportFilter; label: string }[] = [
  { value: "ALL", label: "All" },
  { value: "OPEN", label: "New" },
  { value: "IN_PROGRESS", label: "In progress" },
  { value: "RESOLVED", label: "Resolved" },
  { value: "CLOSED", label: "Closed" },
];

const STATUS_LABEL: Record<string, string> = { OPEN: "New", IN_PROGRESS: "In progress", RESOLVED: "Resolved", CLOSED: "Closed" };

export default async function AdminSupportPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  await connection();
  const sp = await searchParams;
  const filter = (FILTERS.map((f) => f.value) as string[]).includes(sp.status ?? "") ? (sp.status as SupportFilter) : "ALL";
  const rows = await listSupportForAdmin(filter);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-ld-headline-md">Support</h1>
        <nav aria-label="Filter by status" className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <Link
              key={f.value}
              href={f.value === "ALL" ? "/admin/support" : `/admin/support?status=${f.value}`}
              aria-current={filter === f.value ? "page" : undefined}
              className={cn(
                "rounded-full px-3.5 py-1.5 text-ld-label-sm ring-1 transition-colors",
                filter === f.value ? "bg-ld-primary text-ld-on-primary ring-ld-primary" : "bg-ld-surface-container-lowest text-ld-on-surface ring-ld-outline-variant/50"
              )}
            >
              {f.label}
            </Link>
          ))}
        </nav>
      </div>

      {rows.length === 0 ? (
        <p className="rounded-2xl bg-ld-surface-container p-6 text-ld-body-sm text-ld-on-surface-variant">No requests here yet.</p>
      ) : (
        <ul className="divide-y divide-ld-outline-variant/40 overflow-hidden rounded-3xl bg-ld-surface-container-lowest shadow-sm">
          {rows.map((r) => (
            <li key={r.id}>
              <Link href={`/admin/support/${r.id}`} className="flex flex-col gap-1 px-5 py-4 hover:bg-ld-surface-container-low sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="truncate font-semibold text-ld-on-surface">{r.subject}</p>
                  <p className="truncate text-ld-caption text-ld-on-surface-variant">
                    {r.type === "TICKET" ? "Ticket" : "Suggestion"} · {r.category.toLowerCase()} · {r.userName} ({r.userEmail})
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3 text-ld-caption text-ld-on-surface-variant">
                  <span>{r.replies} repl{r.replies === 1 ? "y" : "ies"}</span>
                  <span className="rounded-full bg-ld-surface-container px-2.5 py-0.5 font-medium text-ld-on-surface">{STATUS_LABEL[r.status] ?? r.status}</span>
                  <span>{new Date(r.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" })}</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
