"use client";

import { useState } from "react";
import { EyeOff, Lock, LockOpen, Mic, Plus, Trash2, Unlock, Users } from "lucide-react";
import { apiCall } from "@/components/onboarding/api-client";
import { ConfessionWriter } from "@/components/confession/confession-writer";
import { PasswordInput } from "@/components/confession/password-input";
import { useConfirm } from "@/components/shared/use-confirm";
import { deriveKey, openBytes, openText } from "@/lib/confession-crypto";
import type { ConfessionDetail, ConfessionListItem } from "@/server/services/confessions";

interface Opened {
  id: string;
  title: string;
  text: string;
  audioUrl: string | null;
  isMine: boolean;
  shared: boolean;
}

const dateFmt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" });

/** Confession Room: private and shared confessions. Each one opens only with its lock password. */
export function ConfessionBoard({ initial, partnerName, usage }: { initial: ConfessionListItem[]; partnerName: string; usage: { used: number; limit: number | null } }) {
  const [items, setItems] = useState<ConfessionListItem[]>(initial);
  const [used, setUsed] = useState(usage.used);
  const [writing, setWriting] = useState(false);
  const [locked, setLocked] = useState<ConfessionListItem | null>(null);
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [opened, setOpened] = useState<Opened | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const { confirm, dialog } = useConfirm();

  async function unlock(e: React.FormEvent) {
    e.preventDefault();
    if (!locked || busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await apiCall<{ confession: ConfessionDetail }>(`/api/confessions/${locked.id}`);
      if (!res.ok) {
        setError(res.error.message);
        return;
      }
      const detail = res.data.confession;
      const key = await deriveKey(password, detail.salt);
      let meta: { title: string; text: string; audioMime?: string };
      try {
        meta = JSON.parse(await openText(key, detail.sealed)) as typeof meta;
      } catch {
        setError("That password does not match this confession. Check it and try again.");
        return;
      }
      let audioUrl: string | null = null;
      if (detail.hasAudio) {
        let encrypted: Uint8Array;
        try {
          const download = await fetch(`/api/confessions/${detail.id}/audio`, { credentials: "same-origin" });
          if (!download.ok) throw new Error(`Download failed with status ${download.status}`);
          encrypted = new Uint8Array(await download.arrayBuffer());
        } catch (err) {
          console.error("[confession] voice note download failed", err);
          setError("The text opened, but the voice note could not be downloaded. Check your connection and try again.");
          return;
        }
        const plain = await openBytes(key, encrypted);
        audioUrl = URL.createObjectURL(new Blob([plain.slice().buffer], { type: meta.audioMime || "audio/webm" }));
      }
      setOpened({ id: detail.id, title: meta.title, text: meta.text, audioUrl, isMine: detail.isMine, shared: detail.shared });
      setLocked(null);
      setPassword("");
    } catch (err) {
      console.error("[confession] open failed", err);
      setError("This confession could not be opened. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  function closeOpened() {
    if (opened?.audioUrl) URL.revokeObjectURL(opened.audioUrl);
    setOpened(null);
  }

  async function removeConfession(id: string) {
    if (!(await confirm({ title: "Delete this confession?", description: "It will be removed for good, including its recording. This cannot be undone.", confirmLabel: "Delete" }))) return;
    const res = await apiCall<{ deleted: boolean }>(`/api/confessions/${id}`, { method: "DELETE" });
    if (!res.ok) {
      setNotice(res.error.message);
      return;
    }
    setItems((prev) => prev.filter((c) => c.id !== id));
    closeOpened();
    setNotice("Confession deleted.");
  }

  function saved(item: ConfessionListItem) {
    setItems((prev) => [item, ...prev]);
    setUsed((n) => n + 1);
    setWriting(false);
    setNotice(item.shared ? `Saved and shared with ${partnerName}. It still needs the lock password to open.` : "Saved privately. Only you can see it, and it needs your lock password.");
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl space-y-2">
          <p className="text-ld-body-md text-ld-on-surface-variant">
            A quiet place for the things you want to say. Write them down or record your voice, then lock each one with a password.
          </p>
          <p className="flex items-start gap-2 text-ld-caption text-ld-on-surface-variant">
            <Lock className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
            Your password never leaves your device, and we cannot read your confessions. If the password is lost, the confession cannot be opened by anyone.
          </p>
          {usage.limit !== null && (
            <p className="text-ld-caption text-ld-on-surface-variant">
              {Math.max(0, usage.limit - used)} of {usage.limit} confessions left this month on your plan.
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={() => setWriting(true)}
          className="inline-flex h-12 items-center gap-2 rounded-full bg-ld-primary px-6 text-ld-label-md text-ld-on-primary shadow-[0_8px_20px_rgba(201,126,139,0.28)] transition-colors hover:bg-ld-on-primary-fixed-variant"
        >
          <Plus className="size-5" aria-hidden="true" />
          Write a confession
        </button>
      </header>

      {notice && (
        <p role="status" className="rounded-2xl bg-ld-tertiary-fixed/50 px-4 py-3 text-ld-caption text-ld-on-tertiary-fixed-variant">
          {notice}
        </p>
      )}

      {items.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed border-ld-outline-variant px-6 py-14 text-center">
          <Lock className="size-7 text-ld-primary" aria-hidden="true" />
          <p className="font-display text-ld-title-lg text-ld-on-surface">No confessions yet</p>
          <p className="max-w-sm text-ld-caption text-ld-on-surface-variant">Write one only you can open, or share one that your partner unlocks with the password.</p>
        </div>
      ) : (
        <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3" aria-label="Confessions">
          {items.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => {
                  setLocked(item);
                  setError(null);
                  setPassword("");
                }}
                className="group flex h-full w-full flex-col gap-4 rounded-3xl bg-ld-surface-container-lowest p-6 text-left shadow-sm ring-1 ring-ld-on-surface/5 transition-all hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-ld-primary"
              >
                <span className="flex items-center justify-between gap-3">
                  <span className="flex size-11 items-center justify-center rounded-2xl bg-ld-surface-container text-ld-primary">
                    <Lock className="size-5" aria-hidden="true" />
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-ld-surface-container px-3 py-1 text-[11px] font-medium text-ld-on-surface-variant">
                    {item.shared ? <Users className="size-3" aria-hidden="true" /> : <EyeOff className="size-3" aria-hidden="true" />}
                    {item.shared ? `Shared with ${partnerName}` : "Private"}
                  </span>
                </span>
                <span className="space-y-1">
                  <span className="block truncate font-display text-ld-title-md text-ld-on-surface">{item.label || "Locked confession"}</span>
                  <span className="block text-ld-caption text-ld-on-surface-variant">
                    From {item.authorName} · {dateFmt.format(new Date(item.createdAt))}
                    {item.hasAudio ? " · includes a voice note" : ""}
                  </span>
                </span>
                <span className="mt-auto inline-flex items-center gap-2 text-ld-label-sm text-ld-primary">
                  <Unlock className="size-4 transition-transform group-hover:-translate-y-0.5" aria-hidden="true" />
                  Enter password to open
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Password prompt */}
      {locked && (
        <div className="fixed inset-0 z-[80] flex items-end justify-center bg-ld-on-surface/40 p-0 backdrop-blur-sm sm:items-center sm:p-6" role="presentation" onMouseDown={(e) => e.target === e.currentTarget && !busy && setLocked(null)}>
          <form onSubmit={unlock} role="dialog" aria-modal="true" aria-labelledby="unlock-title" className="w-full max-w-md space-y-5 rounded-t-3xl bg-ld-surface p-6 shadow-xl sm:rounded-3xl sm:p-8">
            <div className="flex items-start gap-3">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-ld-surface-container text-ld-primary">
                <LockOpen className="size-5" aria-hidden="true" />
              </span>
              <div>
                <h2 id="unlock-title" className="font-display text-ld-title-lg text-ld-on-surface">Enter the lock password</h2>
                <p className="text-ld-caption text-ld-on-surface-variant">Only the password the writer chose opens this confession.</p>
              </div>
            </div>
            <label className="block space-y-1.5">
              <span className="text-ld-label-sm text-ld-on-surface-variant">Lock password</span>
              <PasswordInput value={password} onChange={setPassword} ariaLabel="Lock password" autoFocus placeholder="••••••••" />
            </label>
            {error && <p role="alert" className="rounded-xl bg-ld-error-container px-4 py-2 text-ld-caption text-ld-on-error-container">{error}</p>}
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setLocked(null)} disabled={busy} className="h-11 rounded-full px-5 text-ld-label-md text-ld-on-surface-variant hover:bg-ld-surface-container disabled:opacity-50">
                Cancel
              </button>
              <button type="submit" disabled={busy || password.length === 0} className="inline-flex h-11 items-center gap-2 rounded-full bg-ld-primary px-6 text-ld-label-md text-ld-on-primary disabled:opacity-50">
                <Unlock className="size-4" aria-hidden="true" />
                {busy ? "Opening…" : "Open"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Opened confession. Plaintext lives only in this component state and is cleared on close. */}
      {opened && (
        <div className="fixed inset-0 z-[80] flex items-end justify-center bg-ld-on-surface/40 p-0 backdrop-blur-sm sm:items-center sm:p-6" role="presentation" onMouseDown={(e) => e.target === e.currentTarget && closeOpened()}>
          <article role="dialog" aria-modal="true" aria-labelledby="opened-title" className="flex max-h-[90dvh] w-full max-w-2xl flex-col overflow-hidden rounded-t-3xl bg-ld-surface shadow-xl sm:rounded-3xl">
            <header className="flex items-start justify-between gap-4 border-b border-ld-on-surface/10 px-6 py-4">
              <div className="min-w-0">
                <p className="text-ld-caption text-ld-on-surface-variant">{opened.shared ? "Shared confession" : "Private confession"}</p>
                <h2 id="opened-title" className="truncate font-display text-ld-title-lg text-ld-on-surface">{opened.title || "Untitled confession"}</h2>
              </div>
              <button type="button" onClick={closeOpened} className="rounded-full px-4 py-2 text-ld-label-sm text-ld-on-surface-variant hover:bg-ld-surface-container">
                Close
              </button>
            </header>
            <div className="flex-1 space-y-6 overflow-y-auto px-6 py-6">
              {opened.audioUrl && (
                <div className="space-y-2 rounded-2xl bg-ld-surface-container p-4">
                  <p className="flex items-center gap-2 text-ld-label-sm text-ld-on-surface-variant">
                    <Mic className="size-4" aria-hidden="true" />
                    Voice note
                  </p>
                  <audio controls src={opened.audioUrl} className="w-full" />
                </div>
              )}
              {opened.text ? (
                <p className="whitespace-pre-wrap font-display text-ld-body-md leading-relaxed text-ld-on-surface">{opened.text}</p>
              ) : (
                <p className="text-ld-body-sm italic text-ld-on-surface-variant">No written words, only a voice note.</p>
              )}
            </div>
            {opened.isMine && (
              <footer className="flex justify-end border-t border-ld-on-surface/10 px-6 py-4">
                <button
                  type="button"
                  onClick={() => removeConfession(opened.id)}
                  className="inline-flex h-10 items-center gap-2 rounded-full px-4 text-ld-label-sm text-ld-error hover:bg-ld-error-container/40"
                >
                  <Trash2 className="size-4" aria-hidden="true" />
                  Delete confession
                </button>
              </footer>
            )}
          </article>
        </div>
      )}

      {writing && (
        <ConfessionWriter partnerName={partnerName} onClose={() => setWriting(false)} onSaved={saved} />
      )}

      {dialog}
    </div>
  );
}
