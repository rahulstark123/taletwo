"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { ImagePlus, Plus, Star, Trash2, Upload, X } from "lucide-react";
import { apiCall } from "@/components/onboarding/api-client";
import { MEMORY_CATEGORY_ORDER, MEMORY_CATEGORY_STYLES } from "@/components/memories/memory-kinds";
import { uploadPhotoFile, deletePhotoPaths } from "@/lib/uploads-client";
import { compressPhoto, formatBytes } from "@/lib/image-compress";
import type { MemoryDTO, MemoryMediaDTO } from "@/lib/memories-types";
import {
  MEMORY_ORIGINAL_MAX_BYTES,
  MEMORY_MAX_PHOTOS,
  MEMORY_MAX_TAGS,
  MEMORY_MIME_TYPES,
  type MemoryCategoryValue,
} from "@/lib/validations/memories";
import { cn } from "@/lib/utils";

interface NewPhoto {
  key: string;
  name: string;
  status: "compressing" | "ready" | "failed";
  file: File | null; // compressed WebP once ready
  preview: string | null;
  originalBytes: number;
  note: string | null;
}

interface AddMemoryModalProps {
  open: boolean;
  workspaceId: number;
  memory: MemoryDTO | null; // null = create
  onClose: () => void;
  onSaved: (memory: MemoryDTO) => void;
}

const todayIso = () => new Date().toISOString().slice(0, 10);

/**
 * Create a memory or edit one. Photos upload straight to private storage from the browser (the
 * server (which stores them privately in R2), then the memory is saved. If saving fails, the uploaded files are removed.
 */
export function AddMemoryModal({ open, memory, onClose, onSaved }: AddMemoryModalProps) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [memoryId] = useState(() => memory?.id ?? crypto.randomUUID());
  const [form, setForm] = useState(() => initialForm(memory));
  const [tagText, setTagText] = useState("");
  const [photos, setPhotos] = useState<NewPhoto[]>([]);
  const [keepIds, setKeepIds] = useState<string[]>(() => (memory ? memory.media.map((m) => m.id) : []));
  const [progress, setProgress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const existing: MemoryMediaDTO[] = memory?.media ?? [];
  const totalPhotos = keepIds.length + photos.length;
  const photosReady = photos.every((p) => p.status === "ready");
  const canSave = !saving && photosReady && form.title.trim().length >= 2 && totalPhotos >= 1 && totalPhotos <= MEMORY_MAX_PHOTOS;

  // Object URLs are revoked when the modal unmounts (removal revokes its own URL).
  const photosRef = useRef<NewPhoto[]>([]);
  useEffect(() => {
    photosRef.current = photos;
  }, [photos]);
  useEffect(() => {
    return () => photosRef.current.forEach((p) => p.preview && URL.revokeObjectURL(p.preview));
  }, []);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  function removePhoto(key: string) {
    setPhotos((list) => {
      const gone = list.find((x) => x.key === key);
      if (gone?.preview) URL.revokeObjectURL(gone.preview);
      return list.filter((x) => x.key !== key);
    });
  }

  /** Accepts originals, compresses each one in the browser right away, and shows the result as it is ready. */
  function addFiles(list: FileList | File[]) {
    setError(null);
    const incoming = Array.from(list);
    const room = MEMORY_MAX_PHOTOS - totalPhotos;
    if (incoming.length > room) setError(`A memory can hold up to ${MEMORY_MAX_PHOTOS} photos. Only the first ${Math.max(room, 0)} were added.`);
    const accepted: File[] = [];
    for (const file of incoming.slice(0, Math.max(room, 0))) {
      if (!(MEMORY_MIME_TYPES as readonly string[]).includes(file.type)) {
        setError("Please choose JPG, PNG or WebP photos.");
        continue;
      }
      if (file.size > MEMORY_ORIGINAL_MAX_BYTES) {
        setError(`"${file.name}" is over 25 MB. Please choose a smaller original.`);
        continue;
      }
      accepted.push(file);
    }
    if (!accepted.length) return;

    const entries: NewPhoto[] = accepted.map((file) => ({
      key: crypto.randomUUID(),
      name: file.name,
      status: "compressing",
      file: null,
      preview: null,
      originalBytes: file.size,
      note: null,
    }));
    setPhotos((prev) => [...prev, ...entries]);

    accepted.forEach((file, i) => {
      const key = entries[i].key;
      compressPhoto(file)
        .then(({ file: small }) => {
          setPhotos((prev) => prev.map((x) => (x.key === key ? { ...x, status: "ready", file: small, preview: URL.createObjectURL(small), note: `${formatBytes(file.size)} → ${formatBytes(small.size)}` } : x)));
        })
        .catch((e: unknown) => {
          setPhotos((prev) => prev.map((x) => (x.key === key ? { ...x, status: "failed", note: e instanceof Error ? e.message : "Could not prepare this photo." } : x)));
        });
    });
  }

  function addTag(raw: string) {
    const tag = raw.trim().toLowerCase().replace(/^#/, "");
    if (!tag) return;
    setForm((f) => (f.tags.includes(tag) || f.tags.length >= MEMORY_MAX_TAGS ? f : { ...f, tags: [...f.tags, tag] }));
    setTagText("");
  }

  async function save() {
    if (!canSave) return;
    setSaving(true);
    setError(null);
    const uploaded: string[] = [];
    try {
      const media: { path: string; mimeType: string; sizeBytes: number }[] = [];
      for (let i = 0; i < photos.length; i += 1) {
        const p = photos[i];
        if (!p.file) throw new Error("A photo is still being prepared. Please wait a moment.");
        setProgress(`Uploading photo ${i + 1} of ${photos.length}…`);
        const up = await uploadPhotoFile("memory", p.file, memoryId);
        if (!up.ok) throw new Error(up.error.message);
        uploaded.push(up.data.path);
        media.push({ path: up.data.path, mimeType: up.data.mimeType, sizeBytes: up.data.sizeBytes });
      }

      setProgress("Saving your memory…");
      const body = {
        title: form.title.trim(),
        caption: form.caption.trim(),
        memoryDate: form.memoryDate,
        location: form.location.trim(),
        category: form.category,
        tags: form.tags,
        favourite: form.favourite,
      };
      const result = memory
        ? await apiCall<{ memory: MemoryDTO }>(`/api/memories/${memory.id}`, {
            method: "PATCH",
            body: { ...body, addMedia: media, removeMediaIds: existing.filter((m) => !keepIds.includes(m.id)).map((m) => m.id) },
          })
        : await apiCall<{ memory: MemoryDTO }>("/api/memories", { method: "POST", body: { ...body, id: memoryId, media } });

      if (!result.ok) {
        if (uploaded.length) await deletePhotoPaths("memory", uploaded);
        throw new Error(result.error.message);
      }
      onSaved(result.data.memory);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save this memory. Please try again.");
    } finally {
      setSaving(false);
      setProgress(null);
    }
  }

  // Keyboard: Escape closes, Ctrl/Cmd+Enter saves.
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        save();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, form, photos, keepIds, saving]);

  const dateMax = useMemo(() => todayIso(), []);
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center sm:items-center sm:p-6">
      <button type="button" aria-label="Close without saving" onClick={onClose} disabled={saving} className="absolute inset-0 bg-ld-on-surface/30 backdrop-blur-[2px] animate-in fade-in duration-200" />
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby={titleId} className="relative flex max-h-[94dvh] w-full flex-col overflow-hidden rounded-t-3xl bg-ld-surface shadow-[0_24px_64px_-24px_rgba(64,56,50,0.35)] animate-in slide-in-from-bottom-4 fade-in duration-300 sm:max-w-2xl sm:rounded-3xl">
        <header className="flex items-center justify-between gap-3 border-b border-ld-on-surface/10 px-6 py-4">
          <div>
            <h2 id={titleId} className="font-display text-ld-headline-md text-ld-on-surface">{memory ? "Edit this memory" : "Keep a new memory"}</h2>
            <p className="text-ld-caption text-ld-on-surface-variant">Photos stay private to you two.</p>
          </div>
          <button type="button" onClick={onClose} disabled={saving} aria-label="Close" className="inline-flex size-10 items-center justify-center rounded-full text-ld-on-surface-variant hover:bg-ld-on-surface/5 disabled:opacity-40">
            <X className="size-5" aria-hidden="true" />
          </button>
        </header>

        <div className="flex flex-1 flex-col gap-6 overflow-y-auto px-6 py-5">
          {/* Photos */}
          <section aria-labelledby={`${titleId}-photos`} className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 id={`${titleId}-photos`} className="text-ld-label-md font-medium text-ld-on-surface">Photos</h3>
              <span className="text-ld-caption tabular-nums text-ld-on-surface-variant">{totalPhotos} / {MEMORY_MAX_PHOTOS}</span>
            </div>

            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (!saving) addFiles(e.dataTransfer.files);
              }}
              className="grid grid-cols-3 gap-2 sm:grid-cols-4"
            >
              {existing
                .filter((m) => keepIds.includes(m.id))
                .map((m) => (
                  <PhotoTile key={m.id} src={m.url} label="Saved photo" onRemove={() => setKeepIds((k) => k.filter((id) => id !== m.id))} disabled={saving} />
                ))}
              {photos.map((p) => (
                <PhotoTile key={p.key} src={p.preview} label={p.name} status={p.status} note={p.note} onRemove={() => removePhoto(p.key)} disabled={saving} />
              ))}
              {totalPhotos < MEMORY_MAX_PHOTOS && (
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  disabled={saving}
                  className="flex aspect-square flex-col items-center justify-center gap-1.5 rounded-2xl border-2 border-dashed border-ld-outline-variant text-ld-on-surface-variant transition-colors hover:border-ld-primary hover:text-ld-primary disabled:opacity-40"
                >
                  <ImagePlus className="size-6" aria-hidden="true" />
                  <span className="text-[11px]">Add photos</span>
                </button>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept={MEMORY_MIME_TYPES.join(",")}
              multiple
              className="sr-only"
              onChange={(e) => {
                if (e.target.files) addFiles(e.target.files);
                e.target.value = "";
              }}
            />
            <p className="flex items-center gap-2 text-[11px] text-ld-outline">
              <Upload className="size-3.5" aria-hidden="true" />
              Drag photos here, or tap Add photos. Photos are compressed for you, so large camera files are fine.
            </p>
          </section>

          {/* Details */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <label htmlFor={`${titleId}-title`} className="text-ld-label-md font-medium text-ld-on-surface">Title</label>
              <input
                id={`${titleId}-title`}
                type="text"
                value={form.title}
                maxLength={120}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="The cafe by the harbour"
                className="h-12 w-full rounded-xl border border-ld-outline-variant bg-ld-surface-container-lowest px-4 font-display text-ld-title-lg text-ld-on-surface placeholder:text-ld-outline focus:border-ld-primary focus:outline-none focus:ring-2 focus:ring-ld-primary/25"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor={`${titleId}-date`} className="text-ld-label-md font-medium text-ld-on-surface">When</label>
              <input
                id={`${titleId}-date`}
                type="date"
                value={form.memoryDate}
                max={dateMax}
                onChange={(e) => setForm((f) => ({ ...f, memoryDate: e.target.value }))}
                className="h-11 w-full rounded-xl border border-ld-outline-variant bg-ld-surface-container-lowest px-4 text-ld-body-sm text-ld-on-surface focus:border-ld-primary focus:outline-none focus:ring-2 focus:ring-ld-primary/25"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor={`${titleId}-where`} className="text-ld-label-md font-medium text-ld-on-surface">Where (optional)</label>
              <input
                id={`${titleId}-where`}
                type="text"
                value={form.location}
                maxLength={120}
                onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                placeholder="Lisbon, home, the hill"
                className="h-11 w-full rounded-xl border border-ld-outline-variant bg-ld-surface-container-lowest px-4 text-ld-body-sm text-ld-on-surface placeholder:text-ld-outline focus:border-ld-primary focus:outline-none focus:ring-2 focus:ring-ld-primary/25"
              />
            </div>
          </div>

          <fieldset className="space-y-2">
            <legend className="text-ld-label-md font-medium text-ld-on-surface">Kind of memory</legend>
            <div role="radiogroup" className="flex flex-wrap gap-2">
              {MEMORY_CATEGORY_ORDER.map((c: MemoryCategoryValue) => {
                const s = MEMORY_CATEGORY_STYLES[c];
                const active = form.category === c;
                return (
                  <button
                    key={c}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => setForm((f) => ({ ...f, category: c }))}
                    className={cn("inline-flex h-9 items-center gap-1.5 rounded-full px-3.5 text-ld-label-sm transition-all", active ? cn(s.tint, "ring-2 ring-ld-primary/40") : "bg-ld-surface-container text-ld-on-surface-variant hover:bg-ld-surface-container-high")}
                  >
                    <s.icon className="size-3.5" aria-hidden="true" />
                    {s.label}
                  </button>
                );
              })}
            </div>
          </fieldset>

          <div className="space-y-2">
            <label htmlFor={`${titleId}-tags`} className="text-ld-label-md font-medium text-ld-on-surface">Tags</label>
            <div className="flex flex-wrap items-center gap-2 rounded-xl border border-ld-outline-variant bg-ld-surface-container-lowest px-3 py-2 focus-within:border-ld-primary focus-within:ring-2 focus-within:ring-ld-primary/25">
              {form.tags.map((t) => (
                <span key={t} className="inline-flex items-center gap-1 rounded-full bg-ld-secondary-container/50 px-2.5 py-1 text-ld-caption text-ld-on-secondary-container">
                  #{t}
                  <button type="button" onClick={() => setForm((f) => ({ ...f, tags: f.tags.filter((x) => x !== t) }))} aria-label={`Remove tag ${t}`} className="rounded-full hover:bg-ld-on-surface/10">
                    <X className="size-3" aria-hidden="true" />
                  </button>
                </span>
              ))}
              <input
                id={`${titleId}-tags`}
                type="text"
                value={tagText}
                onChange={(e) => setTagText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === ",") {
                    e.preventDefault();
                    addTag(tagText);
                  } else if (e.key === "Backspace" && !tagText && form.tags.length) {
                    setForm((f) => ({ ...f, tags: f.tags.slice(0, -1) }));
                  }
                }}
                placeholder={form.tags.length ? "" : "sunset, birthday, rainy-day…"}
                disabled={form.tags.length >= MEMORY_MAX_TAGS}
                className="min-w-[8rem] flex-1 bg-transparent py-1 text-ld-body-sm text-ld-on-surface placeholder:text-ld-outline focus:outline-none"
              />
              {tagText && (
                <button type="button" onClick={() => addTag(tagText)} className="inline-flex size-7 items-center justify-center rounded-full bg-ld-surface-container text-ld-on-surface" aria-label="Add tag">
                  <Plus className="size-3.5" aria-hidden="true" />
                </button>
              )}
            </div>
            <p className="text-[11px] text-ld-outline">Press Enter or comma to add. Up to {MEMORY_MAX_TAGS}.</p>
          </div>

          <div className="space-y-2">
            <label htmlFor={`${titleId}-caption`} className="text-ld-label-md font-medium text-ld-on-surface">The story</label>
            <textarea
              id={`${titleId}-caption`}
              rows={4}
              maxLength={2000}
              value={form.caption}
              onChange={(e) => setForm((f) => ({ ...f, caption: e.target.value }))}
              placeholder="What happened, what you said, what you will never forget…"
              className="w-full resize-none rounded-xl border border-ld-outline-variant bg-ld-surface-container-lowest px-4 py-3 font-display text-ld-body-md leading-relaxed text-ld-on-surface placeholder:text-ld-outline focus:border-ld-primary focus:outline-none focus:ring-2 focus:ring-ld-primary/25"
            />
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={form.favourite}
            onClick={() => setForm((f) => ({ ...f, favourite: !f.favourite }))}
            className={cn("flex w-fit items-center gap-2 rounded-full px-4 py-2 text-ld-label-sm transition-colors", form.favourite ? "bg-ld-primary text-ld-on-primary" : "bg-ld-surface-container text-ld-on-surface-variant hover:bg-ld-surface-container-high")}
          >
            <Star className={cn("size-4", form.favourite && "fill-current")} aria-hidden="true" />
            {form.favourite ? "Favourite" : "Mark as favourite"}
          </button>
        </div>

        {(error || progress) && (
          <div className="absolute inset-x-4 bottom-20 z-20 space-y-2">
            {progress && <p role="status" className="rounded-xl bg-ld-tertiary-fixed/70 px-4 py-2 text-ld-caption text-ld-on-tertiary-fixed-variant shadow-lg">{progress}</p>}
            {error && <p role="alert" className="rounded-xl bg-ld-error-container px-4 py-2 text-ld-caption text-ld-on-error-container shadow-lg">{error}</p>}
          </div>
        )}

        <footer className="flex items-center justify-between gap-3 border-t border-ld-on-surface/10 px-6 py-4">
          <span className="hidden text-ld-caption text-ld-on-surface-variant sm:inline">Ctrl + Enter to save</span>
          <button type="button" onClick={save} disabled={!canSave} className="ml-auto inline-flex h-11 items-center gap-2 rounded-full bg-ld-primary px-6 text-ld-label-md text-ld-on-primary shadow-[0_8px_20px_rgba(201,126,139,0.28)] transition-colors hover:bg-ld-on-primary-fixed-variant disabled:opacity-50">
            {saving ? "Saving…" : memory ? "Save changes" : "Keep this memory"}
          </button>
        </footer>
      </div>
    </div>
  );
}

function PhotoTile({ src, label, status, note, onRemove, disabled }: { src: string | null; label: string; status?: "compressing" | "ready" | "failed"; note?: string | null; onRemove: () => void; disabled: boolean }) {
  return (
    <div className="group relative aspect-square overflow-hidden rounded-2xl bg-ld-surface-container">
      {status === "compressing" && (
        <span role="status" className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-1 bg-ld-surface/80 text-[11px] text-ld-on-surface-variant">
          <span className="size-5 animate-spin rounded-full border-2 border-ld-primary border-t-transparent" aria-hidden="true" />
          Compressing…
        </span>
      )}
      {status === "failed" && (
        <span className="absolute inset-0 z-10 flex items-center justify-center bg-ld-error-container p-2 text-center text-[11px] text-ld-on-error-container">{note ?? "Could not prepare this photo."}</span>
      )}
      {status === "ready" && note && (
        <span className="absolute bottom-1.5 left-1.5 z-10 rounded-full bg-ld-surface/90 px-2 py-0.5 text-[10px] tabular-nums text-ld-on-surface">{note}</span>
      )}
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element -- short-lived signed or blob URLs
        <img src={src} alt={label} className="size-full object-cover" />
      ) : (
        <span className="flex size-full items-center justify-center text-[11px] text-ld-on-surface-variant">Photo unavailable</span>
      )}
      <button
        type="button"
        onClick={onRemove}
        disabled={disabled}
        aria-label={`Remove ${label}`}
        className="absolute right-1.5 top-1.5 inline-flex size-7 items-center justify-center rounded-full bg-ld-surface/90 text-ld-on-surface opacity-100 shadow-sm transition-opacity sm:opacity-0 sm:group-hover:opacity-100 disabled:opacity-40"
      >
        <Trash2 className="size-3.5" aria-hidden="true" />
      </button>
    </div>
  );
}

function initialForm(memory: MemoryDTO | null) {
  if (!memory) {
    return { title: "", caption: "", memoryDate: todayIso(), location: "", category: "EVERYDAY" as MemoryCategoryValue, tags: [] as string[], favourite: false };
  }
  return {
    title: memory.title,
    caption: memory.caption,
    memoryDate: memory.memoryDate,
    location: memory.location,
    category: memory.category,
    tags: memory.tags,
    favourite: memory.favourite,
  };
}
