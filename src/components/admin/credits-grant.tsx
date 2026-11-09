"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { grantCreditsAction } from "@/server/actions/admin";

/** Adds AI credits to one person with a reason. The reason is kept in the audit log. */
export function CreditsGrant({ userId }: { userId: string }) {
  const router = useRouter();
  const [amount, setAmount] = useState("10");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ tone: "ok" | "error"; text: string } | null>(null);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setMsg(null);
    const res = await grantCreditsAction(userId, Number(amount), note);
    setBusy(false);
    if (res.error) {
      setMsg({ tone: "error", text: res.error });
      return;
    }
    setMsg({ tone: "ok", text: `Added. New balance: ${res.balance}.` });
    setNote("");
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-3 sm:flex-row sm:items-end">
      <label className="block space-y-1">
        <span className="text-ld-caption text-ld-on-surface-variant">Credits</span>
        <input type="number" min={1} max={1000} value={amount} onChange={(e) => setAmount(e.target.value)} className="h-10 w-28 rounded-xl border border-ld-outline-variant bg-ld-surface px-3 text-ld-body-sm" />
      </label>
      <label className="block flex-1 space-y-1">
        <span className="text-ld-caption text-ld-on-surface-variant">Reason (kept in the log)</span>
        <input value={note} maxLength={120} onChange={(e) => setNote(e.target.value)} placeholder="For example: apology for a failed charge" className="h-10 w-full rounded-xl border border-ld-outline-variant bg-ld-surface px-3 text-ld-body-sm" />
      </label>
      <button type="submit" disabled={busy || note.trim().length < 3} className="h-10 rounded-full bg-ld-primary px-5 text-ld-label-sm text-ld-on-primary disabled:opacity-50">
        {busy ? "Adding…" : "Add credits"}
      </button>
      {msg && <p role="status" className={msg.tone === "ok" ? "text-ld-caption text-ld-tertiary" : "text-ld-caption text-ld-error"}>{msg.text}</p>}
    </form>
  );
}
