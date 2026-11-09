"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Check, Pin, PinOff, X } from "lucide-react";
import { NOTE_BODY_MAX, NOTE_TITLE_MAX, type NoteColorValue } from "@/lib/validations/notes";
import { NOTE_COLOR_ORDER, NOTE_COLOR_STYLES } from "@/components/notes/note-colors";
import { cn } from "@/lib/utils";
import type { NoteDTO } from "@/lib/notes-types";

export interface NoteDraft {
  title: string;
  body: string;
  color: NoteColorValue;
  pinned: boolean;
}

interface NoteEditorModalProps {
  open: boolean;
  note: NoteDTO | null; // null = new note
  onClose: () => void;
  onSave: (draft: NoteDraft) => Promise<void>;
}

/**
 * Create or edit a note. Esc closes, Ctrl/Cmd+Enter saves, and closing with unsaved changes asks first.
 * Focus moves into the dialog on open and returns to the trigger on close.
 */
export function NoteEditorModal({ open, note, onClose, onSave }: NoteEditorModalProps) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const firstFieldRef = useRef<HTMLInputElement>(null);
  const [draft, setDraft] = useState<NoteDraft>(() => initialDraft(note));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmDiscard, setConfirmDiscard] = useState(false);

  // The parent remounts this component for each opening (via key), so state starts fresh.
  useEffect(() => {
    if (open) requestAnimationFrame(() => firstFieldRef.current?.focus());
  }, [open]);

  const dirty = open && JSON.stringify(draft) !== JSON.stringify(initialDraft(note));
  const canSave = !saving && (draft.title.trim().length > 0 || draft.body.trim().length > 0);

  function requestClose() {
    if (dirty && !confirmDiscard) {
      setConfirmDiscard(true);
      return;
    }
    onClose();
  }

  async function submit() {
    if (!canSave) return;
    setSaving(true);
    setError(null);
    try {
      await onSave({ ...draft, title: draft.title.trim() });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save this note. Please try again.");
      setSaving(false);
      return;
    }
    setSaving(false);
  }

  // Keyboard: Escape closes, Ctrl/Cmd+Enter saves, Tab stays inside the dialog.
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
        const focusable = dialogRef.current.querySelectorAll<HTMLElement>("button, input, textarea, select, [tabindex]:not([tabindex='-1'])");
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
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
  }, [open, draft, saving, confirmDiscard]);

  // Lock background scroll while open.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  if (!open) return null;

  const style = NOTE_COLOR_STYLES[draft.color];

  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center sm:items-center sm:p-6">
      <button
        type="button"
        aria-label="Close and discard changes"
        onClick={requestClose}
        className="absolute inset-0 bg-ld-on-surface/30 backdrop-blur-[2px] animate-in fade-in duration-200"
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={cn(
          "relative flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-3xl shadow-[0_24px_64px_-24px_rgba(64,56,50,0.35)] sm:max-w-xl sm:rounded-3xl",
          "animate-in slide-in-from-bottom-4 fade-in duration-300",
          style.card,
          "bg-ld-surface-container-lowest"
        )}
      >
        <header className="flex items-center justify-between gap-3 border-b border-ld-on-surface/5 px-6 pb-3 pt-5">
          <h2 id={titleId} className="font-display text-ld-headline-md text-ld-on-surface">
            {note ? "Edit note" : "A new note"}
          </h2>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setDraft((d) => ({ ...d, pinned: !d.pinned }))}
              aria-pressed={draft.pinned}
              aria-label={draft.pinned ? "Unpin note" : "Pin note to the top"}
              className={cn(
                "inline-flex size-10 items-center justify-center rounded-full transition-colors",
                draft.pinned ? "bg-ld-primary text-ld-on-primary" : "text-ld-on-surface-variant hover:bg-ld-on-surface/5"
              )}
            >
              {draft.pinned ? <PinOff className="size-4" aria-hidden="true" /> : <Pin className="size-4" aria-hidden="true" />}
            </button>
            <button
              type="button"
              onClick={requestClose}
              aria-label="Close"
              className="inline-flex size-10 items-center justify-center rounded-full text-ld-on-surface-variant hover:bg-ld-on-surface/5"
            >
              <X className="size-5" aria-hidden="true" />
            </button>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-6 py-5">
          <label className="sr-only" htmlFor={`${titleId}-title`}>Title</label>
          <input
            id={`${titleId}-title`}
            ref={firstFieldRef}
            type="text"
            value={draft.title}
            maxLength={NOTE_TITLE_MAX}
            placeholder="Give it a title (optional)"
            onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
            className="w-full bg-transparent font-display text-ld-headline-md text-ld-on-surface placeholder:text-ld-outline focus:outline-none"
          />

          <label className="sr-only" htmlFor={`${titleId}-body`}>Note</label>
          <textarea
            id={`${titleId}-body`}
            value={draft.body}
            maxLength={NOTE_BODY_MAX}
            rows={8}
            placeholder="Write something sweet, a reminder, or an idea for later…"
            onChange={(e) => setDraft((d) => ({ ...d, body: e.target.value }))}
            className="min-h-44 w-full resize-none bg-transparent text-ld-body-md leading-relaxed text-ld-on-surface placeholder:text-ld-outline focus:outline-none"
          />

          <div className="flex items-center justify-between gap-3">
            <div role="radiogroup" aria-label="Note colour" className="flex items-center gap-2">
              {NOTE_COLOR_ORDER.map((c) => {
                const selected = draft.color === c;
                return (
                  <button
                    key={c}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    aria-label={NOTE_COLOR_STYLES[c].label}
                    onClick={() => setDraft((d) => ({ ...d, color: c }))}
                    className={cn(
                      "relative inline-flex size-8 items-center justify-center rounded-full ring-1 ring-ld-on-surface/10 transition-transform hover:scale-110",
                      NOTE_COLOR_STYLES[c].swatch,
                      selected && "ring-2 ring-ld-primary"
                    )}
                  >
                    {selected && <Check className="size-4 text-ld-on-surface" aria-hidden="true" />}
                  </button>
                );
              })}
            </div>
            <span className={cn("text-ld-caption tabular-nums", draft.body.length > NOTE_BODY_MAX * 0.9 ? "text-ld-error" : "text-ld-on-surface-variant")}>
              {draft.body.length} / {NOTE_BODY_MAX}
            </span>
          </div>

          {error && (
            <p role="alert" className="absolute inset-x-4 bottom-20 z-20 rounded-xl bg-ld-error-container px-4 py-2 text-ld-caption text-ld-on-error-container shadow-lg sm:inset-x-6">
              {error}
            </p>
          )}
          {confirmDiscard && (
            <div role="alertdialog" aria-label="Discard changes?" className="absolute inset-x-4 bottom-20 z-20 flex flex-col gap-3 rounded-2xl bg-ld-surface-container-highest p-4 text-ld-body-sm text-ld-on-surface shadow-[0_16px_40px_-12px_rgba(33,26,21,0.45)] ring-1 ring-ld-on-surface/10 sm:inset-x-6 sm:flex-row sm:items-center sm:justify-between">
              <span>You have unsaved changes. Discard them?</span>
              <div className="flex gap-2">
                <button type="button" onClick={() => setConfirmDiscard(false)} className="rounded-full px-4 py-2 text-ld-label-sm hover:bg-ld-on-surface/5">
                  Keep writing
                </button>
                <button type="button" onClick={onClose} className="rounded-full bg-ld-error px-4 py-2 text-ld-label-sm text-white">
                  Discard
                </button>
              </div>
            </div>
          )}
        </div>

        <footer className="flex items-center justify-between gap-3 border-t border-ld-on-surface/5 px-6 py-4">
          <span className="hidden text-ld-caption text-ld-on-surface-variant sm:inline">Ctrl + Enter to save</span>
          <button
            type="button"
            onClick={submit}
            disabled={!canSave}
            className="ml-auto inline-flex h-11 items-center gap-2 rounded-full bg-ld-primary px-6 text-ld-label-md text-ld-on-primary shadow-[0_8px_20px_rgba(201,126,139,0.28)] transition-colors hover:bg-ld-on-primary-fixed-variant disabled:opacity-50"
          >
            {saving ? "Saving…" : note ? "Save changes" : "Save note"}
          </button>
        </footer>
      </div>
    </div>
  );
}

function initialDraft(note: NoteDTO | null): NoteDraft {
  if (!note) return { title: "", body: "", color: "ROSE", pinned: false };
  return { title: note.title, body: note.body, color: note.color, pinned: note.pinned };
}
