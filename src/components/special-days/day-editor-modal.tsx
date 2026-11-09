"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Bell, X } from "lucide-react";
import { KIND_ORDER, KIND_STYLES, REMINDER_LABEL } from "@/components/special-days/special-day-kinds";
import { daysUntil, nextDate, relativeDays, shortDate } from "@/components/special-days/day-math";
import { REMINDER_OPTIONS, type ReminderValue, type SpecialDayDTO, type SpecialDayKindValue } from "@/lib/special-days-types";
import { cn } from "@/lib/utils";

export interface DayDraft {
  title: string;
  kind: SpecialDayKindValue;
  eventDate: string;
  repeatsYearly: boolean;
  reminder: ReminderValue;
  notes: string;
}

interface DayEditorModalProps {
  open: boolean;
  day: SpecialDayDTO | null;
  timezone: string;
  now: number;
  onClose: () => void;
  onSave: (draft: DayDraft) => Promise<void>;
}

const todayIso = () => new Date().toISOString().slice(0, 10);

/**
 * Add or edit a special day. The preview shows when it next lands, so the choice of "repeats every year"
 * is clear before saving. Esc closes, Ctrl/Cmd+Enter saves.
 */
export function DayEditorModal({ open, day, timezone, now, onClose, onSave }: DayEditorModalProps) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const firstRef = useRef<HTMLInputElement>(null);
  const [draft, setDraft] = useState<DayDraft>(() => initial(day));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const valid = draft.title.trim().length >= 2 && draft.eventDate.length === 10 && draft.eventDate <= "2100-12-31";

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

  async function submit() {
    if (!valid) return setError("Give this day a name and a date.");
    setSaving(true);
    setError(null);
    try {
      await onSave({ ...draft, title: draft.title.trim(), notes: draft.notes.trim() });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save this day. Please try again.");
    }
    setSaving(false);
  }

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        submit();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, draft, saving]);

  if (!open) return null;

  // Preview: where this day lands next, using the same rules as the list.
  const preview = (() => {
    if (!valid || !now) return null;
    const previewDay: SpecialDayDTO = { id: "p", title: draft.title, kind: draft.kind, eventDate: draft.eventDate, repeatsYearly: draft.repeatsYearly, reminder: draft.reminder, notes: "", createdById: "", createdByName: "", isMine: true, createdAt: "", updatedAt: "" };
    const n = daysUntil(previewDay, now, timezone);
    return { date: shortDate(nextDate(previewDay, now, timezone)), label: relativeDays(n), past: n < 0 };
  })();

  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center sm:items-center sm:p-6">
      <button type="button" aria-label="Close without saving" onClick={onClose} className="absolute inset-0 bg-ld-on-surface/30 backdrop-blur-[2px] animate-in fade-in duration-200" />
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby={titleId} className="relative flex max-h-[94dvh] w-full flex-col overflow-hidden rounded-t-3xl bg-ld-surface shadow-[0_24px_64px_-24px_rgba(64,56,50,0.35)] animate-in slide-in-from-bottom-4 fade-in duration-300 sm:max-w-xl sm:rounded-3xl">
        <header className="flex items-center justify-between gap-3 border-b border-ld-on-surface/10 px-6 py-4">
          <div>
            <h2 id={titleId} className="font-display text-ld-headline-md text-ld-on-surface">{day ? "Edit this day" : "Mark a special day"}</h2>
            <p className="text-ld-caption text-ld-on-surface-variant">{KIND_STYLES[draft.kind].hint}</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="inline-flex size-10 items-center justify-center rounded-full text-ld-on-surface-variant hover:bg-ld-on-surface/5">
            <X className="size-5" aria-hidden="true" />
          </button>
        </header>

        <div className="flex flex-1 flex-col gap-6 overflow-y-auto px-6 py-5">
          <fieldset className="space-y-2">
            <legend className="text-ld-label-md font-medium text-ld-on-surface">What kind of day?</legend>
            <div role="radiogroup" className="grid grid-cols-3 gap-2">
              {KIND_ORDER.map((k) => {
                const s = KIND_STYLES[k];
                const active = draft.kind === k;
                return (
                  <button key={k} type="button" role="radio" aria-checked={active} onClick={() => setDraft((d) => ({ ...d, kind: k }))} className={cn("flex flex-col items-center gap-1.5 rounded-2xl border p-3 text-center transition-colors", active ? "border-ld-primary bg-ld-secondary-container/40" : "border-ld-outline-variant hover:bg-ld-surface-container-low")}>
                    <s.icon className={cn("size-5", active ? "text-ld-primary" : "text-ld-on-surface-variant")} aria-hidden="true" />
                    <span className="text-[11px] leading-tight text-ld-on-surface">{s.short}</span>
                  </button>
                );
              })}
            </div>
          </fieldset>

          <div className="space-y-2">
            <label htmlFor={`${titleId}-title`} className="text-ld-label-md font-medium text-ld-on-surface">Name</label>
            <input
              id={`${titleId}-title`}
              ref={firstRef}
              type="text"
              value={draft.title}
              maxLength={120}
              onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
              placeholder={draft.kind === "BIRTHDAY" ? "Simran's birthday" : "The day we met at the library"}
              className="h-12 w-full rounded-xl border border-ld-outline-variant bg-ld-surface-container-lowest px-4 font-display text-ld-title-lg text-ld-on-surface placeholder:text-ld-outline focus:border-ld-primary focus:outline-none focus:ring-2 focus:ring-ld-primary/25"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor={`${titleId}-date`} className="text-ld-label-md font-medium text-ld-on-surface">Date</label>
              <input
                id={`${titleId}-date`}
                type="date"
                value={draft.eventDate}
                min="1900-01-01"
                max="2100-12-31"
                onChange={(e) => setDraft((d) => ({ ...d, eventDate: e.target.value }))}
                className="h-11 w-full rounded-xl border border-ld-outline-variant bg-ld-surface-container-lowest px-4 text-ld-body-sm text-ld-on-surface focus:border-ld-primary focus:outline-none focus:ring-2 focus:ring-ld-primary/25"
              />
            </div>
            <div className="space-y-2">
              <span className="text-ld-label-md font-medium text-ld-on-surface">Repeats</span>
              <button
                type="button"
                role="switch"
                aria-checked={draft.repeatsYearly}
                onClick={() => setDraft((d) => ({ ...d, repeatsYearly: !d.repeatsYearly }))}
                className={cn("flex h-11 w-full items-center justify-between rounded-xl border px-4 text-ld-body-sm transition-colors", draft.repeatsYearly ? "border-ld-primary bg-ld-secondary-container/30" : "border-ld-outline-variant")}
              >
                <span className="text-ld-on-surface">Every year</span>
                <span className={cn("relative inline-flex h-6 w-11 rounded-full transition-colors", draft.repeatsYearly ? "bg-ld-primary" : "bg-ld-outline-variant")}>
                  <span className={cn("absolute top-0.5 size-5 rounded-full bg-white shadow transition-transform", draft.repeatsYearly ? "translate-x-5" : "translate-x-0.5")} />
                </span>
              </button>
            </div>
          </div>

          {preview && (
            <p className="rounded-2xl bg-ld-surface-container-low px-4 py-3 text-ld-body-sm text-ld-on-surface">
              Next time: <span className="font-semibold">{preview.date}</span> · {preview.label}
            </p>
          )}

          <fieldset className="space-y-2">
            <legend className="flex items-center gap-2 text-ld-label-md font-medium text-ld-on-surface">
              <Bell className="size-4 text-ld-primary" aria-hidden="true" />
              Remind us
            </legend>
            <div role="radiogroup" className="flex flex-wrap gap-2">
              {REMINDER_OPTIONS.map((r) => (
                <button key={r} type="button" role="radio" aria-checked={draft.reminder === r} onClick={() => setDraft((d) => ({ ...d, reminder: r }))} className={cn("h-9 rounded-full px-3.5 text-ld-label-sm transition-all", draft.reminder === r ? "bg-ld-on-surface text-ld-surface" : "bg-ld-surface-container text-ld-on-surface-variant hover:bg-ld-surface-container-high")}>
                  {REMINDER_LABEL[r]}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-ld-outline">Reminders are saved with the day. Sending them starts with the notifications feature.</p>
          </fieldset>

          <div className="space-y-2">
            <label htmlFor={`${titleId}-notes`} className="text-ld-label-md font-medium text-ld-on-surface">Notes (optional)</label>
            <textarea
              id={`${titleId}-notes`}
              rows={3}
              maxLength={1000}
              value={draft.notes}
              onChange={(e) => setDraft((d) => ({ ...d, notes: e.target.value }))}
              placeholder="A gift idea, a place to celebrate, what this day means…"
              className="w-full resize-none rounded-xl border border-ld-outline-variant bg-ld-surface-container-lowest px-4 py-3 text-ld-body-sm text-ld-on-surface placeholder:text-ld-outline focus:border-ld-primary focus:outline-none focus:ring-2 focus:ring-ld-primary/25"
            />
          </div>
        </div>

        {error && <p role="alert" className="absolute inset-x-4 bottom-20 z-20 rounded-xl bg-ld-error-container px-4 py-2 text-ld-caption text-ld-on-error-container shadow-lg">{error}</p>}

        <footer className="flex items-center justify-between gap-3 border-t border-ld-on-surface/10 px-6 py-4">
          <span className="hidden text-ld-caption text-ld-on-surface-variant sm:inline">Ctrl + Enter to save</span>
          <button type="button" onClick={submit} disabled={saving || !valid} className="ml-auto inline-flex h-11 items-center gap-2 rounded-full bg-ld-primary px-6 text-ld-label-md text-ld-on-primary shadow-[0_8px_20px_rgba(201,126,139,0.28)] transition-colors hover:bg-ld-on-primary-fixed-variant disabled:opacity-50">
            {saving ? "Saving…" : day ? "Save changes" : "Save day"}
          </button>
        </footer>
      </div>
    </div>
  );
}

function initial(day: SpecialDayDTO | null): DayDraft {
  if (!day) return { title: "", kind: "RELATIONSHIP_ANNIVERSARY", eventDate: todayIso(), repeatsYearly: true, reminder: "WEEK_BEFORE", notes: "" };
  return { title: day.title, kind: day.kind, eventDate: day.eventDate, repeatsYearly: day.repeatsYearly, reminder: day.reminder, notes: day.notes };
}
