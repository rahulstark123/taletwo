"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Check, Plus, Trash2, X } from "lucide-react";
import { AUDIENCE_LABEL, KIND_ORDER, KIND_STYLES, STATUS_LABEL } from "@/components/plans/plan-kinds";
import type { ChecklistItem, PlanDTO } from "@/lib/plans-types";
import type { PlanAudienceValue, PlanKindValue, PlanStatusValue } from "@/lib/validations/plans";
import { currencySymbol } from "@/lib/locale";
import { cn } from "@/lib/utils";

export interface PlanDraft {
  title: string;
  description: string;
  kind: PlanKindValue;
  audience: PlanAudienceValue;
  status: PlanStatusValue;
  startsAt: string | null;
  location: string;
  budgetRupees: number | null;
  checklist: ChecklistItem[];
}

interface PlanEditorModalProps {
  open: boolean;
  plan: PlanDTO | null;
  currency: string;
  onClose: () => void;
  onSave: (draft: PlanDraft) => Promise<void>;
}

/** Local date-time string for <input type="datetime-local">. */
function toLocalInput(iso: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** Quick start times that couples actually pick. */
function quickTimes() {
  const now = new Date();
  const fri = new Date(now);
  fri.setDate(now.getDate() + ((5 - now.getDay() + 7) % 7 || 7));
  fri.setHours(19, 30, 0, 0);
  const sat = new Date(now);
  sat.setDate(now.getDate() + ((6 - now.getDay() + 7) % 7 || 7));
  sat.setHours(10, 0, 0, 0);
  const nextMonth = new Date(now);
  nextMonth.setMonth(now.getMonth() + 1, 1);
  nextMonth.setHours(18, 0, 0, 0);
  return [
    { label: "This Friday evening", at: fri },
    { label: "Saturday morning", at: sat },
    { label: "Start of next month", at: nextMonth },
  ];
}

/**
 * Plan editor: kind, audience, date and place, budget, description, checklist and status.
 * The parent remounts it per opening, so every plan starts with fresh state.
 */
export function PlanEditorModal({ open, plan, currency, onClose, onSave }: PlanEditorModalProps) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLInputElement>(null);
  const [draft, setDraft] = useState<PlanDraft>(() => initial(plan));
  const [when, setWhen] = useState(() => toLocalInput(plan?.startsAt ?? null));
  const [newItem, setNewItem] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmDiscard, setConfirmDiscard] = useState(false);

  const original = JSON.stringify({ ...initial(plan), startsAt: plan?.startsAt ?? null });
  const dirty = JSON.stringify({ ...draft, startsAt: when ? new Date(when).toISOString() : null }) !== original;
  const titleOk = draft.title.trim().length >= 2;
  const budgetOk = draft.budgetRupees === null || (Number.isInteger(draft.budgetRupees) && draft.budgetRupees >= 0);

  useEffect(() => {
    if (open) requestAnimationFrame(() => titleRef.current?.focus());
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
    if (!titleOk) return setError("Give the plan a short title, at least two letters.");
    if (!budgetOk) return setError("Budget should be a whole number.");
    setSaving(true);
    setError(null);
    try {
      await onSave({
        ...draft,
        title: draft.title.trim(),
        description: draft.description.trim(),
        location: draft.location.trim(),
        startsAt: when ? new Date(when).toISOString() : null,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save this plan. Please try again.");
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
  }, [open, draft, when, saving, confirmDiscard]);

  if (!open) return null;

  function addItem() {
    const text = newItem.trim();
    if (!text) return;
    setDraft((d) => ({ ...d, checklist: [...d.checklist, { id: crypto.randomUUID(), text, done: false }] }));
    setNewItem("");
  }

  const doneCount = draft.checklist.filter((c) => c.done).length;
  const kindStyle = KIND_STYLES[draft.kind];

  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center sm:items-center sm:p-6">
      <button type="button" aria-label="Close without saving" onClick={requestClose} className="absolute inset-0 bg-ld-on-surface/30 backdrop-blur-[2px] animate-in fade-in duration-200" />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative flex max-h-[94dvh] w-full flex-col overflow-hidden rounded-t-3xl bg-ld-surface shadow-[0_24px_64px_-24px_rgba(64,56,50,0.35)] animate-in slide-in-from-bottom-4 fade-in duration-300 sm:max-w-2xl sm:rounded-3xl"
      >
        {/* Cover previews the kind */}
        <div className={cn("relative flex h-20 shrink-0 items-center justify-between bg-gradient-to-br px-6", kindStyle.cover)}>
          <div>
            <h2 id={titleId} className="font-display text-ld-headline-md text-ld-on-surface">{plan ? "Edit plan" : "Plan something lovely"}</h2>
            <p className="text-ld-caption text-ld-on-surface-variant">{kindStyle.hint}</p>
          </div>
          <button type="button" onClick={requestClose} aria-label="Close" className="inline-flex size-10 items-center justify-center rounded-full bg-ld-surface/70 text-ld-on-surface hover:bg-ld-surface">
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>

        <div className="flex flex-1 flex-col gap-6 overflow-y-auto px-6 py-6">
          {/* Kind */}
          <fieldset className="space-y-2">
            <legend className="text-ld-label-md font-medium text-ld-on-surface">What kind of plan?</legend>
            <div role="radiogroup" className="grid grid-cols-3 gap-2 sm:grid-cols-6">
              {KIND_ORDER.map((k) => {
                const s = KIND_STYLES[k];
                const active = draft.kind === k;
                return (
                  <button
                    key={k}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => setDraft((d) => ({ ...d, kind: k }))}
                    className={cn(
                      "flex flex-col items-center gap-1.5 rounded-2xl border p-2.5 text-center transition-colors",
                      active ? "border-ld-primary bg-ld-secondary-container/40" : "border-ld-outline-variant hover:bg-ld-surface-container-low"
                    )}
                  >
                    <s.icon className={cn("size-5", active ? "text-ld-primary" : "text-ld-on-surface-variant")} aria-hidden="true" />
                    <span className="text-[11px] leading-tight text-ld-on-surface">{s.short}</span>
                  </button>
                );
              })}
            </div>
          </fieldset>

          {/* Title */}
          <div className="space-y-2">
            <label htmlFor={`${titleId}-title`} className="text-ld-label-md font-medium text-ld-on-surface">Title</label>
            <input
              id={`${titleId}-title`}
              ref={titleRef}
              type="text"
              value={draft.title}
              maxLength={120}
              onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
              placeholder="Rooftop jazz, a weekend at the lake…"
              className="h-12 w-full rounded-xl border border-ld-outline-variant bg-ld-surface-container-lowest px-4 font-display text-ld-title-lg text-ld-on-surface placeholder:text-ld-outline focus:border-ld-primary focus:outline-none focus:ring-2 focus:ring-ld-primary/25"
            />
          </div>

          {/* When and where */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor={`${titleId}-when`} className="text-ld-label-md font-medium text-ld-on-surface">When</label>
              <input
                id={`${titleId}-when`}
                type="datetime-local"
                value={when}
                onChange={(e) => setWhen(e.target.value)}
                className="h-11 w-full rounded-xl border border-ld-outline-variant bg-ld-surface-container-lowest px-4 text-ld-body-sm text-ld-on-surface focus:border-ld-primary focus:outline-none focus:ring-2 focus:ring-ld-primary/25"
              />
              <div className="flex flex-wrap gap-1.5">
                {quickTimes().map((q) => (
                  <button key={q.label} type="button" onClick={() => setWhen(toLocalInput(q.at.toISOString()))} className="rounded-full bg-ld-surface-container px-2.5 py-1 text-[11px] text-ld-on-surface-variant hover:bg-ld-surface-container-high">
                    {q.label}
                  </button>
                ))}
                {when && (
                  <button type="button" onClick={() => setWhen("")} className="rounded-full px-2.5 py-1 text-[11px] text-ld-on-surface-variant hover:bg-ld-on-surface/5">
                    No date yet
                  </button>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor={`${titleId}-where`} className="text-ld-label-md font-medium text-ld-on-surface">Where</label>
              <input
                id={`${titleId}-where`}
                type="text"
                value={draft.location}
                maxLength={120}
                onChange={(e) => setDraft((d) => ({ ...d, location: e.target.value }))}
                placeholder="Old Town, Coorg, home…"
                className="h-11 w-full rounded-xl border border-ld-outline-variant bg-ld-surface-container-lowest px-4 text-ld-body-sm text-ld-on-surface placeholder:text-ld-outline focus:border-ld-primary focus:outline-none focus:ring-2 focus:ring-ld-primary/25"
              />
            </div>
          </div>

          {/* Who and budget */}
          <div className="grid gap-4 sm:grid-cols-2">
            <fieldset className="space-y-2">
              <legend className="text-ld-label-md font-medium text-ld-on-surface">Who is it for?</legend>
              <div role="radiogroup" className="grid grid-cols-2 gap-2">
                {(["COUPLE", "FAMILY"] as const).map((a) => {
                  const active = draft.audience === a;
                  return (
                    <button
                      key={a}
                      type="button"
                      role="radio"
                      aria-checked={active}
                      onClick={() => setDraft((d) => ({ ...d, audience: a }))}
                      className={cn("rounded-xl border px-3 py-2.5 text-left transition-colors", active ? "border-ld-primary bg-ld-secondary-container/40" : "border-ld-outline-variant hover:bg-ld-surface-container-low")}
                    >
                      <span className="block text-ld-label-sm font-semibold text-ld-on-surface">{AUDIENCE_LABEL[a]}</span>
                      <span className="block text-[11px] text-ld-on-surface-variant">{a === "COUPLE" ? "Only you two" : "Shared with family"}</span>
                    </button>
                  );
                })}
              </div>
            </fieldset>
            <div className="space-y-2">
              <label htmlFor={`${titleId}-budget`} className="text-ld-label-md font-medium text-ld-on-surface">Budget (optional)</label>
              <div className="relative">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ld-body-sm text-ld-on-surface-variant">{currencySymbol(currency)}</span>
                <input
                  id={`${titleId}-budget`}
                  type="number"
                  inputMode="numeric"
                  min={0}
                  step={100}
                  value={draft.budgetRupees ?? ""}
                  onChange={(e) => setDraft((d) => ({ ...d, budgetRupees: e.target.value === "" ? null : Math.round(Number(e.target.value)) }))}
                  placeholder="5000"
                  className="h-11 w-full rounded-xl border border-ld-outline-variant bg-ld-surface-container-lowest pl-8 pr-4 text-ld-body-sm text-ld-on-surface placeholder:text-ld-outline focus:border-ld-primary focus:outline-none focus:ring-2 focus:ring-ld-primary/25"
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label htmlFor={`${titleId}-desc`} className="text-ld-label-md font-medium text-ld-on-surface">Notes</label>
            <textarea
              id={`${titleId}-desc`}
              rows={3}
              maxLength={2000}
              value={draft.description}
              onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
              placeholder="What to wear, what to book, why this one matters…"
              className="w-full resize-none rounded-xl border border-ld-outline-variant bg-ld-surface-container-lowest px-4 py-3 text-ld-body-sm text-ld-on-surface placeholder:text-ld-outline focus:border-ld-primary focus:outline-none focus:ring-2 focus:ring-ld-primary/25"
            />
          </div>

          {/* Checklist */}
          <fieldset className="space-y-3">
            <legend className="flex w-full items-center justify-between text-ld-label-md font-medium text-ld-on-surface">
              Checklist
              {draft.checklist.length > 0 && <span className="text-ld-caption text-ld-on-surface-variant">{doneCount} of {draft.checklist.length} done</span>}
            </legend>
            <ul className="flex flex-col gap-2">
              {draft.checklist.map((item) => (
                <li key={item.id} className="flex items-center gap-3 rounded-xl bg-ld-surface-container-low px-3 py-2">
                  <button
                    type="button"
                    role="checkbox"
                    aria-checked={item.done}
                    aria-label={`Mark "${item.text}" as ${item.done ? "not done" : "done"}`}
                    onClick={() => setDraft((d) => ({ ...d, checklist: d.checklist.map((c) => (c.id === item.id ? { ...c, done: !c.done } : c)) }))}
                    className={cn("flex size-6 shrink-0 items-center justify-center rounded-md border transition-colors", item.done ? "border-ld-primary bg-ld-primary text-ld-on-primary" : "border-ld-outline hover:border-ld-primary")}
                  >
                    {item.done && <Check className="size-3.5" aria-hidden="true" />}
                  </button>
                  <span className={cn("min-w-0 flex-1 truncate text-ld-body-sm", item.done ? "text-ld-on-surface-variant line-through" : "text-ld-on-surface")}>{item.text}</span>
                  <button
                    type="button"
                    onClick={() => setDraft((d) => ({ ...d, checklist: d.checklist.filter((c) => c.id !== item.id) }))}
                    aria-label={`Remove ${item.text}`}
                    className="inline-flex size-7 items-center justify-center rounded-full text-ld-on-surface-variant hover:bg-ld-error/10 hover:text-ld-error"
                  >
                    <Trash2 className="size-3.5" aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
            <div className="flex gap-2">
              <label htmlFor={`${titleId}-item`} className="sr-only">New checklist item</label>
              <input
                id={`${titleId}-item`}
                type="text"
                value={newItem}
                maxLength={120}
                onChange={(e) => setNewItem(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addItem();
                  }
                }}
                placeholder="Add something to remember… (Enter)"
                className="h-10 min-w-0 flex-1 rounded-xl border border-ld-outline-variant bg-ld-surface-container-lowest px-3 text-ld-body-sm text-ld-on-surface placeholder:text-ld-outline focus:border-ld-primary focus:outline-none focus:ring-2 focus:ring-ld-primary/25"
              />
              <button type="button" onClick={addItem} disabled={!newItem.trim() || draft.checklist.length >= 30} className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-ld-surface-container px-3 text-ld-label-sm text-ld-on-surface hover:bg-ld-surface-container-high disabled:opacity-40">
                <Plus className="size-4" aria-hidden="true" />
                Add
              </button>
            </div>
          </fieldset>

          {/* Status */}
          <fieldset className="space-y-2">
            <legend className="text-ld-label-md font-medium text-ld-on-surface">Status</legend>
            <div role="radiogroup" className="flex gap-2">
              {(["IDEA", "PLANNED", "DONE"] as const).map((s) => {
                const active = draft.status === s;
                return (
                  <button
                    key={s}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => setDraft((d) => ({ ...d, status: s }))}
                    className={cn("h-10 rounded-full px-4 text-ld-label-sm transition-colors", active ? "bg-ld-on-surface text-ld-surface" : "bg-ld-surface-container text-ld-on-surface-variant hover:bg-ld-surface-container-high")}
                  >
                    {STATUS_LABEL[s]}
                  </button>
                );
              })}
            </div>
          </fieldset>

          {error && <p role="alert" className="absolute inset-x-4 bottom-20 z-20 rounded-xl bg-ld-error-container px-4 py-2 text-ld-caption text-ld-on-error-container shadow-lg sm:inset-x-6">{error}</p>}
          {confirmDiscard && (
            <div role="alertdialog" aria-label="Discard changes?" className="absolute inset-x-4 bottom-20 z-20 flex flex-col gap-3 rounded-2xl bg-ld-surface-container-highest p-4 text-ld-body-sm text-ld-on-surface shadow-[0_16px_40px_-12px_rgba(33,26,21,0.45)] ring-1 ring-ld-on-surface/10 sm:inset-x-6 sm:flex-row sm:items-center sm:justify-between">
              <span>Close without saving your changes?</span>
              <div className="flex gap-2">
                <button type="button" onClick={() => setConfirmDiscard(false)} className="rounded-full px-4 py-2 text-ld-label-sm hover:bg-ld-on-surface/5">Keep editing</button>
                <button type="button" onClick={onClose} className="rounded-full bg-ld-error px-4 py-2 text-ld-label-sm text-white">Discard</button>
              </div>
            </div>
          )}
        </div>

        <footer className="flex items-center justify-between gap-3 border-t border-ld-on-surface/5 px-6 py-4">
          <span className="hidden text-ld-caption text-ld-on-surface-variant sm:inline">Ctrl + Enter to save</span>
          <button
            type="button"
            onClick={submit}
            disabled={saving || !titleOk || !budgetOk}
            className="ml-auto inline-flex h-11 items-center gap-2 rounded-full bg-ld-primary px-6 text-ld-label-md text-ld-on-primary shadow-[0_8px_20px_rgba(201,126,139,0.28)] transition-colors hover:bg-ld-on-primary-fixed-variant disabled:opacity-50"
          >
            {saving ? "Saving…" : plan ? "Save changes" : "Save plan"}
          </button>
        </footer>
      </div>
    </div>
  );
}

function initial(plan: PlanDTO | null): PlanDraft {
  if (!plan) {
    return { title: "", description: "", kind: "DATE_NIGHT", audience: "COUPLE", status: "PLANNED", startsAt: null, location: "", budgetRupees: null, checklist: [] };
  }
  return {
    title: plan.title,
    description: plan.description,
    kind: plan.kind,
    audience: plan.audience,
    status: plan.status,
    startsAt: plan.startsAt,
    location: plan.location,
    budgetRupees: plan.budgetRupees,
    checklist: plan.checklist,
  };
}
