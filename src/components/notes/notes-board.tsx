"use client";

import { useConfirm } from "@/components/shared/use-confirm";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Heart, NotebookPen, Plus, Search, Sparkles, X } from "lucide-react";
import { apiCall } from "@/components/onboarding/api-client";
import { NoteCard } from "@/components/notes/note-card";
import { NoteEditorModal, type NoteDraft } from "@/components/notes/note-editor-modal";
import { Pagination, usePagination } from "@/components/shared/pagination";
import type { NoteDTO, NotesPayload } from "@/lib/notes-types";
import { cn } from "@/lib/utils";

type Filter = "all" | "pinned" | "mine" | "partner";

interface Toast {
  id: number;
  message: string;
  action?: { label: string; run: () => void };
}

/** Pinned first, then most recently changed. */
function sortNotes(notes: NoteDTO[]) {
  return [...notes].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    return b.updatedAt.localeCompare(a.updatedAt);
  });
}

export function NotesBoard({ initial }: { initial: NotesPayload }) {
  const [notes, setNotes] = useState<NoteDTO[]>(() => sortNotes(initial.notes));
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<{ open: boolean; note: NoteDTO | null }>({ open: false, note: null });
  const [toasts, setToasts] = useState<Toast[]>([]);
  // Relative times are computed after mount to keep server and client markup identical.
  const [now, setNow] = useState(0);
  const [openSeq, setOpenSeq] = useState(0);
  const searchRef = useRef<HTMLInputElement>(null);
  const lastTrigger = useRef<HTMLElement | null>(null);
  const toastId = useRef(0);

  useEffect(() => {
    const tick = () => setNow(Date.now());
    const first = setTimeout(tick, 0);
    const timer = setInterval(tick, 60_000);
    return () => {
      clearTimeout(first);
      clearInterval(timer);
    };
  }, []);

  const me = initial.currentUserId;
  const partnerName = useMemo(
    () => initial.members.find((m) => m.userId !== me)?.displayName ?? "Your partner",
    [initial.members, me]
  );

  const counts = useMemo(
    () => ({
      all: notes.length,
      pinned: notes.filter((n) => n.pinned).length,
      mine: notes.filter((n) => n.isMine).length,
      partner: notes.filter((n) => !n.isMine).length,
    }),
    [notes]
  );

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return notes.filter((n) => {
      if (filter === "pinned" && !n.pinned) return false;
      if (filter === "mine" && !n.isMine) return false;
      if (filter === "partner" && n.isMine) return false;
      if (!q) return true;
      return n.title.toLowerCase().includes(q) || n.body.toLowerCase().includes(q);
    });
  }, [notes, filter, query]);
  const paged = usePagination(visible, `${filter}|${query}`);

  const pushToast = useCallback((toast: Omit<Toast, "id">, ms = 6000) => {
    const id = ++toastId.current;
    setToasts((t) => [...t, { ...toast, id }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), ms);
  }, []);

  // Keyboard shortcuts: "n" new note, "/" search. Ignored while typing.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement;
      const typing = target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable;
      if (editing.open || typing || e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === "n") {
        e.preventDefault();
        openEditor(null);
      } else if (e.key === "/") {
        e.preventDefault();
        searchRef.current?.focus();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [editing.open]);

  function openEditor(note: NoteDTO | null) {
    lastTrigger.current = document.activeElement as HTMLElement;
    setOpenSeq((s) => s + 1);
    setEditing({ open: true, note });
  }

  function closeEditor() {
    setEditing({ open: false, note: null });
    requestAnimationFrame(() => lastTrigger.current?.focus());
  }

  /** Creates a note. The card appears immediately, then is replaced with the saved version. */
  async function createNote(draft: NoteDraft) {
    const tempId = `tmp-${Date.now()}`;
    const stamp = new Date().toISOString();
    const optimistic: NoteDTO = {
      id: tempId,
      title: draft.title,
      body: draft.body,
      color: draft.color,
      pinned: draft.pinned,
      authorId: me,
      authorName: "You",
      isMine: true,
      createdAt: stamp,
      updatedAt: stamp,
    };
    setNotes((prev) => sortNotes([optimistic, ...prev]));
    closeEditor();

    const result = await apiCall<{ note: NoteDTO }>("/api/notes", { method: "POST", body: draft });
    if (!result.ok) {
      setNotes((prev) => prev.filter((n) => n.id !== tempId));
      pushToast({ message: result.error.message });
      return;
    }
    setNotes((prev) => sortNotes(prev.map((n) => (n.id === tempId ? result.data.note : n))));
    pushToast({ message: "Note saved. Your partner can see it now." }, 3500);
  }

  /** Applies a change locally, sends it, and rolls back with a message if the server refuses. */
  async function patchNote(id: string, patch: Partial<Pick<NoteDTO, "title" | "body" | "color" | "pinned">>) {
    const before = notes.find((n) => n.id === id);
    if (!before) return;
    const optimistic = { ...before, ...patch, updatedAt: new Date().toISOString() };
    setNotes((prev) => sortNotes(prev.map((n) => (n.id === id ? optimistic : n))));

    const result = await apiCall<{ note: NoteDTO }>(`/api/notes/${id}`, { method: "PATCH", body: patch });
    if (!result.ok) {
      setNotes((prev) => sortNotes(prev.map((n) => (n.id === id ? before : n))));
      throw new Error(result.error.message);
    }
    setNotes((prev) => sortNotes(prev.map((n) => (n.id === id ? result.data.note : n))));
  }

  async function saveFromEditor(draft: NoteDraft) {
    if (editing.note) {
      await patchNote(editing.note.id, { title: draft.title, body: draft.body, color: draft.color, pinned: draft.pinned });
      closeEditor();
      pushToast({ message: "Changes saved." }, 2500);
    } else {
      await createNote(draft);
    }
  }

  async function togglePin(note: NoteDTO) {
    try {
      await patchNote(note.id, { pinned: !note.pinned });
    } catch (e) {
      pushToast({ message: e instanceof Error ? e.message : "Could not update the pin." });
    }
  }

  /** Deletes immediately and offers Undo for a short window, which is quicker than a confirm dialog. */
  const { confirm, dialog } = useConfirm();
  async function deleteNote(note: NoteDTO) {
    if (!(await confirm({ title: "Delete this note?", description: "It will disappear for both of you. You can undo this for a few minutes after deleting.", confirmLabel: "Delete" }))) return;
    setNotes((prev) => prev.filter((n) => n.id !== note.id));
    const result = await apiCall<{ deleted: boolean }>(`/api/notes/${note.id}`, { method: "DELETE" });
    if (!result.ok) {
      setNotes((prev) => sortNotes([note, ...prev]));
      pushToast({ message: result.error.message });
      return;
    }
    pushToast(
      {
        message: `"${note.title || "Untitled note"}" was deleted.`,
        action: {
          label: "Undo",
          run: async () => {
            const restored = await apiCall<{ note: NoteDTO }>(`/api/notes/${note.id}/restore`, { method: "POST" });
            if (restored.ok) {
              setNotes((prev) => sortNotes([restored.data.note, ...prev]));
              pushToast({ message: "Note restored." }, 2500);
            } else {
              pushToast({ message: "This note can no longer be restored." });
            }
          },
        },
      },
      8000
    );
  }

  const filters: { key: Filter; label: string; count: number }[] = [
    { key: "all", label: "All", count: counts.all },
    { key: "pinned", label: "Pinned", count: counts.pinned },
    { key: "mine", label: "Mine", count: counts.mine },
    { key: "partner", label: `${partnerName}'s`, count: counts.partner },
  ];

  return (
    <div className="space-y-6">
      {dialog}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <p className="max-w-xl text-ld-body-md text-ld-on-surface-variant">
            Little thoughts, reminders and ideas you share. Pin the ones you come back to.
        </p>
        <button
          type="button"
          onClick={() => openEditor(null)}
          className="hidden h-12 items-center gap-2 rounded-full bg-ld-primary px-6 text-ld-label-md text-ld-on-primary shadow-[0_8px_20px_rgba(201,126,139,0.28)] transition-colors hover:bg-ld-on-primary-fixed-variant lg:inline-flex"
        >
          <Plus className="size-5" aria-hidden="true" />
          New note
          <kbd className="ml-1 rounded bg-white/20 px-1.5 py-0.5 text-[11px] font-normal">N</kbd>
        </button>
      </header>

      {/* Toolbar: search and filters */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <label className="relative flex h-11 w-full items-center md:max-w-sm">
          <span className="sr-only">Search notes</span>
          <Search className="pointer-events-none absolute left-4 size-4 text-ld-on-surface-variant" aria-hidden="true" />
          <input
            ref={searchRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search notes  ( / )"
            className="h-11 w-full rounded-full border border-ld-outline-variant bg-ld-surface-container-lowest pl-11 pr-10 text-ld-body-sm text-ld-on-surface placeholder:text-ld-outline focus:border-ld-primary focus:outline-none focus:ring-2 focus:ring-ld-primary/25"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="absolute right-2 inline-flex size-7 items-center justify-center rounded-full text-ld-on-surface-variant hover:bg-ld-on-surface/5"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          )}
        </label>

        <div role="tablist" aria-label="Filter notes" className="flex gap-2 overflow-x-auto pb-1 md:pb-0">
          {filters.map((f) => {
            const active = filter === f.key;
            return (
              <button
                key={f.key}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setFilter(f.key)}
                className={cn(
                  "inline-flex h-10 shrink-0 items-center gap-2 rounded-full px-4 text-ld-label-md transition-colors",
                  active ? "bg-ld-on-surface text-ld-surface" : "bg-ld-surface-container text-ld-on-surface-variant hover:bg-ld-surface-container-high"
                )}
              >
                {f.label}
                <span className={cn("rounded-full px-1.5 text-[11px] tabular-nums", active ? "bg-white/20" : "bg-ld-on-surface/5")}>{f.count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Board */}
      {notes.length === 0 ? (
        <EmptyNotes onWrite={() => openEditor(null)} />
      ) : visible.length === 0 ? (
        <div role="status" className="rounded-3xl border border-dashed border-ld-outline-variant px-6 py-14 text-center">
          <p className="font-display text-ld-headline-md text-ld-on-surface">Nothing matches that yet.</p>
          <p className="mt-2 text-ld-body-sm text-ld-on-surface-variant">Try another word, or clear the filter.</p>
        </div>
      ) : (
        <ul className="columns-1 gap-4 sm:columns-2 xl:columns-3" aria-label="Notes">
          {paged.pageItems.map((note) => (
            <li key={note.id}>
              <NoteCard
                note={note}
                now={now}
                onOpen={() => openEditor(note)}
                onTogglePin={() => togglePin(note)}
                onDelete={() => deleteNote(note)}
              />
            </li>
          ))}
        </ul>
      )}
      {visible.length > 0 && (
        <Pagination
          page={paged.page}
          totalPages={paged.totalPages}
          total={paged.total}
          pageSize={paged.pageSize}
          start={paged.start}
          setPage={paged.setPage}
          label="Notes pages"
        />
      )}

      {/* Mobile floating action button */}
      <button
        type="button"
        onClick={() => openEditor(null)}
        aria-label="New note"
        className="fixed bottom-24 right-5 z-40 inline-flex size-14 items-center justify-center rounded-full bg-ld-primary text-ld-on-primary shadow-[0_12px_30px_-8px_rgba(201,126,139,0.7)] transition-transform active:scale-95 lg:hidden"
      >
        <Plus className="size-6" aria-hidden="true" />
      </button>

      <NoteEditorModal
        key={openSeq}
        open={editing.open}
        note={editing.note}
        onClose={closeEditor}
        onSave={saveFromEditor}
      />

      {/* Toasts */}
      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-24 z-[95] flex flex-col items-center gap-2 px-4 lg:bottom-6">
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className="pointer-events-auto flex max-w-md items-center gap-4 rounded-full bg-ld-on-surface px-5 py-3 text-ld-body-sm text-ld-surface shadow-[0_16px_40px_-16px_rgba(33,26,21,0.6)] animate-in fade-in slide-in-from-bottom-2 duration-300"
          >
            <Sparkles className="size-4 shrink-0 text-ld-primary-container" aria-hidden="true" />
            <span className="min-w-0 flex-1 truncate">{t.message}</span>
            {t.action && (
              <button
                type="button"
                onClick={() => {
                  t.action?.run();
                  setToasts((prev) => prev.filter((x) => x.id !== t.id));
                }}
                className="shrink-0 rounded-full bg-ld-primary-container px-3 py-1 text-ld-label-sm font-semibold text-ld-on-primary hover:bg-ld-primary"
              >
                {t.action.label}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function EmptyNotes({ onWrite }: { onWrite: () => void }) {
  return (
    <section aria-labelledby="notes-empty" className="relative overflow-hidden rounded-3xl bg-ld-surface-container-lowest px-6 py-16 text-center shadow-sm">
      <div aria-hidden="true" className="pointer-events-none absolute -left-16 -top-16 size-64 rounded-full bg-ld-secondary-container/40 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-20 -right-10 size-64 rounded-full bg-ld-tertiary-fixed/50 blur-3xl" />
      <div className="relative flex flex-col items-center gap-5">
        <span className="flex size-16 items-center justify-center rounded-full bg-ld-secondary-container/50 text-ld-primary">
          <NotebookPen className="size-7" aria-hidden="true" />
        </span>
        <div className="space-y-2">
          <h2 id="notes-empty" className="font-display text-ld-headline-md text-ld-on-surface">
            Your first note is a love letter in waiting.
          </h2>
          <p className="mx-auto max-w-md text-ld-body-sm text-ld-on-surface-variant">
            Write a sweet thought, a grocery list or a plan for the weekend. Your partner sees it straight away.
          </p>
        </div>
        <button
          type="button"
          onClick={onWrite}
          className="inline-flex h-12 items-center gap-2 rounded-full bg-ld-primary px-6 text-ld-label-md text-ld-on-primary shadow-[0_8px_20px_rgba(201,126,139,0.28)] transition-colors hover:bg-ld-on-primary-fixed-variant"
        >
          <Plus className="size-5" aria-hidden="true" />
          Write a note
        </button>
        <p className="flex items-center gap-1.5 text-ld-caption text-ld-outline">
          <Heart className="size-3.5 fill-ld-primary text-ld-primary" aria-hidden="true" />
          Only you two can see these notes.
        </p>
      </div>
    </section>
  );
}
