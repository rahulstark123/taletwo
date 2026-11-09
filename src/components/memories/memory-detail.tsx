"use client";

import { useConfirm } from "@/components/shared/use-confirm";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, ChevronLeft, ChevronRight, MapPin, Pencil, Star, Trash2 } from "lucide-react";
import { apiCall } from "@/components/onboarding/api-client";
import { AddMemoryModal } from "@/components/memories/add-memory-modal";
import { MEMORY_CATEGORY_STYLES } from "@/components/memories/memory-kinds";
import type { MemoryDTO } from "@/lib/memories-types";
import { cn } from "@/lib/utils";

const longDate = new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

/** Full memory: a photo viewer with keyboard support, the story, and the actions for it. */
export function MemoryDetail({ initial, workspaceId }: { initial: MemoryDTO; workspaceId: number }) {
  const router = useRouter();
  const [memory, setMemory] = useState<MemoryDTO>(initial);
  const [index, setIndex] = useState(0);
  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const photos = memory.media;
  const current = photos[index];
  const style = MEMORY_CATEGORY_STYLES[memory.category];

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (editing) return;
      if (e.key === "ArrowRight") setIndex((i) => Math.min(photos.length - 1, i + 1));
      if (e.key === "ArrowLeft") setIndex((i) => Math.max(0, i - 1));
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [photos.length, editing]);

  async function toggleFavourite() {
    const before = memory;
    setMemory({ ...memory, favourite: !memory.favourite });
    const result = await apiCall<{ memory: MemoryDTO }>(`/api/memories/${memory.id}`, { method: "PATCH", body: { favourite: !memory.favourite } });
    if (!result.ok) {
      setMemory(before);
      setMessage(result.error.message);
    }
  }

  const { confirm, dialog } = useConfirm();
  async function remove() {
    if (!(await confirm({ title: "Delete this memory?", description: "Its photos and details will disappear for both of you. You can undo this for a few minutes.", confirmLabel: "Delete" }))) return;
    setDeleting(true);
    const result = await apiCall<{ deleted: boolean }>(`/api/memories/${memory.id}`, { method: "DELETE" });
    if (!result.ok) {
      setDeleting(false);
      setMessage(result.error.message);
      return;
    }
    router.push("/app/memories");
    router.refresh();
  }

  return (
    <div className="space-y-6">
      {dialog}
      <Link href="/app/memories" className="inline-flex items-center gap-2 text-ld-label-sm text-ld-on-surface-variant hover:text-ld-on-surface">
        <ArrowLeft className="size-4" aria-hidden="true" />
        All memories
      </Link>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        {/* Viewer */}
        <section aria-label="Photos" className="space-y-3">
          <div className="relative overflow-hidden rounded-3xl bg-ld-on-surface shadow-[0_24px_60px_-28px_rgba(33,26,21,0.6)]">
            {current?.url ? (
              // eslint-disable-next-line @next/next/no-img-element -- short-lived signed URL from private storage
              <img key={current.id} src={current.url} alt={`${memory.title}, photo ${index + 1} of ${photos.length}`} className="max-h-[70dvh] w-full object-contain animate-in fade-in duration-500" />
            ) : (
              <div className="flex aspect-[4/3] w-full items-center justify-center text-ld-surface/70">This photo is unavailable right now.</div>
            )}
            {photos.length > 1 && (
              <>
                <button type="button" onClick={() => setIndex((i) => Math.max(0, i - 1))} disabled={index === 0} aria-label="Previous photo" className="absolute left-3 top-1/2 -translate-y-1/2 inline-flex size-10 items-center justify-center rounded-full bg-ld-surface/85 text-ld-on-surface shadow-md disabled:opacity-30">
                  <ChevronLeft className="size-5" aria-hidden="true" />
                </button>
                <button type="button" onClick={() => setIndex((i) => Math.min(photos.length - 1, i + 1))} disabled={index === photos.length - 1} aria-label="Next photo" className="absolute right-3 top-1/2 -translate-y-1/2 inline-flex size-10 items-center justify-center rounded-full bg-ld-surface/85 text-ld-on-surface shadow-md disabled:opacity-30">
                  <ChevronRight className="size-5" aria-hidden="true" />
                </button>
                <span className="absolute bottom-3 right-3 rounded-full bg-ld-surface/85 px-3 py-1 text-[11px] tabular-nums text-ld-on-surface">{index + 1} / {photos.length}</span>
              </>
            )}
          </div>
          {photos.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Choose a photo">
              {photos.map((p, i) => (
                <button key={p.id} type="button" role="tab" aria-selected={i === index} aria-label={`Photo ${i + 1}`} onClick={() => setIndex(i)} className={cn("size-16 shrink-0 overflow-hidden rounded-xl ring-2 transition-all", i === index ? "ring-ld-primary" : "ring-transparent opacity-70 hover:opacity-100")}>
                  {p.url ? (
                    // eslint-disable-next-line @next/next/no-img-element -- thumbnail of a signed URL
                    <img src={p.url} alt="" className="size-full object-cover" />
                  ) : (
                    <span className="flex size-full items-center justify-center bg-ld-surface-container text-[10px]">n/a</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </section>

        {/* Story */}
        <section aria-labelledby="memory-title" className="flex flex-col gap-6 rounded-3xl bg-ld-surface-container-lowest p-7 shadow-sm">
          <div className="space-y-3">
            <span className={cn("inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1 text-ld-caption font-medium", style.tint)}>
              <style.icon className="size-3.5" aria-hidden="true" />
              {style.label}
            </span>
            <h1 id="memory-title" className="font-display text-ld-headline-lg-mobile text-ld-on-surface md:text-ld-headline-lg">{memory.title}</h1>
            <p className="text-ld-body-sm text-ld-on-surface-variant">
              {longDate.format(new Date(`${memory.memoryDate}T00:00:00Z`))}
              {memory.location && (
                <span className="inline-flex items-center gap-1">
                  <span aria-hidden="true"> · </span>
                  <MapPin className="size-3.5" aria-hidden="true" />
                  {memory.location}
                </span>
              )}
            </p>
          </div>

          {memory.caption ? (
            <p className="whitespace-pre-wrap font-display text-ld-body-lg leading-[1.9] text-ld-on-surface">{memory.caption}</p>
          ) : (
            <p className="text-ld-body-sm italic text-ld-on-surface-variant">No story yet. Add one, so this moment stays with the photos.</p>
          )}

          {memory.tags.length > 0 && (
            <ul className="flex flex-wrap gap-2" aria-label="Tags">
              {memory.tags.map((t) => (
                <li key={t} className="rounded-full bg-ld-surface-container px-3 py-1 text-ld-caption text-ld-on-surface-variant">#{t}</li>
              ))}
            </ul>
          )}

          <p className="text-ld-caption text-ld-outline">Added by {memory.createdByName}</p>

          <div className="mt-auto flex flex-wrap gap-2 border-t border-ld-on-surface/5 pt-5">
            <button type="button" onClick={toggleFavourite} aria-pressed={memory.favourite} className={cn("inline-flex h-10 items-center gap-2 rounded-full px-4 text-ld-label-sm transition-colors", memory.favourite ? "bg-ld-primary text-ld-on-primary" : "bg-ld-surface-container text-ld-on-surface hover:bg-ld-surface-container-high")}>
              <Star className={cn("size-4", memory.favourite && "fill-current")} aria-hidden="true" />
              Favourite
            </button>
            <button type="button" onClick={() => setEditing(true)} className="inline-flex h-10 items-center gap-2 rounded-full bg-ld-surface-container px-4 text-ld-label-sm text-ld-on-surface hover:bg-ld-surface-container-high">
              <Pencil className="size-4" aria-hidden="true" />
              Edit
            </button>
            <button type="button" onClick={remove} disabled={deleting} className="inline-flex h-10 items-center gap-2 rounded-full px-4 text-ld-label-sm text-ld-on-surface-variant hover:bg-ld-error/10 hover:text-ld-error disabled:opacity-40">
              <Trash2 className="size-4" aria-hidden="true" />
              {deleting ? "Removing…" : "Delete"}
            </button>
          </div>
          {message && <p role="alert" className="rounded-xl bg-ld-error-container px-4 py-2 text-ld-caption text-ld-on-error-container">{message}</p>}
        </section>
      </div>

      <AddMemoryModal
        open={editing}
        workspaceId={workspaceId}
        memory={memory}
        onClose={() => setEditing(false)}
        onSaved={(saved) => {
          setMemory(saved);
          setIndex(0);
          setEditing(false);
          router.refresh();
        }}
      />
    </div>
  );
}
