"use client";

import { useConfirm } from "@/components/shared/use-confirm";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { Camera, Heart, Images, LayoutGrid, MapPin, Plus, Search, Sparkles, Star, X } from "lucide-react";
import { apiCall } from "@/components/onboarding/api-client";
import { AddMemoryModal } from "@/components/memories/add-memory-modal";
import { Pagination, usePagination } from "@/components/shared/pagination";
import { MEMORY_CATEGORY_ORDER, MEMORY_CATEGORY_STYLES } from "@/components/memories/memory-kinds";
import { MEMORY_UNDO_WINDOW_MS, type MemoriesPayload, type MemoryDTO } from "@/lib/memories-types";
import type { MemoryCategoryValue } from "@/lib/validations/memories";
import { cn } from "@/lib/utils";

type View = "grid" | "timeline";

interface Toast {
  id: number;
  message: string;
  action?: { label: string; run: () => void };
}

const dayFmt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" });
const monthFmt = new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric" });

function sortMemories(list: MemoryDTO[]) {
  return [...list].sort((a, b) => (b.memoryDate === a.memoryDate ? b.createdAt.localeCompare(a.createdAt) : b.memoryDate.localeCompare(a.memoryDate)));
}

type Period = "ALL" | "MONTH" | "THREE" | "YEAR";

const PERIOD_OPTIONS: { value: Period; label: string }[] = [
  { value: "ALL", label: "All time" },
  { value: "MONTH", label: "This month" },
  { value: "THREE", label: "Last 3 months" },
  { value: "YEAR", label: "This year" },
];

/** First day of the chosen range, as YYYY-MM-DD, or null for all time. */
function periodStartFor(period: Period, today: string): string | null {
  if (period === "ALL") return null;
  if (period === "MONTH") return `${today.slice(0, 7)}-01`;
  if (period === "YEAR") return `${today.slice(0, 4)}-01-01`;
  const d = new Date(`${today}T00:00:00Z`);
  d.setUTCMonth(d.getUTCMonth() - 3);
  return d.toISOString().slice(0, 10);
}

export function MemoriesBoard({ initial }: { initial: MemoriesPayload }) {
  const [memories, setMemories] = useState<MemoryDTO[]>(() => sortMemories(initial.memories));
  const [view, setView] = useState<View>("grid");
  const [category, setCategory] = useState<MemoryCategoryValue | "ALL">("ALL");
  const [favOnly, setFavOnly] = useState(false);
  const [year, setYear] = useState<string>("ALL");
  const [period, setPeriod] = useState<Period>("ALL");
  // The day the page was opened. Fixed for the session so the filters stay steady while it is used.
  const [today] = useState(() => new Date().toISOString().slice(0, 10));
  const [query, setQuery] = useState("");
  const [tag, setTag] = useState<string | null>(null);
  const [adding, setAdding] = useState<{ open: boolean; memory: MemoryDTO | null }>({ open: false, memory: null });
  const [formSeq, setFormSeq] = useState(0);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastCounter = useRef(0);
  const searchRef = useRef<HTMLInputElement>(null);

  const years = useMemo(() => Array.from(new Set(memories.map((m) => m.memoryDate.slice(0, 4)))).sort().reverse(), [memories]);
  const periodStart = periodStartFor(period, today);
  const allTags = useMemo(() => {
    const counts = new Map<string, number>();
    memories.forEach((m) => m.tags.forEach((t) => counts.set(t, (counts.get(t) ?? 0) + 1)));
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10).map(([t]) => t);
  }, [memories]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return memories.filter((m) => {
      if (category !== "ALL" && m.category !== category) return false;
      if (favOnly && !m.favourite) return false;
      if (year !== "ALL" && !m.memoryDate.startsWith(year)) return false;
      if (periodStart && m.memoryDate < periodStart) return false;
      if (tag && !m.tags.includes(tag)) return false;
      if (!q) return true;
      return m.title.toLowerCase().includes(q) || m.caption.toLowerCase().includes(q) || m.location.toLowerCase().includes(q) || m.tags.some((t) => t.includes(q));
    });
  }, [memories, category, favOnly, year, tag, query, periodStart]);
  const paged = usePagination(visible, `${category}|${favOnly}|${year}|${period}|${tag}|${query}`);

  const filtersOn = category !== "ALL" || favOnly || year !== "ALL" || period !== "ALL" || tag !== null || query.trim() !== "";

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement;
      const typing = target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable;
      if (adding.open || typing || e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === "n") {
        e.preventDefault();
        openForm(null);
      } else if (e.key === "/") {
        e.preventDefault();
        searchRef.current?.focus();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [adding.open]);

  function pushToast(toast: Omit<Toast, "id">, ms = 6000) {
    const id = ++toastCounter.current;
    setToasts((t) => [...t, { ...toast, id }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), ms);
  }

  function openForm(memory: MemoryDTO | null) {
    setFormSeq((s) => s + 1);
    setAdding({ open: true, memory });
  }

  function onSaved(saved: MemoryDTO) {
    setMemories((prev) => sortMemories(adding.memory ? prev.map((m) => (m.id === saved.id ? saved : m)) : [saved, ...prev.filter((m) => m.id !== saved.id)]));
    setAdding({ open: false, memory: null });
    pushToast({ message: adding.memory ? "Memory updated." : "Kept safe. Your partner can see it now." }, 3500);
  }

  async function toggleFavourite(m: MemoryDTO) {
    setMemories((prev) => prev.map((x) => (x.id === m.id ? { ...x, favourite: !x.favourite } : x)));
    const result = await apiCall<{ memory: MemoryDTO }>(`/api/memories/${m.id}`, { method: "PATCH", body: { favourite: !m.favourite } });
    if (!result.ok) {
      setMemories((prev) => prev.map((x) => (x.id === m.id ? m : x)));
      pushToast({ message: result.error.message });
    }
  }

  const { confirm, dialog } = useConfirm();
  async function removeMemory(m: MemoryDTO) {
    if (!(await confirm({ title: "Delete this memory?", description: "Its photos and details will disappear for both of you. You can undo this for a few minutes.", confirmLabel: "Delete" }))) return;
    setMemories((prev) => prev.filter((x) => x.id !== m.id));
    const result = await apiCall<{ deleted: boolean }>(`/api/memories/${m.id}`, { method: "DELETE" });
    if (!result.ok) {
      setMemories((prev) => sortMemories([m, ...prev]));
      pushToast({ message: result.error.message });
      return;
    }
    pushToast(
      {
        message: `"${m.title}" was moved to the bin.`,
        action: {
          label: "Undo",
          run: async () => {
            const restored = await apiCall<{ memory: MemoryDTO }>(`/api/memories/${m.id}/restore`, { method: "POST" });
            if (restored.ok) {
              setMemories((prev) => sortMemories([restored.data.memory, ...prev]));
              pushToast({ message: "Memory restored." }, 2500);
            } else {
              pushToast({ message: "This memory can no longer be restored." });
            }
          },
        },
      },
      8000
    );
  }

  return (
    <div className="space-y-8">
      {dialog}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <p className="max-w-xl text-ld-body-md text-ld-on-surface-variant">
          Photos with the stories behind them. Keep the small moments as well as the big ones.
        </p>
        <button type="button" onClick={() => openForm(null)} className="hidden h-12 items-center gap-2 rounded-full bg-ld-primary px-6 text-ld-label-md text-ld-on-primary shadow-[0_8px_20px_rgba(201,126,139,0.28)] transition-colors hover:bg-ld-on-primary-fixed-variant lg:inline-flex">
          <Plus className="size-5" aria-hidden="true" />
          Add a memory
        </button>
      </header>

      {memories.length === 0 ? (
        <EmptyMemories onAdd={() => openForm(null)} />
      ) : (
        <>
          {/* Toolbar */}
          <div className="space-y-3">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <label className="relative flex h-10 w-full items-center md:max-w-sm">
                <span className="sr-only">Search memories</span>
                <Search className="pointer-events-none absolute left-4 size-4 text-ld-on-surface-variant" aria-hidden="true" />
                <input
                  ref={searchRef}
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by title, place or story  ( / )"
                  className="h-10 w-full rounded-full border border-ld-outline-variant bg-ld-surface-container-lowest pl-11 pr-4 text-ld-body-sm text-ld-on-surface placeholder:text-ld-outline focus:border-ld-primary focus:outline-none focus:ring-2 focus:ring-ld-primary/25"
                />
              </label>
              <div className="flex items-center gap-2">
                <div role="radiogroup" aria-label="View" className="inline-flex gap-1 rounded-full bg-ld-surface-container p-1">
                  {([["grid", LayoutGrid, "Grid"], ["timeline", Camera, "Timeline"]] as const).map(([v, Icon, label]) => (
                    <button key={v} type="button" role="radio" aria-checked={view === v} onClick={() => setView(v)} className={cn("inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-ld-label-sm transition-colors", view === v ? "bg-ld-surface-container-lowest text-ld-on-surface shadow-sm" : "text-ld-on-surface-variant")}>
                      <Icon className="size-3.5" aria-hidden="true" />
                      {label}
                    </button>
                  ))}
                </div>
                <select
                  aria-label="Filter by year"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="h-10 rounded-full border border-ld-outline-variant bg-ld-surface-container-lowest px-4 text-ld-label-sm text-ld-on-surface focus:border-ld-primary focus:outline-none"
                >
                  <option value="ALL">All years</option>
                  {years.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
            </div>

            <div role="radiogroup" aria-label="Date range" className="flex flex-wrap items-center gap-2">
              {PERIOD_OPTIONS.map((o) => (
                <button key={o.value} type="button" role="radio" aria-checked={period === o.value} onClick={() => setPeriod(o.value)} className={cn("rounded-full px-3.5 py-1.5 text-ld-label-sm transition-colors", period === o.value ? "bg-ld-primary text-ld-on-primary" : "bg-ld-surface-container-lowest text-ld-on-surface ring-1 ring-ld-outline-variant/50 hover:bg-ld-surface")}>
                  {o.label}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Chip active={favOnly} onClick={() => setFavOnly((v) => !v)}>
                <Star className={cn("size-3.5", favOnly && "fill-current")} aria-hidden="true" />
                Favourites
              </Chip>
              <span aria-hidden="true" className="mx-1 h-5 w-px bg-ld-outline-variant" />
              <Chip active={category === "ALL"} onClick={() => setCategory("ALL")}>All</Chip>
              {MEMORY_CATEGORY_ORDER.map((c) => (
                <Chip key={c} active={category === c} onClick={() => setCategory(c)}>{MEMORY_CATEGORY_STYLES[c].label}</Chip>
              ))}
              {allTags.length > 0 && <span aria-hidden="true" className="mx-1 h-5 w-px bg-ld-outline-variant" />}
              {allTags.map((t) => (
                <Chip key={t} active={tag === t} onClick={() => setTag(tag === t ? null : t)}>#{t}</Chip>
              ))}
              {filtersOn && (
                <button type="button" onClick={() => { setCategory("ALL"); setFavOnly(false); setYear("ALL"); setPeriod("ALL"); setTag(null); setQuery(""); }} className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-ld-caption text-ld-primary hover:underline">
                  <X className="size-3.5" aria-hidden="true" />
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Content */}
          {visible.length === 0 ? (
            <div role="status" className="rounded-3xl border border-dashed border-ld-outline-variant px-6 py-14 text-center">
              <p className="font-display text-ld-headline-md text-ld-on-surface">No memories match that yet.</p>
              <p className="mt-2 text-ld-body-sm text-ld-on-surface-variant">Try another filter, or clear the search.</p>
            </div>
          ) : view === "grid" ? (
            <ul className="columns-1 gap-5 sm:columns-2 xl:columns-3" aria-label="Memories">
              {paged.pageItems.map((m) => (
                <li key={m.id}>
                  <MemoryCard memory={m} onFavourite={() => toggleFavourite(m)} onDelete={() => removeMemory(m)} onTagClick={(t) => setTag(t)} />
                </li>
              ))}
            </ul>
          ) : (
            <Timeline memories={paged.pageItems} onFavourite={toggleFavourite} />
          )}
          {visible.length > 0 && (
            <Pagination
              page={paged.page}
              totalPages={paged.totalPages}
              total={paged.total}
              pageSize={paged.pageSize}
              start={paged.start}
              setPage={paged.setPage}
              label="Memories pages"
            />
          )}
        </>
      )}

      <button type="button" onClick={() => openForm(null)} aria-label="Add a memory" className="fixed bottom-24 right-5 z-40 inline-flex size-14 items-center justify-center rounded-full bg-ld-primary text-ld-on-primary shadow-[0_12px_30px_-8px_rgba(201,126,139,0.7)] transition-transform active:scale-95 lg:hidden">
        <Plus className="size-6" aria-hidden="true" />
      </button>

      <AddMemoryModal
        key={formSeq}
        open={adding.open}
        workspaceId={initial.workspaceId}
        memory={adding.memory}
        onClose={() => setAdding({ open: false, memory: null })}
        onSaved={onSaved}
      />

      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-24 z-[95] flex flex-col items-center gap-2 px-4 lg:bottom-6">
        {toasts.map((t) => (
          <div key={t.id} role="status" className="pointer-events-auto flex max-w-md items-center gap-4 rounded-full bg-ld-on-surface px-5 py-3 text-ld-body-sm text-ld-surface shadow-[0_16px_40px_-16px_rgba(33,26,21,0.6)] animate-in fade-in slide-in-from-bottom-2 duration-300">
            <Sparkles className="size-4 shrink-0 text-ld-primary-container" aria-hidden="true" />
            <span className="min-w-0 flex-1 truncate">{t.message}</span>
            {t.action && (
              <button type="button" onClick={() => { t.action?.run(); setToasts((prev) => prev.filter((x) => x.id !== t.id)); }} className="shrink-0 rounded-full bg-ld-primary-container px-3 py-1 text-ld-label-sm font-semibold text-ld-on-primary hover:bg-ld-primary">
                {t.action.label}
              </button>
            )}
          </div>
        ))}
      </div>
      <span className="sr-only">Undo stays available for {Math.round(MEMORY_UNDO_WINDOW_MS / 60000)} minutes after a delete.</span>
    </div>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" aria-pressed={active} onClick={onClick} className={cn("inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-ld-caption transition-colors", active ? "bg-ld-on-surface text-ld-surface" : "bg-ld-surface-container text-ld-on-surface-variant hover:bg-ld-surface-container-high")}>
      {children}
    </button>
  );
}

function MemoryCard({ memory, onFavourite, onDelete, onTagClick }: { memory: MemoryDTO; onFavourite: () => void; onDelete: () => void; onTagClick: (t: string) => void }) {
  const cover = memory.media[0];
  const style = MEMORY_CATEGORY_STYLES[memory.category];
  const pending = memory.id.startsWith("tmp-");
  return (
    <article aria-busy={pending} className={cn("group mb-5 break-inside-avoid overflow-hidden rounded-3xl bg-ld-surface-container-lowest shadow-sm ring-1 ring-ld-on-surface/5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_44px_-24px_rgba(64,56,50,0.4)]", pending && "opacity-70")}>
      <Link href={`/app/memories/${memory.id}`} className="relative block bg-ld-surface-container focus:outline-none focus-visible:ring-2 focus-visible:ring-ld-primary">
        {cover?.url ? (
          <div className="aspect-[4/3] w-full overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element -- short-lived signed URLs from private storage */}
            <img src={cover.url} alt={memory.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]" />
          </div>
        ) : (
          <div className="flex aspect-[4/3] w-full items-center justify-center bg-gradient-to-br from-ld-secondary-container to-ld-tertiary-fixed text-ld-on-surface-variant">
            <Images className="size-8 opacity-60" aria-hidden="true" />
          </div>
        )}
        {memory.media.length > 1 && (
          <span className="absolute bottom-3 left-3 rounded-full bg-ld-surface/90 px-2.5 py-1 text-[11px] text-ld-on-surface">{memory.media.length} photos</span>
        )}
        <span className={cn("absolute left-3 top-3 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium", style.tint)}>
          <style.icon className="size-3" aria-hidden="true" />
          {style.label}
        </span>
      </Link>

      <div className="space-y-2 p-5">
        <div className="flex items-start justify-between gap-3">
          <Link href={`/app/memories/${memory.id}`} className="font-display text-ld-title-lg leading-snug text-ld-on-surface hover:text-ld-primary">{memory.title}</Link>
          <button type="button" onClick={onFavourite} disabled={pending} aria-pressed={memory.favourite} aria-label={memory.favourite ? "Remove from favourites" : "Add to favourites"} className="inline-flex size-9 shrink-0 items-center justify-center rounded-full text-ld-primary hover:bg-ld-primary/10 disabled:opacity-40">
            <Heart className={cn("size-4", memory.favourite && "fill-current")} aria-hidden="true" />
          </button>
        </div>
        <p className="flex flex-wrap items-center gap-x-2 text-ld-caption text-ld-on-surface-variant">
          {dayFmt.format(new Date(`${memory.memoryDate}T00:00:00Z`))}
          {memory.location && (
            <>
              <span aria-hidden="true">·</span>
              <MapPin className="size-3" aria-hidden="true" />
              {memory.location}
            </>
          )}
        </p>
        {memory.caption && <p className="line-clamp-3 text-ld-body-sm leading-relaxed text-ld-on-surface-variant">{memory.caption}</p>}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          <div className="flex flex-wrap gap-1.5">
            {memory.tags.slice(0, 4).map((t) => (
              <button key={t} type="button" onClick={() => onTagClick(t)} className="rounded-full bg-ld-surface-container px-2 py-0.5 text-[11px] text-ld-on-surface-variant hover:bg-ld-surface-container-high">#{t}</button>
            ))}
          </div>
          <button type="button" onClick={onDelete} disabled={pending} className="text-[11px] text-ld-outline hover:text-ld-error disabled:opacity-40">Delete</button>
        </div>
      </div>
    </article>
  );
}

function Timeline({ memories, onFavourite }: { memories: MemoryDTO[]; onFavourite: (m: MemoryDTO) => void }) {
  const groups = useMemo(() => {
    const map = new Map<string, MemoryDTO[]>();
    memories.forEach((m) => {
      const key = m.memoryDate.slice(0, 7);
      map.set(key, [...(map.get(key) ?? []), m]);
    });
    return [...map.entries()];
  }, [memories]);

  return (
    <ol className="relative space-y-10 border-l border-ld-outline-variant/60 pl-6 md:pl-10" aria-label="Timeline">
      {groups.map(([key, list]) => (
        <li key={key} className="space-y-5">
          <span aria-hidden="true" className="absolute -left-[7px] mt-1.5 size-3.5 rounded-full bg-ld-primary ring-4 ring-ld-surface" />
          <h2 className="font-display text-ld-headline-md text-ld-on-surface">{monthFmt.format(new Date(`${key}-01T00:00:00Z`))}</h2>
          <ul className="space-y-2">
            {list.map((m) => (
              <li key={m.id}>
                <TimelineRow memory={m} onFavourite={() => onFavourite(m)} />
              </li>
            ))}
          </ul>
        </li>
      ))}
    </ol>
  );
}

/** One memory as a slim row: a small thumbnail, the title, the date and place. Opens the full memory. */
function TimelineRow({ memory, onFavourite }: { memory: MemoryDTO; onFavourite: () => void }) {
  const cover = memory.media[0];
  return (
    <article className="flex items-center gap-3 rounded-2xl bg-ld-surface-container-lowest p-2.5 pr-3 shadow-sm ring-1 ring-ld-on-surface/5">
      <Link href={`/app/memories/${memory.id}`} className="flex min-w-0 flex-1 items-center gap-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-ld-primary rounded-xl">
        <span className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-ld-secondary-container to-ld-tertiary-fixed text-ld-on-surface-variant">
          {cover?.url ? (
            // eslint-disable-next-line @next/next/no-img-element -- small signed thumbnail from private storage
            <img src={cover.url} alt="" loading="lazy" className="size-full object-cover" />
          ) : (
            <Images className="size-4 opacity-60" aria-hidden="true" />
          )}
        </span>
        <span className="min-w-0">
          <span className="block truncate font-display text-ld-body-md text-ld-on-surface">{memory.title}</span>
          <span className="block truncate text-ld-caption text-ld-on-surface-variant">
            {dayFmt.format(new Date(`${memory.memoryDate}T00:00:00Z`))}
            {memory.location ? ` · ${memory.location}` : ""}
          </span>
        </span>
      </Link>
      <button type="button" onClick={onFavourite} aria-pressed={memory.favourite} aria-label={memory.favourite ? "Remove from favourites" : "Add to favourites"} className="inline-flex size-8 shrink-0 items-center justify-center rounded-full text-ld-primary hover:bg-ld-primary/10">
        <Heart className={cn("size-3.5", memory.favourite && "fill-current")} aria-hidden="true" />
      </button>
    </article>
  );
}

function EmptyMemories({ onAdd }: { onAdd: () => void }) {
  return (
    <section aria-labelledby="memories-empty" className="relative overflow-hidden rounded-3xl bg-ld-surface-container-lowest px-6 py-16 text-center shadow-sm">
      <div aria-hidden="true" className="pointer-events-none absolute -left-16 -top-16 size-64 rounded-full bg-ld-secondary-container/40 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-20 -right-10 size-64 rounded-full bg-ld-tertiary-fixed/50 blur-3xl" />
      <div className="relative flex flex-col items-center gap-5">
        <span className="flex size-16 items-center justify-center rounded-full bg-ld-secondary-container/50 text-ld-primary">
          <Camera className="size-7" aria-hidden="true" />
        </span>
        <div className="space-y-2">
          <h2 id="memories-empty" className="font-display text-ld-headline-md text-ld-on-surface">Your story starts with a memory.</h2>
          <p className="mx-auto max-w-md text-ld-body-sm text-ld-on-surface-variant">
            Add a photo from your last trip, a rainy Sunday, or the first time you cooked together. Add a line about it. Years from now, that line will matter most.
          </p>
        </div>
        <button type="button" onClick={onAdd} className="inline-flex h-12 items-center gap-2 rounded-full bg-ld-primary px-6 text-ld-label-md text-ld-on-primary shadow-[0_8px_20px_rgba(201,126,139,0.28)] transition-colors hover:bg-ld-on-primary-fixed-variant">
          <Plus className="size-5" aria-hidden="true" />
          Add your first memory
        </button>
      </div>
    </section>
  );
}
