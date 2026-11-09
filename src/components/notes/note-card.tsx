"use client";

import { Pencil, Pin, PinOff, Trash2 } from "lucide-react";
import { NOTE_COLOR_STYLES } from "@/components/notes/note-colors";
import { relativeTime } from "@/lib/format";
import type { NoteDTO } from "@/lib/notes-types";
import { cn } from "@/lib/utils";

interface NoteCardProps {
  note: NoteDTO;
  now: number;
  onOpen: () => void;
  onTogglePin: () => void;
  onDelete: () => void;
}

/** One shared note. Clicking the card opens it; the pin and delete controls are separate buttons. */
export function NoteCard({ note, now, onOpen, onTogglePin, onDelete }: NoteCardProps) {
  const style = NOTE_COLOR_STYLES[note.color];
  const edited = note.updatedAt !== note.createdAt;
  const pending = note.id.startsWith("tmp-");

  return (
    <article
      className={cn(
        "group relative mb-4 break-inside-avoid overflow-hidden rounded-3xl p-5 shadow-sm ring-1 ring-ld-on-surface/5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_40px_-20px_rgba(64,56,50,0.35)]",
        style.card,
        pending && "opacity-70"
      )}
      aria-busy={pending}
    >
      {note.pinned && (
        <span className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full bg-ld-surface/80 px-2 py-0.5 text-[11px] font-medium text-ld-primary">
          <Pin className="size-3" aria-hidden="true" />
          Pinned
        </span>
      )}

      <button
        type="button"
        onClick={onOpen}
        className="block w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-ld-primary rounded-2xl"
        aria-label={`Open note: ${note.title}`}
      >
        <h3 className={cn("pr-16 font-display text-ld-title-lg leading-snug text-ld-on-surface", !note.title && "italic text-ld-on-surface-variant")}>
          {note.title || "Untitled note"}
        </h3>
        {note.body && (
          <p className="mt-2 line-clamp-[8] whitespace-pre-wrap text-ld-body-sm leading-relaxed text-ld-on-surface-variant">
            {note.body}
          </p>
        )}
      </button>

      <footer className="mt-4 flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <span
            aria-hidden="true"
            className={cn(
              "flex size-7 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold",
              note.isMine ? "bg-ld-secondary-container text-ld-on-secondary-container" : "bg-ld-tertiary-fixed text-ld-on-tertiary-fixed-variant"
            )}
          >
            {note.authorName.charAt(0).toUpperCase()}
          </span>
          <p className="truncate text-ld-caption text-ld-on-surface-variant">
            {note.authorName} · {edited ? "edited " : ""}
            {now ? relativeTime(new Date(note.updatedAt), now) : ""}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-1 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
          <button
            type="button"
            onClick={onTogglePin}
            disabled={pending}
            aria-pressed={note.pinned}
            aria-label={note.pinned ? "Unpin note" : "Pin note"}
            className="inline-flex size-9 items-center justify-center rounded-full text-ld-on-surface-variant transition-colors hover:bg-ld-on-surface/10 hover:text-ld-primary disabled:opacity-40"
          >
            {note.pinned ? <PinOff className="size-4" aria-hidden="true" /> : <Pin className="size-4" aria-hidden="true" />}
          </button>
          <button
            type="button"
            onClick={onOpen}
            disabled={pending}
            aria-label="Edit note"
            className="inline-flex size-9 items-center justify-center rounded-full text-ld-on-surface-variant transition-colors hover:bg-ld-on-surface/10 hover:text-ld-on-surface disabled:opacity-40"
          >
            <Pencil className="size-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={onDelete}
            disabled={pending}
            aria-label="Delete note"
            className="inline-flex size-9 items-center justify-center rounded-full text-ld-on-surface-variant transition-colors hover:bg-ld-error/10 hover:text-ld-error disabled:opacity-40"
          >
            <Trash2 className="size-4" aria-hidden="true" />
          </button>
        </div>
      </footer>
    </article>
  );
}
