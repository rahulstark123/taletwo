"use client";

import { useEffect, useId, useState } from "react";
import { Heart, RotateCcw, X } from "lucide-react";
import type { BucketItemDTO } from "@/lib/bucket-types";
import { cn } from "@/lib/utils";

interface BucketCompleteModalProps {
  open: boolean;
  item: BucketItemDTO | null;
  onClose: () => void;
  onComplete: (input: { completedOn: string; completionMemory: string }) => Promise<void>;
  onUndo: () => Promise<void>;
}

const todayIso = () => new Date().toISOString().slice(0, 10);

/**
 * Ticking off a dream is the moment to remember it. Asks when it happened and how it went.
 * Opened fresh each time (the parent keys it by item), so the form never shows stale text.
 */
export function BucketCompleteModal({ open, item, onClose, onComplete, onUndo }: BucketCompleteModalProps) {
  const titleId = useId();
  const [when, setWhen] = useState(() => item?.completedAt?.slice(0, 10) ?? todayIso());
  const [memory, setMemory] = useState(() => item?.completionMemory ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open || !item) return null;
  const alreadyDone = item.completedAt !== null;

  async function run(action: () => Promise<void>) {
    setSaving(true);
    setError(null);
    try {
      await action();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center sm:items-center sm:p-6">
      <button type="button" aria-label="Close" onClick={onClose} className="absolute inset-0 bg-ld-on-surface/30 backdrop-blur-[2px] animate-in fade-in duration-200" />
      <div role="dialog" aria-modal="true" aria-labelledby={titleId} className="relative w-full overflow-hidden rounded-t-3xl bg-ld-surface-container-lowest p-6 shadow-[0_24px_64px_-24px_rgba(64,56,50,0.35)] animate-in slide-in-from-bottom-4 duration-300 sm:max-w-md sm:rounded-3xl">
        <button type="button" onClick={onClose} aria-label="Close" className="absolute right-4 top-4 inline-flex size-9 items-center justify-center rounded-full text-ld-on-surface-variant hover:bg-ld-on-surface/5">
          <X className="size-4" aria-hidden="true" />
        </button>

        <div className="flex flex-col items-center gap-3 text-center">
          <span className="flex size-14 items-center justify-center rounded-full bg-ld-secondary-container/50 text-ld-primary">
            <Heart className="size-6 fill-ld-primary" aria-hidden="true" />
          </span>
          <h2 id={titleId} className="font-display text-ld-headline-md text-ld-on-surface">{alreadyDone ? "Edit the memory" : "You did it. How was it?"}</h2>
          <p className="max-w-xs text-ld-body-sm text-ld-on-surface-variant">&ldquo;{item.title}&rdquo;</p>
        </div>

        <form
          noValidate
          className="mt-6 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (!when) return setError("Pick the day it happened.");
            run(async () => {
              await onComplete({ completedOn: when, completionMemory: memory.trim() });
            });
          }}
        >
          <div className="space-y-2">
            <label htmlFor={`${titleId}-when`} className="text-ld-label-md font-medium text-ld-on-surface">The day it happened</label>
            <input
              id={`${titleId}-when`}
              type="date"
              value={when}
              max={todayIso()}
              onChange={(e) => setWhen(e.target.value)}
              className="h-11 w-full rounded-xl border border-ld-outline-variant bg-ld-surface px-4 text-ld-body-sm text-ld-on-surface focus:border-ld-primary focus:outline-none focus:ring-2 focus:ring-ld-primary/25"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor={`${titleId}-memory`} className="text-ld-label-md font-medium text-ld-on-surface">A memory from it (optional)</label>
            <textarea
              id={`${titleId}-memory`}
              rows={4}
              maxLength={2000}
              value={memory}
              onChange={(e) => setMemory(e.target.value)}
              placeholder="The cold air, the stars, the way you laughed when…"
              className="w-full resize-none rounded-xl border border-ld-outline-variant bg-ld-surface px-4 py-3 font-display text-ld-body-md leading-relaxed text-ld-on-surface placeholder:text-ld-outline focus:border-ld-primary focus:outline-none focus:ring-2 focus:ring-ld-primary/25"
            />
          </div>

          {error && <p role="alert" className="rounded-xl bg-ld-error-container px-4 py-2 text-ld-caption text-ld-on-error-container">{error}</p>}

          <div className="flex flex-col gap-2 pt-1 sm:flex-row sm:justify-between">
            {alreadyDone ? (
              <button
                type="button"
                disabled={saving}
                onClick={() => run(onUndo)}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-full px-4 text-ld-label-md text-ld-on-surface-variant hover:bg-ld-on-surface/5 disabled:opacity-50"
              >
                <RotateCcw className="size-4" aria-hidden="true" />
                Put back on the list
              </button>
            ) : (
              <span />
            )}
            <button type="submit" disabled={saving} className={cn("inline-flex h-11 items-center justify-center gap-2 rounded-full bg-ld-primary px-6 text-ld-label-md text-ld-on-primary shadow-[0_8px_20px_rgba(201,126,139,0.28)] transition-colors hover:bg-ld-on-primary-fixed-variant disabled:opacity-50")}>
              {saving ? "Saving…" : alreadyDone ? "Save memory" : "Mark as done"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
