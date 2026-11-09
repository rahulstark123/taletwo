"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { CalendarClock, Check, Heart, Send, X } from "lucide-react";
import { LetterPaper, PAPER_STYLES } from "@/components/letters/letter-paper";
import { SelectChevron } from "@/components/auth/form-field";
import { LETTER_OCCASIONS, LETTER_TEMPLATES, type LetterFixture, type PaperStyle } from "@/fixtures/dev-letters";
import { cn } from "@/lib/utils";

export const LETTER_TITLE_MAX = 80;
export const LETTER_BODY_MAX = 2000;

export type Delivery = "now" | "schedule" | "draft";

export interface LetterDraftInput {
  title: string;
  body: string;
  occasion: string;
  paper: PaperStyle;
  delivery: Delivery;
  /** ISO time for scheduled letters. */
  opensAt: string | null;
}

interface WriteLetterModalProps {
  open: boolean;
  partnerName: string;
  initial?: LetterFixture | null;
  onClose: () => void;
  onSave: (input: LetterDraftInput) => void;
}

/** Local date-time string for <input type="datetime-local"> in the user's timezone. */
function toLocalInput(date: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function quickDates() {
  const now = new Date();
  const tomorrow9 = new Date(now);
  tomorrow9.setDate(now.getDate() + 1);
  tomorrow9.setHours(9, 0, 0, 0);
  const weekend = new Date(now);
  const daysToSat = (6 - now.getDay() + 7) % 7 || 7;
  weekend.setDate(now.getDate() + daysToSat);
  weekend.setHours(10, 0, 0, 0);
  const nextWeek = new Date(now);
  nextWeek.setDate(now.getDate() + 7);
  nextWeek.setHours(9, 0, 0, 0);
  return [
    { label: "Tomorrow, 9 am", at: tomorrow9 },
    { label: "This Saturday", at: weekend },
    { label: "Next week", at: nextWeek },
  ];
}

const DELIVERY: { key: Delivery; label: string; hint: string; icon: typeof Send }[] = [
  { key: "now", label: "Send now", hint: "Ready to open straight away", icon: Send },
  { key: "schedule", label: "Schedule", hint: "Stays sealed until its day", icon: CalendarClock },
  { key: "draft", label: "Keep as draft", hint: "Only you can see it", icon: Heart },
];

/**
 * Write a letter. Options: templates, occasion, paper, delivery (now, scheduled or draft), and a live
 * preview of the sheet as it will look. Esc closes, Ctrl/Cmd+Enter saves, unsaved work asks first.
 */
export function WriteLetterModal({ open, partnerName, initial, onClose, onSave }: WriteLetterModalProps) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const firstRef = useRef<HTMLInputElement>(null);
  const start = useMemo(() => initialState(initial), [initial]);
  const [title, setTitle] = useState(start.title);
  const [body, setBody] = useState(start.body);
  const [occasion, setOccasion] = useState(start.occasion);
  const [paper, setPaper] = useState<PaperStyle>(start.paper);
  const [delivery, setDelivery] = useState<Delivery>(start.delivery);
  const [when, setWhen] = useState(start.when);
  const [error, setError] = useState<string | null>(null);
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const [templateKey, setTemplateKey] = useState<string | null>(null);
  // Captured when the modal mounts (the parent remounts it for every opening), so renders stay pure.
  const [mountedAt] = useState(() => Date.now());

  const dirty = title !== start.title || body !== start.body || occasion !== start.occasion || paper !== start.paper || delivery !== start.delivery || when !== start.when;
  const whenDate = when ? new Date(when) : null;
  const scheduleInvalid = delivery === "schedule" && (!whenDate || whenDate.getTime() < mountedAt + 5 * 60_000);
  const needsBody = delivery !== "draft";
  const bodyMissing = needsBody && body.trim().length === 0;

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

  function submit() {
    if (bodyMissing) return setError("Write a few words before sending. Drafts can stay empty.");
    if (scheduleInvalid) return setError("Pick a time at least five minutes from now.");
    setError(null);
    onSave({
      title: title.trim(),
      body: body.trim(),
      occasion,
      paper,
      delivery,
      opensAt: delivery === "schedule" && whenDate ? whenDate.toISOString() : null,
    });
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
      } else if (e.key === "Tab" && dialogRef.current) {
        const items = dialogRef.current.querySelectorAll<HTMLElement>("button, input, textarea, select");
        if (!items.length) return;
        const first = items[0];
        const last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, title, body, occasion, paper, delivery, when, confirmDiscard]);

  if (!open) return null;

  const saveLabel = delivery === "now" ? "Send with love" : delivery === "schedule" ? "Schedule letter" : "Save draft";
  const previewDate = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric" }).format(new Date());

  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center sm:items-center sm:p-6">
      <button type="button" aria-label="Close and keep the letter as it is" onClick={requestClose} className="absolute inset-0 bg-ld-on-surface/30 backdrop-blur-[2px] animate-in fade-in duration-200" />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative flex max-h-[94dvh] w-full flex-col overflow-hidden rounded-t-3xl bg-ld-surface shadow-[0_24px_64px_-24px_rgba(64,56,50,0.35)] animate-in slide-in-from-bottom-4 fade-in duration-300 sm:max-w-3xl sm:rounded-3xl"
      >
        <header className="flex items-center justify-between gap-3 border-b border-ld-on-surface/10 px-6 py-4">
          <div>
            <h2 id={titleId} className="font-display text-ld-headline-md text-ld-on-surface">Write to {partnerName}</h2>
            <p className="text-ld-caption text-ld-on-surface-variant">Pick a template, a paper and when it should arrive.</p>
          </div>
          <button type="button" onClick={requestClose} aria-label="Close" className="inline-flex size-10 items-center justify-center rounded-full text-ld-on-surface-variant hover:bg-ld-on-surface/5">
            <X className="size-5" aria-hidden="true" />
          </button>
        </header>

        <div className="grid flex-1 gap-6 overflow-y-auto px-6 py-5 md:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
          {/* Options */}
          <div className="flex flex-col gap-5">
            <fieldset className="space-y-2">
              <legend className="text-ld-label-md font-medium text-ld-on-surface">Start from</legend>
              <div className="flex flex-wrap gap-2">
                {LETTER_TEMPLATES.map((t) => (
                  <button
                    key={t.key}
                    type="button"
                    aria-pressed={templateKey === t.key}
                    onClick={() => {
                      setTemplateKey(t.key);
                      setBody(t.body);
                    }}
                    className={cn(
                      "rounded-full px-3 py-1.5 text-ld-caption transition-colors",
                      templateKey === t.key ? "bg-ld-on-surface text-ld-surface" : "bg-ld-surface-container text-ld-on-surface-variant hover:bg-ld-surface-container-high"
                    )}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </fieldset>

            <div className="space-y-2">
              <label htmlFor={`${titleId}-occasion`} className="text-ld-label-md font-medium text-ld-on-surface">Occasion</label>
              <div className="relative">
                <select
                  id={`${titleId}-occasion`}
                  value={occasion}
                  onChange={(e) => setOccasion(e.target.value)}
                  className="block h-11 w-full appearance-none rounded-xl border border-ld-outline-variant bg-ld-surface-container-lowest px-4 pr-11 text-ld-body-sm text-ld-on-surface focus:border-ld-primary focus:outline-none focus:ring-2 focus:ring-ld-primary/25"
                >
                  {LETTER_OCCASIONS.map((o) => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </select>
                <SelectChevron />
              </div>
            </div>

            <fieldset className="space-y-2">
              <legend className="text-ld-label-md font-medium text-ld-on-surface">Paper</legend>
              <div role="radiogroup" className="flex gap-3">
                {(Object.keys(PAPER_STYLES) as PaperStyle[]).map((p) => (
                  <button
                    key={p}
                    type="button"
                    role="radio"
                    aria-checked={paper === p}
                    aria-label={PAPER_STYLES[p].label}
                    onClick={() => setPaper(p)}
                    className={cn("relative size-10 rounded-full ring-1 ring-ld-on-surface/15 transition-transform hover:scale-110", PAPER_STYLES[p].swatch, paper === p && "ring-2 ring-ld-primary")}
                  >
                    {paper === p && <Check className="absolute inset-0 m-auto size-4 text-ld-on-surface" aria-hidden="true" />}
                  </button>
                ))}
              </div>
            </fieldset>

            <div className="space-y-2">
              <label htmlFor={`${titleId}-title`} className="text-ld-label-md font-medium text-ld-on-surface">Title (optional)</label>
              <input
                id={`${titleId}-title`}
                ref={firstRef}
                type="text"
                value={title}
                maxLength={LETTER_TITLE_MAX}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="For a rainy Tuesday…"
                className="h-11 w-full rounded-xl border border-ld-outline-variant bg-ld-surface-container-lowest px-4 text-ld-body-sm text-ld-on-surface placeholder:text-ld-outline focus:border-ld-primary focus:outline-none focus:ring-2 focus:ring-ld-primary/25"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor={`${titleId}-body`} className="flex items-center justify-between text-ld-label-md font-medium text-ld-on-surface">
                Your letter
                <span className={cn("text-ld-caption tabular-nums", body.length > LETTER_BODY_MAX * 0.9 ? "text-ld-error" : "text-ld-on-surface-variant")}>
                  {body.length} / {LETTER_BODY_MAX}
                </span>
              </label>
              <textarea
                id={`${titleId}-body`}
                value={body}
                maxLength={LETTER_BODY_MAX}
                rows={6}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Dear you…"
                aria-invalid={!!error && bodyMissing}
                className="w-full resize-none rounded-xl border border-ld-outline-variant bg-ld-surface-container-lowest px-4 py-3 font-display text-ld-body-md leading-relaxed text-ld-on-surface placeholder:text-ld-outline focus:border-ld-primary focus:outline-none focus:ring-2 focus:ring-ld-primary/25"
              />
            </div>

            <fieldset className="space-y-2">
              <legend className="text-ld-label-md font-medium text-ld-on-surface">Delivery</legend>
              <div role="radiogroup" className="grid grid-cols-3 gap-2">
                {DELIVERY.map((d) => {
                  const active = delivery === d.key;
                  return (
                    <button
                      key={d.key}
                      type="button"
                      role="radio"
                      aria-checked={active}
                      onClick={() => {
                        setDelivery(d.key);
                        if (d.key === "schedule" && !when) setWhen(toLocalInput(quickDates()[0].at));
                      }}
                      className={cn(
                        "flex flex-col items-start gap-1 rounded-2xl border p-3 text-left transition-colors",
                        active ? "border-ld-primary bg-ld-secondary-container/40" : "border-ld-outline-variant hover:bg-ld-surface-container-low"
                      )}
                    >
                      <d.icon className={cn("size-4", active ? "text-ld-primary" : "text-ld-on-surface-variant")} aria-hidden="true" />
                      <span className="text-ld-label-sm font-semibold text-ld-on-surface">{d.label}</span>
                      <span className="text-[11px] leading-tight text-ld-on-surface-variant">{d.hint}</span>
                    </button>
                  );
                })}
              </div>
            </fieldset>

            {delivery === "schedule" && (
              <div className="space-y-3 rounded-2xl bg-ld-surface-container-low p-4">
                <div className="flex flex-wrap gap-2">
                  {quickDates().map((q) => (
                    <button key={q.label} type="button" onClick={() => setWhen(toLocalInput(q.at))} className="rounded-full bg-ld-surface-container-lowest px-3 py-1.5 text-ld-caption text-ld-on-surface shadow-sm hover:bg-ld-surface">
                      {q.label}
                    </button>
                  ))}
                </div>
                <label htmlFor={`${titleId}-when`} className="sr-only">Open on</label>
                <input
                  id={`${titleId}-when`}
                  type="datetime-local"
                  value={when}
                  min={toLocalInput(new Date(mountedAt + 5 * 60_000))}
                  onChange={(e) => setWhen(e.target.value)}
                  className="h-11 w-full rounded-xl border border-ld-outline-variant bg-ld-surface-container-lowest px-4 text-ld-body-sm text-ld-on-surface focus:border-ld-primary focus:outline-none focus:ring-2 focus:ring-ld-primary/25"
                />
                <p className="text-ld-caption text-ld-on-surface-variant">
                  {scheduleInvalid ? "Pick a time at least five minutes from now." : `${partnerName} will see a sealed envelope until then.`}
                </p>
              </div>
            )}
          </div>

          {/* Live preview */}
          <div className="flex flex-col gap-3">
            <p className="text-ld-label-md font-medium text-ld-on-surface">Preview</p>
            <div className="origin-top scale-[0.92] md:scale-100">
              <LetterPaper
                title={title}
                body={body}
                from="You"
                dateLabel={previewDate}
                paper={paper}
                occasion={occasion}
                placeholder="Start writing and watch the paper fill up…"
              />
            </div>
          </div>
        </div>

        {error && (
          <p role="alert" className="absolute inset-x-4 bottom-20 z-20 rounded-xl bg-ld-error-container px-4 py-2 text-ld-caption text-ld-on-error-container shadow-lg sm:inset-x-6">
            {error}
          </p>
        )}
        {confirmDiscard && (
          <div role="alertdialog" aria-label="Discard this letter?" className="absolute inset-x-4 bottom-20 z-20 flex flex-col gap-3 rounded-2xl bg-ld-surface-container-highest p-4 text-ld-body-sm text-ld-on-surface shadow-[0_16px_40px_-12px_rgba(33,26,21,0.45)] ring-1 ring-ld-on-surface/10 sm:inset-x-6 sm:flex-row sm:items-center sm:justify-between">
            <span>Close without saving? Your words will be lost.</span>
            <div className="flex gap-2">
              <button type="button" onClick={() => setConfirmDiscard(false)} className="rounded-full px-4 py-2 text-ld-label-sm hover:bg-ld-on-surface/5">Keep writing</button>
              <button type="button" onClick={onClose} className="rounded-full bg-ld-error px-4 py-2 text-ld-label-sm text-white">Discard</button>
            </div>
          </div>
        )}

        <footer className="flex items-center justify-between gap-3 border-t border-ld-on-surface/10 px-6 py-4">
          <span className="hidden text-ld-caption text-ld-on-surface-variant sm:inline">Ctrl + Enter to {delivery === "draft" ? "save" : "send"}</span>
          <button
            type="button"
            onClick={submit}
            disabled={bodyMissing || scheduleInvalid}
            className="ml-auto inline-flex h-11 items-center gap-2 rounded-full bg-ld-primary px-6 text-ld-label-md text-ld-on-primary shadow-[0_8px_20px_rgba(201,126,139,0.28)] transition-colors hover:bg-ld-on-primary-fixed-variant disabled:opacity-50"
          >
            {saveLabel}
          </button>
        </footer>
      </div>
    </div>
  );
}

function initialState(initial?: LetterFixture | null) {
  if (!initial) {
    return { title: "", body: "", occasion: LETTER_OCCASIONS[0] as string, paper: "CREAM" as PaperStyle, delivery: "now" as Delivery, when: "" };
  }
  return {
    title: initial.title,
    body: initial.body,
    occasion: initial.occasion,
    paper: initial.paper,
    delivery: (initial.kind === "draft" ? "draft" : initial.kind === "scheduled" ? "schedule" : "now") as Delivery,
    when: initial.opensAt ? toLocalInput(new Date(initial.opensAt)) : "",
  };
}
