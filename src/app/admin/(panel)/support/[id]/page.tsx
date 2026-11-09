import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { notFound } from "next/navigation";
import { SupportActions } from "@/components/admin/support-actions";
import { getSupportForAdmin } from "@/server/admin/support";

export const metadata: Metadata = { title: "Support request", robots: { index: false, follow: false } };

export default async function AdminSupportDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await connection();
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const r = await getSupportForAdmin(id);
  if (!r) notFound();

  return (
    <div className="space-y-8">
      <Link href="/admin/support" className="text-ld-label-sm text-ld-on-surface-variant hover:text-ld-on-surface">← All requests</Link>

      <section className="space-y-4 rounded-3xl bg-ld-surface-container-lowest p-6 shadow-sm">
        <div className="space-y-1">
          <p className="text-ld-caption text-ld-on-surface-variant">
            {r.type === "TICKET" ? "Ticket" : "Suggestion"} · {r.category.toLowerCase()} · priority {r.priority.toLowerCase()} · {new Date(r.createdAt).toLocaleString("en-GB", { timeZone: "UTC" })} UTC
          </p>
          <h1 className="font-display text-ld-headline-md">{r.subject}</h1>
        </div>
        <div className="grid gap-3 text-ld-body-sm sm:grid-cols-3">
          <p><span className="text-ld-on-surface-variant">From</span><br />{r.user.name}</p>
          <p><span className="text-ld-on-surface-variant">Email</span><br />{r.user.email}</p>
          <p><span className="text-ld-on-surface-variant">Plan</span><br />{r.user.plan}</p>
        </div>
        <p className="whitespace-pre-wrap rounded-2xl bg-ld-surface-container p-4 text-ld-body-sm text-ld-on-surface">{r.message}</p>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-ld-title-lg">Conversation</h2>
        {r.replies.length === 0 ? (
          <p className="text-ld-body-sm text-ld-on-surface-variant">No replies yet.</p>
        ) : (
          <ul className="space-y-3">
            {r.replies.map((x) => (
              <li key={x.id} className={x.byTeam ? "ml-auto max-w-xl rounded-2xl bg-ld-secondary-container/40 p-4" : "max-w-xl rounded-2xl bg-ld-surface-container p-4"}>
                <p className="text-ld-caption text-ld-on-surface-variant">{x.byTeam ? "TaleTwo team" : r.user.name} · {new Date(x.createdAt).toLocaleString("en-GB", { timeZone: "UTC" })}</p>
                <p className="mt-1 whitespace-pre-wrap text-ld-body-sm text-ld-on-surface">{x.body}</p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-3xl bg-ld-surface-container-lowest p-6 shadow-sm">
        <SupportActions requestId={r.id} status={r.status} />
      </section>
    </div>
  );
}
