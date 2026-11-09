"use client";

import { useEffect, useId, useRef, useState } from "react";
import { X } from "lucide-react";
import { CATEGORY_ORDER, CATEGORY_STYLES, PRIORITY_STYLES } from "@/components/bucket/bucket-kinds";
import type { BucketItemDTO } from "@/lib/bucket-types";
import { BUCKET_PRIORITIES, type BucketCategoryValue, type BucketPriorityValue } from "@/lib/validations/bucket";
import { cn } from "@/lib/utils";

export interface BucketDraft {
  title: string;
  description: string;
  category: BucketCategoryValue;
  priority: BucketPriorityValue;
  targetDate: string | null;
}

interface BucketEditorModalProps {
  open: boolean;
  item: BucketItemDTO | null;
  onClose: () => void;
  onSave: (draft: BucketDraft) => Promise<void>;
}

/** Add or edit a shared dream. Esc closes, Ctrl/Cmd+Enter saves, and unsaved edits ask before closing. */
export function BucketEditorModal({ open, item, onClose, onSave }: BucketEditorModalProps) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const firstRef = useRef<HTMLInputElement>(null);
  const [draft, setDraft] = useState<BucketDraft>(() => initial(item));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmDiscard, setConfirmDiscard] = useState(false);

  const dirty = JSON.stringify(draft) !== JSON.stringify(initial(item));
  const valid = draft.title.trim().length >= 2;

  useEffect(() => {
    if (open) requestAnimationFrame(() => firstRef.current?.focus());
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  function requestClose() {
    if (dirty && !confirmDiscard) return setConfirmDiscard(true);
    onClose();
  }

  async function submit() {
    if (!valid) return setError("Give this dream a short title, at least two letters.");
    setSaving(true);
    setError(null);
    try {
      await onSave({ ...draft, title: draft.title.trim(), description: draft.description.trim() });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save this dream. Please try again.");
    }
    setSaving(false);
  }

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        requestClose();
      } else if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        submit();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, draft, saving, confirmDiscard]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center sm:items-center sm:p-6">
      <button type="button" aria-label="Close without saving" onClick={requestClose} className="absolute inset-0 bg-ld-on-surface/30 backdrop-blur-[2px] animate-in fade-in duration-200" />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative flex max-h-[94dvh] w-full flex-col overflow-hidden rounded-t-3xl bg-ld-surface shadow-[0_24px_64px_-24px_rgba(64,56,50,0.35)] animate-in slide-in-from-bottom-4 fade-in duration-300 sm:max-w-xl sm:rounded-3xl"
      >
        <header className="flex items-center justify-between gap-3 border-b border-ld-on-surface/10 px-6 py-4">
          <div>
            <h2 id={titleId} className="font-display text-ld-headline-md text-ld-on-surface">{item ? "Edit this dream" : "Add a shared dream"}</h2>
            <p className="text-ld-caption text-ld-on-surface-variant">{CATEGORY_STYLES[draft.category].hint}</p>
          </div>
          <button type="button" onClick={requestClose} aria-label="Close" className="inline-flex size-10 items-center justify-center rounded-full text-ld-on-surface-variant hover:bg-ld-on-surface/5">
            <X className="size-5" aria-hidden="true" />
          </button>
        </header>

        <div className="flex flex-1 flex-col gap-6 overflow-y-auto px-6 py-5">
          <div className="space-y-2">
            <label htmlFor={`${titleId}-title`} className="text-ld-label-md font-medium text-ld-on-surface">The dream</label>
            <input
              id={`${titleId}-title`}
              ref={firstRef}
              type="text"
              value={draft.title}
              maxLength={120}
              onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
              placeholder="See the northern lights, learn to sail…"
              className="h-12 w-full rounded-xl border border-ld-outline-variant bg-ld-surface-container-lowest px-4 font-display text-ld-title-lg text-ld-on-surface placeholder:text-ld-outline focus:border-ld-primary focus:outline-none focus:ring-2 focus:ring-ld-primary/25"
            />
          </div>

          <fieldset className="space-y-2">
            <legend className="text-ld-label-md font-medium text-ld-on-surface">Category</legend>
            <div role="radiogroup" className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {CATEGORY_ORDER.map((c) => {
                const s = CATEGORY_STYLES[c];
                const active = draft.category === c;
                return (
                  <button
                    key={c}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => setDraft((d) => ({ ...d, category: c }))}
                    className={cn("flex items-center gap-2 rounded-xl border px-3 py-2.5 text-left transition-colors", active ? "border-ld-primary bg-ld-secondary-container/40" : "border-ld-outline-variant hover:bg-ld-surface-container-low")}
                  >
                    <s.icon className={cn("size-4 shrink-0", active ? "text-ld-primary" : "text-ld-on-surface-variant")} aria-hidden="true" />
                    <span className="text-ld-label-sm text-ld-on-surface">{s.label}</span>
                  </button>
                );
              })}
            </div>
          </fieldset>

          <div className="grid gap-4 sm:grid-cols-2">
            <fieldset className="space-y-2">
              <legend className="text-ld-label-md font-medium text-ld-on-surface">How much does it matter?</legend>
              <div role="radiogroup" className="flex flex-wrap gap-2">
                {BUCKET_PRIORITIES.map((p) => {
                  const active = draft.priority === p;
                  return (
                    <button
                      key={p}
                      type="button"
                      role="radio"
                      aria-checked={active}
                      onClick={() => setDraft((d) => ({ ...d, priority: p }))}
                      className={cn("h-9 rounded-full px-3.5 text-ld-label-sm transition-all", active ? PRIORITY_STYLES[p].className + " ring-2 ring-ld-primary/40" : "bg-ld-surface-container text-ld-on-surface-variant hover:bg-ld-surface-container-high")}
                    >
                      {PRIORITY_STYLES[p].label}
                    </button>
                  );
                })}
              </div>
            </fieldset>
            <div className="space-y-2">
              <label htmlFor={`${titleId}-date`} className="text-ld-label-md font-medium text-ld-on-surface">Aim for (optional)</label>
              <input
                id={`${titleId}-date`}
                type="date"
                value={draft.targetDate ?? ""}
                onChange={(e) => setDraft((d) => ({ ...d, targetDate: e.target.value || null }))}
                className="h-11 w-full rounded-xl border border-ld-outline-variant bg-ld-surface-container-lowest px-4 text-ld-body-sm text-ld-on-surface focus:border-ld-primary focus:outline-none focus:ring-2 focus:ring-ld-primary/25"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor={`${titleId}-desc`} className="text-ld-label-md font-medium text-ld-on-surface">Why it matters (optional)</label>
            <textarea
              id={`${titleId}-desc`}
              rows={3}
              maxLength={2000}
              value={draft.description}
              onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
              placeholder="The reason this one is on the list…"
              className="w-full resize-none rounded-xl border border-ld-outline-variant bg-ld-surface-container-lowest px-4 py-3 text-ld-body-sm text-ld-on-surface placeholder:text-ld-outline focus:border-ld-primary focus:outline-none focus:ring-2 focus:ring-ld-primary/25"
            />
          </div>
        </div>

        {error && <p role="alert" className="absolute inset-x-4 bottom-20 z-20 rounded-xl bg-ld-error-container px-4 py-2 text-ld-caption text-ld-on-error-container shadow-lg sm:inset-x-6">{error}</p>}
        {confirmDiscard && (
          <div role="alertdialog" aria-label="Discard changes?" className="absolute inset-x-4 bottom-20 z-20 flex flex-col gap-3 rounded-2xl bg-ld-surface-container-highest p-4 text-ld-body-sm text-ld-on-surface shadow-[0_16px_40px_-12px_rgba(33,26,21,0.45)] ring-1 ring-ld-on-surface/10 sm:inset-x-6 sm:flex-row sm:items-center sm:justify-between">
            <span>Close without saving your changes?</span>
            <div className="flex gap-2">
              <button type="button" onClick={() => setConfirmDiscard(false)} className="rounded-full px-4 py-2 text-ld-label-sm hover:bg-ld-on-surface/5">Keep editing</button>
              <button type="button" onClick={onClose} className="rounded-full bg-ld-error px-4 py-2 text-ld-label-sm text-ld-on-error">Discard</button>
            </div>
          </div>
        )}

        <footer className="flex items-center justify-between gap-3 border-t border-ld-on-surface/10 px-6 py-4">
          <span className="hidden text-ld-caption text-ld-on-surface-variant sm:inline">Ctrl + Enter to save</span>
          <button type="button" onClick={submit} disabled={saving || !valid} className="ml-auto inline-flex h-11 items-center gap-2 rounded-full bg-ld-primary px-6 text-ld-label-md text-ld-on-primary shadow-[0_8px_20px_rgba(201,126,139,0.28)] transition-colors hover:bg-ld-on-primary-fixed-variant disabled:opacity-50">
            {saving ? "Saving…" : item ? "Save changes" : "Add dream"}
          </button>
        </footer>
      </div>
    </div>
  );
}

function initial(item: BucketItemDTO | null): BucketDraft {
  if (!item) return { title: "", description: "", category: "EXPERIENCES", priority: "SOMEDAY", targetDate: null };
  return { title: item.title, description: item.description, category: item.category, priority: item.priority, targetDate: item.targetDate };
}
