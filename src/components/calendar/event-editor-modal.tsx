"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Trash2, X } from "lucide-react";
import { REMINDER_LABEL } from "@/components/special-days/special-day-kinds";
import { REMINDER_OPTIONS, type ReminderValue } from "@/lib/special-days-types";
import { CALENDAR_EVENT_KINDS, type CalendarEventDTO, type CalendarEventKindValue } from "@/lib/calendar-types";
import { KIND_LOOK } from "@/components/calendar/calendar-kinds";
import { cn } from "@/lib/utils";

export interface EventDraft {
  title: string;
  description: string;
  kind: CalendarEventKindValue;
  allDay: boolean;
  startsAt: string; // ISO for timed events, YYYY-MM-DD for all-day
  endsAt: string | null;
  location: string;
  reminder: ReminderValue;
}

interface EventEditorModalProps {
  open: boolean;
  event: CalendarEventDTO | null;
  defaultDate: string | null; // YYYY-MM-DD when adding from a day
  onClose: () => void;
  onSave: (draft: EventDraft) => Promise<void>;
  onDelete: () => Promise<void>;
}

const EVENT_KINDS = CALENDAR_EVENT_KINDS;

function toLocalInput(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function initial(event: CalendarEventDTO | null, defaultDate: string | null): {
  title: string;
  description: string;
  kind: CalendarEventKindValue;
  allDay: boolean;
  start: string;
  end: string;
  location: string;
  reminder: ReminderValue;
} {
  if (event) {
    return {
      title: event.title,
      description: event.description,
      kind: event.kind,
      allDay: event.allDay,
      start: event.allDay ? event.startsAt.slice(0, 10) : toLocalInput(event.startsAt),
      end: event.endsAt ? toLocalInput(event.endsAt) : "",
      location: event.location,
      reminder: event.reminder as ReminderValue,
    };
  }
  const day = defaultDate ?? new Date().toISOString().slice(0, 10);
  return { title: "", description: "", kind: "DATE_NIGHT", allDay: false, start: `${day}T19:00`, end: "", location: "", reminder: "NONE" };
}

/** Add or edit a calendar event. Esc closes, Ctrl/Cmd+Enter saves. */
export function EventEditorModal({ open, event, defaultDate, onClose, onSave, onDelete }: EventEditorModalProps) {
  const titleId = useId();
  const firstRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState(() => initial(event, defaultDate));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

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
    if (form.title.trim().length < 2) return setError("Give the event a short title.");
    if (!form.start) return setError("Choose a date and time.");
    if (form.end && form.end < form.start) return setError("The end time must be after the start.");
    setSaving(true);
    setError(null);
    try {
      await onSave({
        title: form.title.trim(),
        description: form.description.trim(),
        kind: form.kind,
        allDay: form.allDay,
        startsAt: form.allDay ? form.start.slice(0, 10) : new Date(form.start).toISOString(),
        endsAt: !form.allDay && form.end ? new Date(form.end).toISOString() : null,
        location: form.location.trim(),
        reminder: form.reminder,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save this event. Please try again.");
    }
    setSaving(false);
  }

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      else if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        submit();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, form, saving]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center sm:items-center sm:p-6">
      <button type="button" aria-label="Close without saving" onClick={onClose} className="absolute inset-0 bg-ld-on-surface/30 backdrop-blur-[2px] animate-in fade-in duration-200" />
      <div role="dialog" aria-modal="true" aria-labelledby={titleId} className="relative flex max-h-[94dvh] w-full flex-col overflow-hidden rounded-t-3xl bg-ld-surface shadow-[0_24px_64px_-24px_rgba(64,56,50,0.35)] animate-in slide-in-from-bottom-4 fade-in duration-300 sm:max-w-lg sm:rounded-3xl">
        <header className="flex items-center justify-between gap-3 border-b border-ld-on-surface/10 px-6 py-4">
          <h2 id={titleId} className="font-display text-ld-headline-md text-ld-on-surface">{event ? "Edit event" : "Add to the calendar"}</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="inline-flex size-10 items-center justify-center rounded-full text-ld-on-surface-variant hover:bg-ld-on-surface/5">
            <X className="size-5" aria-hidden="true" />
          </button>
        </header>

        <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-6 py-5">
          <fieldset className="space-y-2">
            <legend className="text-ld-label-md font-medium text-ld-on-surface">Kind</legend>
            <div role="radiogroup" className="flex flex-wrap gap-2">
              {EVENT_KINDS.map((k) => {
                const look = KIND_LOOK[k];
                const active = form.kind === k;
                return (
                  <button key={k} type="button" role="radio" aria-checked={active} onClick={() => setForm((f) => ({ ...f, kind: k }))} className={cn("inline-flex h-9 items-center gap-1.5 rounded-full px-3.5 text-ld-label-sm transition-all", active ? "bg-ld-on-surface text-ld-surface" : "bg-ld-surface-container text-ld-on-surface-variant hover:bg-ld-surface-container-high")}>
                    <look.icon className="size-3.5" aria-hidden="true" />
                    {look.label}
                  </button>
                );
              })}
            </div>
          </fieldset>

          <div className="space-y-2">
            <label htmlFor={`${titleId}-title`} className="text-ld-label-md font-medium text-ld-on-surface">Title</label>
            <input id={`${titleId}-title`} ref={firstRef} type="text" value={form.title} maxLength={120} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Dinner at the rooftop, call mum…" className="h-12 w-full rounded-xl border border-ld-outline-variant bg-ld-surface-container-lowest px-4 font-display text-ld-title-lg text-ld-on-surface placeholder:text-ld-outline focus:border-ld-primary focus:outline-none focus:ring-2 focus:ring-ld-primary/25" />
          </div>

          <button type="button" role="switch" aria-checked={form.allDay} onClick={() => setForm((f) => ({ ...f, allDay: !f.allDay, start: f.allDay ? `${f.start.slice(0, 10)}T19:00` : f.start.slice(0, 10), end: "" }))} className={cn("flex h-11 w-full items-center justify-between rounded-xl border px-4 text-ld-body-sm transition-colors", form.allDay ? "border-ld-primary bg-ld-secondary-container/30" : "border-ld-outline-variant")}>
            <span className="text-ld-on-surface">All day</span>
            <span className={cn("relative inline-flex h-6 w-11 rounded-full transition-colors", form.allDay ? "bg-ld-primary" : "bg-ld-outline-variant")}>
              <span className={cn("absolute top-0.5 size-5 rounded-full bg-white shadow transition-transform", form.allDay ? "translate-x-5" : "translate-x-0.5")} />
            </span>
          </button>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor={`${titleId}-start`} className="text-ld-label-md font-medium text-ld-on-surface">Starts</label>
              <input id={`${titleId}-start`} type={form.allDay ? "date" : "datetime-local"} value={form.start} onChange={(e) => setForm((f) => ({ ...f, start: e.target.value }))} className="h-11 w-full rounded-xl border border-ld-outline-variant bg-ld-surface-container-lowest px-4 text-ld-body-sm text-ld-on-surface focus:border-ld-primary focus:outline-none focus:ring-2 focus:ring-ld-primary/25" />
            </div>
            {!form.allDay && (
              <div className="space-y-2">
                <label htmlFor={`${titleId}-end`} className="text-ld-label-md font-medium text-ld-on-surface">Ends (optional)</label>
                <input id={`${titleId}-end`} type="datetime-local" value={form.end} onChange={(e) => setForm((f) => ({ ...f, end: e.target.value }))} className="h-11 w-full rounded-xl border border-ld-outline-variant bg-ld-surface-container-lowest px-4 text-ld-body-sm text-ld-on-surface focus:border-ld-primary focus:outline-none focus:ring-2 focus:ring-ld-primary/25" />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor={`${titleId}-where`} className="text-ld-label-md font-medium text-ld-on-surface">Where (optional)</label>
            <input id={`${titleId}-where`} type="text" value={form.location} maxLength={120} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} className="h-11 w-full rounded-xl border border-ld-outline-variant bg-ld-surface-container-lowest px-4 text-ld-body-sm text-ld-on-surface focus:border-ld-primary focus:outline-none focus:ring-2 focus:ring-ld-primary/25" />
          </div>

          <fieldset className="space-y-2">
            <legend className="text-ld-label-md font-medium text-ld-on-surface">Remind us</legend>
            <div role="radiogroup" className="flex flex-wrap gap-2">
              {REMINDER_OPTIONS.map((r) => (
                <button key={r} type="button" role="radio" aria-checked={form.reminder === r} onClick={() => setForm((f) => ({ ...f, reminder: r }))} className={cn("h-9 rounded-full px-3.5 text-ld-label-sm transition-all", form.reminder === r ? "bg-ld-on-surface text-ld-surface" : "bg-ld-surface-container text-ld-on-surface-variant hover:bg-ld-surface-container-high")}>
                  {REMINDER_LABEL[r]}
                </button>
              ))}
            </div>
          </fieldset>

          <div className="space-y-2">
            <label htmlFor={`${titleId}-desc`} className="text-ld-label-md font-medium text-ld-on-surface">Notes</label>
            <textarea id={`${titleId}-desc`} rows={3} maxLength={2000} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} className="w-full resize-none rounded-xl border border-ld-outline-variant bg-ld-surface-container-lowest px-4 py-3 text-ld-body-sm text-ld-on-surface placeholder:text-ld-outline focus:border-ld-primary focus:outline-none focus:ring-2 focus:ring-ld-primary/25" />
          </div>

          {confirmDelete && (
            <div role="alertdialog" aria-label="Delete this event?" className="flex flex-col gap-3 rounded-2xl bg-ld-surface-container px-4 py-3 text-ld-body-sm text-ld-on-surface sm:flex-row sm:items-center sm:justify-between">
              <span>Delete this event from the calendar?</span>
              <div className="flex gap-2">
                <button type="button" onClick={() => setConfirmDelete(false)} className="rounded-full px-4 py-2 text-ld-label-sm hover:bg-ld-on-surface/5">Keep it</button>
                <button type="button" onClick={async () => { setSaving(true); try { await onDelete(); } catch (e) { setError(e instanceof Error ? e.message : "Could not delete."); setSaving(false); } }} className="rounded-full bg-ld-error px-4 py-2 text-ld-label-sm text-ld-on-error">Delete</button>
              </div>
            </div>
          )}
          {error && <p role="alert" className="rounded-xl bg-ld-error-container px-4 py-2 text-ld-caption text-ld-on-error-container">{error}</p>}
        </div>

        <footer className="flex items-center justify-between gap-3 border-t border-ld-on-surface/10 px-6 py-4">
          {event && event.isMine ? (
            <button type="button" onClick={() => setConfirmDelete(true)} className="inline-flex h-11 items-center gap-2 rounded-full px-4 text-ld-label-sm text-ld-on-surface-variant hover:bg-ld-error/10 hover:text-ld-error">
              <Trash2 className="size-4" aria-hidden="true" />
              Delete
            </button>
          ) : <span />}
          <button type="button" onClick={submit} disabled={saving} className="inline-flex h-11 items-center gap-2 rounded-full bg-ld-primary px-6 text-ld-label-md text-ld-on-primary shadow-[0_8px_20px_rgba(201,126,139,0.28)] transition-colors hover:bg-ld-on-primary-fixed-variant disabled:opacity-50">
            {saving ? "Saving…" : event ? "Save changes" : "Add event"}
          </button>
        </footer>
      </div>
    </div>
  );
}
