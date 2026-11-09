"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { replySupportAction, setSupportStatusAction } from "@/server/actions/admin";

const STATUSES = [
  { value: "OPEN", label: "New" },
  { value: "IN_PROGRESS", label: "In progress" },
  { value: "RESOLVED", label: "Resolved" },
  { value: "CLOSED", label: "Closed" },
] as const;

/** Reply box and status buttons for one support request. Changes show up straight away. */
export function SupportActions({ requestId, status }: { requestId: string; status: string }) {
  const router = useRouter();
  const [reply, setReply] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function send() {
    if (busy) return;
    setBusy(true);
    setError(null);
    const res = await replySupportAction(requestId, reply);
    setBusy(false);
    if (res.error) {
      setError(res.error);
      return;
    }
    setReply("");
    router.refresh();
  }

  async function setStatus(next: (typeof STATUSES)[number]["value"]) {
    if (busy) return;
    setBusy(true);
    setError(null);
    const res = await setSupportStatusAction(requestId, next);
    setBusy(false);
    if (res.error) setError(res.error);
    else router.refresh();
  }

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <p className="text-ld-label-sm text-ld-on-surface-variant">Status</p>
        <div className="flex flex-wrap gap-2">
          {STATUSES.map((s) => (
            <button
              key={s.value}
              type="button"
              onClick={() => setStatus(s.value)}
              disabled={busy}
              aria-pressed={status === s.value}
              className={
                status === s.value
                  ? "rounded-full bg-ld-primary px-3.5 py-1.5 text-ld-label-sm text-ld-on-primary"
                  : "rounded-full bg-ld-surface-container px-3.5 py-1.5 text-ld-label-sm text-ld-on-surface hover:bg-ld-surface-container-high"
              }
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <form
        className="space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
      >
        <label htmlFor="support-reply" className="text-ld-label-sm text-ld-on-surface-variant">Reply to this person</label>
        <textarea
          id="support-reply"
          value={reply}
          onChange={(e) => setReply(e.target.value)}
          rows={4}
          maxLength={3000}
          placeholder="Write a clear, kind reply. They will see it on their support page."
          className="w-full resize-y rounded-2xl border border-ld-outline-variant bg-ld-surface px-4 py-3 text-ld-body-sm text-ld-on-surface focus:border-ld-primary focus:outline-none"
        />
        <div className="flex items-center justify-between gap-3">
          <p className="text-ld-caption text-ld-on-surface-variant">Replying moves a new request to In progress.</p>
          <button type="submit" disabled={busy || reply.trim().length < 2} className="h-10 rounded-full bg-ld-primary px-5 text-ld-label-sm text-ld-on-primary disabled:opacity-50">
            {busy ? "Sending…" : "Send reply"}
          </button>
        </div>
        {error && <p role="alert" className="text-ld-caption text-ld-error">{error}</p>}
      </form>
    </div>
  );
}
