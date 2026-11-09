"use client";

import { useConfirm } from "@/components/shared/use-confirm";
import { useEffect, useMemo, useRef, useState } from "react";
import { CalendarDays, Check, Dices, Heart, Pencil, Plus, Quote, Search, Sparkles, Trash2, X } from "lucide-react";
import { apiCall } from "@/components/onboarding/api-client";
import { BucketCompleteModal } from "@/components/bucket/bucket-complete-modal";
import { BucketEditorModal, type BucketDraft } from "@/components/bucket/bucket-editor-modal";
import { Pagination, usePagination } from "@/components/shared/pagination";
import { CATEGORY_ORDER, CATEGORY_STYLES, PRIORITY_STYLES } from "@/components/bucket/bucket-kinds";
import type { BucketItemDTO, BucketPayload } from "@/lib/bucket-types";
import { BUCKET_UNDO_WINDOW_MS } from "@/lib/bucket-types";
import type { BucketCategoryValue } from "@/lib/validations/bucket";
import { cn } from "@/lib/utils";

type Tab = "PENDING" | "COMPLETED";

interface Toast {
  id: number;
  message: string;
  action?: { label: string; run: () => void };
}

const dayFmt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" });

/** "Aim for 14 Dec · in 36 days" style label for a target date, or null. */
function targetLabel(target: string | null, now: number) {
  if (!target) return null;
  const date = new Date(`${target}T00:00:00Z`);
  const days = Math.ceil((date.getTime() - now) / 86_400_000);
  const when = days < 0 ? "passed" : days === 0 ? "today" : days === 1 ? "tomorrow" : `in ${days} days`;
  return `${dayFmt.format(date)} · ${when}`;
}

export function BucketBoard({ initial }: { initial: BucketPayload }) {
  const [items, setItems] = useState<BucketItemDTO[]>(initial.items);
  const [tab, setTab] = useState<Tab>("PENDING");
  const [category, setCategory] = useState<BucketCategoryValue | "ALL">("ALL");
  const [query, setQuery] = useState("");
  const [pick, setPick] = useState<string | null>(null);
  const [editing, setEditing] = useState<{ open: boolean; item: BucketItemDTO | null }>({ open: false, item: null });
  const [completing, setCompleting] = useState<BucketItemDTO | null>(null);
  const [openSeq, setOpenSeq] = useState(0);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [now, setNow] = useState(0);
  const toastCounter = useRef(0);

  useEffect(() => {
    const tick = () => setNow(Date.now());
    const first = setTimeout(tick, 0);
    const timer = setInterval(tick, 60_000);
    return () => {
      clearTimeout(first);
      clearInterval(timer);
    };
  }, []);

  const total = items.length;
  const done = items.filter((i) => i.completedAt).length;
  const percent = total ? Math.round((done / total) * 100) : 0;

  const byCategory = useMemo(() => {
    return CATEGORY_ORDER.map((c) => {
      const inCat = items.filter((i) => i.category === c);
      return { key: c, total: inCat.length, done: inCat.filter((i) => i.completedAt).length };
    });
  }, [items]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items
      .filter((i) => (tab === "PENDING" ? !i.completedAt : !!i.completedAt))
      .filter((i) => category === "ALL" || i.category === category)
      .filter((i) => !q || i.title.toLowerCase().includes(q) || i.description.toLowerCase().includes(q))
      .sort((a, b) => {
        if (tab === "COMPLETED") return (b.completedAt ?? "").localeCompare(a.completedAt ?? "");
        const rank = { MUST: 0, SOON: 1, SOMEDAY: 2 };
        if (rank[a.priority] !== rank[b.priority]) return rank[a.priority] - rank[b.priority];
        return (a.targetDate ?? "9999").localeCompare(b.targetDate ?? "9999");
      });
  }, [items, tab, category, query]);
  const paged = usePagination(visible, `${tab}|${category}|${query}`);

  const pickedItem = items.find((i) => i.id === pick) ?? null;

  function pushToast(toast: Omit<Toast, "id">, ms = 6000) {
    const id = ++toastCounter.current;
    setToasts((t) => [...t, { ...toast, id }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), ms);
  }

  /** Random open dream, so a couple can decide together instead of scrolling. */
  function pickForUs() {
    const open = items.filter((i) => !i.completedAt);
    if (open.length === 0) return pushToast({ message: "Everything is ticked off. Time to dream again." });
    const choice = open[Math.floor(Math.random() * open.length)];
    setPick(choice.id);
    setTab("PENDING");
    setCategory("ALL");
    setQuery("");
  }

  function openEditor(item: BucketItemDTO | null) {
    setOpenSeq((s) => s + 1);
    setEditing({ open: true, item });
  }

  async function saveDraft(draft: BucketDraft) {
    if (editing.item) {
      const before = editing.item;
      const optimistic = { ...before, ...draft, updatedAt: new Date().toISOString() };
      setItems((prev) => prev.map((i) => (i.id === before.id ? optimistic : i)));
      const result = await apiCall<{ item: BucketItemDTO }>(`/api/bucket-list/${before.id}`, { method: "PATCH", body: draft });
      if (!result.ok) {
        setItems((prev) => prev.map((i) => (i.id === before.id ? before : i)));
        throw new Error(result.error.message);
      }
      setItems((prev) => prev.map((i) => (i.id === before.id ? result.data.item : i)));
      setEditing({ open: false, item: null });
      pushToast({ message: "Dream updated." }, 2500);
      return;
    }

    const tempId = `tmp-${crypto.randomUUID()}`;
    const stamp = new Date().toISOString();
    const optimistic: BucketItemDTO = {
      id: tempId,
      title: draft.title,
      description: draft.description,
      category: draft.category,
      priority: draft.priority,
      targetDate: draft.targetDate,
      completedAt: null,
      completionMemory: "",
      createdById: initial.currentUserId,
      createdByName: "You",
      isMine: true,
      createdAt: stamp,
      updatedAt: stamp,
    };
    setItems((prev) => [optimistic, ...prev]);
    setEditing({ open: false, item: null });
    setTab("PENDING");
    const result = await apiCall<{ item: BucketItemDTO }>("/api/bucket-list", { method: "POST", body: draft });
    if (!result.ok) {
      setItems((prev) => prev.filter((i) => i.id !== tempId));
      pushToast({ message: result.error.message });
      return;
    }
    setItems((prev) => prev.map((i) => (i.id === tempId ? result.data.item : i)));
    pushToast({ message: "Added to your list. Here is to dreaming together." }, 3500);
  }

  async function complete(item: BucketItemDTO, input: { completedOn: string; completionMemory: string }) {
    const result = await apiCall<{ item: BucketItemDTO }>(`/api/bucket-list/${item.id}`, { method: "PUT", body: { completed: true, ...input } });
    if (!result.ok) throw new Error(result.error.message);
    setItems((prev) => prev.map((i) => (i.id === item.id ? result.data.item : i)));
    setCompleting(null);
    setPick((p) => (p === item.id ? null : p));
    pushToast({ message: `"${item.title}" is done. Look at you two.` }, 4000);
  }

  async function undoComplete(item: BucketItemDTO) {
    const result = await apiCall<{ item: BucketItemDTO }>(`/api/bucket-list/${item.id}`, { method: "PUT", body: { completed: false } });
    if (!result.ok) throw new Error(result.error.message);
    setItems((prev) => prev.map((i) => (i.id === item.id ? result.data.item : i)));
    setCompleting(null);
    pushToast({ message: "Back on the list." }, 2500);
  }

  const { confirm, dialog } = useConfirm();
  async function removeItem(item: BucketItemDTO) {
    if (!(await confirm({ title: "Delete this dream?", description: "It will disappear from your bucket list for both of you. You can undo this for a few minutes.", confirmLabel: "Delete" }))) return;
    setItems((prev) => prev.filter((i) => i.id !== item.id));
    const result = await apiCall<{ deleted: boolean }>(`/api/bucket-list/${item.id}`, { method: "DELETE" });
    if (!result.ok) {
      setItems((prev) => [item, ...prev]);
      pushToast({ message: result.error.message });
      return;
    }
    pushToast(
      {
        message: `"${item.title}" was removed.`,
        action: {
          label: "Undo",
          run: async () => {
            const restored = await apiCall<{ item: BucketItemDTO }>(`/api/bucket-list/${item.id}/restore`, { method: "POST" });
            if (restored.ok) {
              setItems((prev) => [restored.data.item, ...prev]);
              pushToast({ message: "Dream restored." }, 2500);
            } else {
              pushToast({ message: "This dream can no longer be restored." });
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
          The things you want to do together, one day, or this year. Tick them off and keep the memory of how it went.
        </p>
        <div className="hidden items-center gap-2 lg:flex">
          <button type="button" onClick={pickForUs} className="inline-flex h-12 items-center gap-2 rounded-full bg-ld-surface-container px-5 text-ld-label-md text-ld-on-surface transition-colors hover:bg-ld-surface-container-high">
            <Dices className="size-5 text-ld-primary" aria-hidden="true" />
            Pick one for us
          </button>
          <button type="button" onClick={() => openEditor(null)} className="inline-flex h-12 items-center gap-2 rounded-full bg-ld-primary px-6 text-ld-label-md text-ld-on-primary shadow-[0_8px_20px_rgba(201,126,139,0.28)] transition-colors hover:bg-ld-on-primary-fixed-variant">
            <Plus className="size-5" aria-hidden="true" />
            Add a dream
          </button>
        </div>
      </header>

      {/* Progress */}
      <section aria-labelledby="progress-title" className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)]">
        <div className="flex items-center gap-6 rounded-3xl bg-ld-surface-container-lowest p-6 shadow-sm">
          <Ring percent={percent} />
          <div className="space-y-1">
            <h2 id="progress-title" className="text-ld-label-sm font-semibold uppercase tracking-widest text-ld-primary">Your progress</h2>
            <p className="font-display text-ld-headline-md text-ld-on-surface">{done} of {total} dreams done</p>
            <p className="text-ld-caption text-ld-on-surface-variant">
              {total === 0 ? "Start with one small dream." : done === total ? "Everything ticked. Dream bigger." : `${total - done} still waiting for you two.`}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {byCategory.map((c) => {
            const s = CATEGORY_STYLES[c.key];
            const pct = c.total ? Math.round((c.done / c.total) * 100) : 0;
            const active = category === c.key;
            return (
              <button
                key={c.key}
                type="button"
                aria-pressed={active}
                onClick={() => setCategory(active ? "ALL" : c.key)}
                className={cn("flex flex-col gap-2 rounded-2xl bg-gradient-to-br p-4 text-left shadow-sm ring-1 ring-ld-on-surface/5 transition-all hover:-translate-y-0.5", s.cover, active && "ring-2 ring-ld-primary")}
              >
                <span className="flex items-center justify-between gap-2">
                  <s.icon className="size-4 text-ld-primary" aria-hidden="true" />
                  <span className="text-[11px] tabular-nums text-ld-on-surface-variant">{c.done}/{c.total}</span>
                </span>
                <span className="text-ld-label-sm font-semibold text-ld-on-surface">{s.label}</span>
                <span className="h-1 overflow-hidden rounded-full bg-ld-on-surface/10">
                  <span className="block h-full rounded-full bg-ld-primary" style={{ width: `${pct}%` }} />
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Tonight's pick */}
      {pickedItem && (
        <section aria-label="Picked for you" className="relative flex flex-col gap-3 overflow-hidden rounded-3xl bg-ld-on-surface p-6 text-ld-surface sm:flex-row sm:items-center sm:justify-between animate-in fade-in duration-500">
          <div>
            <p className="text-ld-label-sm font-semibold uppercase tracking-widest text-ld-primary-container">Picked for you two</p>
            <p className="mt-1 font-display text-ld-headline-md">{pickedItem.title}</p>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => setCompleting(pickedItem)} className="inline-flex h-10 items-center gap-2 rounded-full bg-ld-primary-container px-4 text-ld-label-sm font-semibold text-ld-on-primary hover:bg-ld-primary">
              <Check className="size-4" aria-hidden="true" />
              Let&apos;s do it
            </button>
            <button type="button" onClick={pickForUs} className="inline-flex h-10 items-center gap-2 rounded-full bg-ld-surface/10 px-4 text-ld-label-sm hover:bg-ld-surface/20">
              <Dices className="size-4" aria-hidden="true" />
              Another
            </button>
            <button type="button" onClick={() => setPick(null)} aria-label="Dismiss" className="inline-flex size-10 items-center justify-center rounded-full hover:bg-ld-surface/10">
              <X className="size-4" aria-hidden="true" />
            </button>
          </div>
        </section>
      )}

      {/* Filters */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div role="tablist" aria-label="Dreams or done" className="inline-flex w-fit gap-1 rounded-full bg-ld-surface-container p-1">
          {([["PENDING", "Dreams", total - done], ["COMPLETED", "Done", done]] as const).map(([key, label, count]) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={tab === key}
              onClick={() => setTab(key)}
              className={cn("inline-flex h-10 items-center gap-2 rounded-full px-4 text-ld-label-md transition-colors", tab === key ? "bg-ld-surface-container-lowest text-ld-on-surface shadow-sm" : "text-ld-on-surface-variant hover:text-ld-on-surface")}
            >
              {label}
              <span className="rounded-full bg-ld-on-surface/5 px-1.5 text-[11px] tabular-nums">{count}</span>
            </button>
          ))}
        </div>
        <label className="relative flex h-10 w-full items-center md:max-w-xs">
          <span className="sr-only">Search dreams</span>
          <Search className="pointer-events-none absolute left-4 size-4 text-ld-on-surface-variant" aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search dreams"
            className="h-10 w-full rounded-full border border-ld-outline-variant bg-ld-surface-container-lowest pl-11 pr-4 text-ld-body-sm text-ld-on-surface placeholder:text-ld-outline focus:border-ld-primary focus:outline-none focus:ring-2 focus:ring-ld-primary/25"
          />
        </label>
      </div>

      {/* List */}
      {total === 0 ? (
        <EmptyList onAdd={() => openEditor(null)} />
      ) : visible.length === 0 ? (
        <div role="status" className="rounded-3xl border border-dashed border-ld-outline-variant px-6 py-14 text-center">
          <p className="font-display text-ld-headline-md text-ld-on-surface">
            {tab === "COMPLETED" ? "No dreams ticked off in this view yet." : "Nothing open in this view."}
          </p>
          <p className="mt-2 text-ld-body-sm text-ld-on-surface-variant">Try another category, or clear the search.</p>
        </div>
      ) : (
        <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3" aria-label={tab === "COMPLETED" ? "Done dreams" : "Open dreams"}>
          {paged.pageItems.map((item) => {
            const s = CATEGORY_STYLES[item.category];
            const pending = item.id.startsWith("tmp-");
            const isDone = !!item.completedAt;
            const label = targetLabel(item.targetDate, now);
            return (
              <li key={item.id} aria-busy={pending} className={cn("flex flex-col overflow-hidden rounded-3xl bg-ld-surface-container-lowest shadow-sm ring-1 ring-ld-on-surface/5 transition-all hover:-translate-y-0.5 hover:shadow-[0_18px_44px_-24px_rgba(64,56,50,0.4)]", pending && "opacity-70")}>
                <div className={cn("flex h-20 items-center justify-between bg-gradient-to-br px-5", s.cover)}>
                  <span className="inline-flex items-center gap-2 rounded-full bg-ld-surface/80 px-3 py-1 text-ld-caption font-medium text-ld-on-surface">
                    <s.icon className="size-3.5 text-ld-primary" aria-hidden="true" />
                    {s.label}
                  </span>
                  {isDone ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-ld-on-surface px-2.5 py-1 text-[11px] font-semibold text-ld-surface">
                      <Heart className="size-3 fill-current" aria-hidden="true" />
                      Done
                    </span>
                  ) : (
                    <span className={cn("rounded-full px-2.5 py-1 text-[11px] font-semibold", PRIORITY_STYLES[item.priority].className)}>{PRIORITY_STYLES[item.priority].label}</span>
                  )}
                </div>

                <div className="flex flex-1 flex-col gap-3 p-5">
                  <h3 className={cn("font-display text-ld-title-lg leading-snug text-ld-on-surface", isDone && "text-ld-on-surface-variant")}>{item.title}</h3>
                  {item.description && !isDone && <p className="line-clamp-2 text-ld-body-sm text-ld-on-surface-variant">{item.description}</p>}
                  {isDone && item.completedAt && (
                    <p className="text-ld-caption text-ld-on-surface-variant">Done on {dayFmt.format(new Date(item.completedAt))}</p>
                  )}
                  {isDone && item.completionMemory && (
                    <blockquote className="relative rounded-2xl bg-ld-surface-container-low p-4 font-display text-ld-body-sm italic leading-relaxed text-ld-on-surface">
                      <Quote className="absolute -top-2 left-3 size-5 fill-ld-surface-container-low text-ld-surface-container-low" aria-hidden="true" />
                      {item.completionMemory}
                    </blockquote>
                  )}
                  {!isDone && label && (
                    <p className="mt-auto flex items-center gap-1.5 text-ld-caption text-ld-on-surface-variant">
                      <CalendarDays className="size-3.5" aria-hidden="true" />
                      Aim for {label}
                    </p>
                  )}
                </div>

                <footer className="flex items-center justify-between gap-2 border-t border-ld-on-surface/5 px-4 py-3">
                  <p className="min-w-0 truncate text-ld-caption text-ld-on-surface-variant">{item.createdByName}</p>
                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setCompleting(item)}
                      disabled={pending}
                      className={cn("inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-ld-caption font-medium transition-colors disabled:opacity-40", isDone ? "text-ld-on-surface-variant hover:bg-ld-on-surface/5" : "bg-ld-tertiary-fixed/60 text-ld-on-tertiary-fixed-variant hover:bg-ld-tertiary-fixed")}
                    >
                      {isDone ? (
                        <>
                          <Pencil className="size-3.5" aria-hidden="true" />
                          Memory
                        </>
                      ) : (
                        <>
                          <Check className="size-3.5" aria-hidden="true" />
                          Done
                        </>
                      )}
                    </button>
                    <button type="button" onClick={() => openEditor(item)} disabled={pending} aria-label="Edit dream" className="inline-flex size-9 items-center justify-center rounded-full text-ld-on-surface-variant hover:bg-ld-on-surface/5 disabled:opacity-40">
                      <Pencil className="size-4" aria-hidden="true" />
                    </button>
                    <button type="button" onClick={() => removeItem(item)} disabled={pending} aria-label="Delete dream" className="inline-flex size-9 items-center justify-center rounded-full text-ld-on-surface-variant hover:bg-ld-error/10 hover:text-ld-error disabled:opacity-40">
                      <Trash2 className="size-4" aria-hidden="true" />
                    </button>
                  </div>
                </footer>
              </li>
            );
          })}
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
          label="Bucket list pages"
        />
      )}

      <button type="button" onClick={() => openEditor(null)} aria-label="Add a dream" className="fixed bottom-24 right-5 z-40 inline-flex size-14 items-center justify-center rounded-full bg-ld-primary text-ld-on-primary shadow-[0_12px_30px_-8px_rgba(201,126,139,0.7)] transition-transform active:scale-95 lg:hidden">
        <Plus className="size-6" aria-hidden="true" />
      </button>

      <BucketEditorModal key={openSeq} open={editing.open} item={editing.item} onClose={() => setEditing({ open: false, item: null })} onSave={saveDraft} />

      <BucketCompleteModal
        open={completing !== null}
        item={completing}
        onClose={() => setCompleting(null)}
        onComplete={(input) => (completing ? complete(completing, input) : Promise.resolve())}
        onUndo={() => (completing ? undoComplete(completing) : Promise.resolve())}
      />

      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-24 z-[95] flex flex-col items-center gap-2 px-4 lg:bottom-6">
        {toasts.map((t) => (
          <div key={t.id} role="status" className="pointer-events-auto flex max-w-md items-center gap-4 rounded-full bg-ld-on-surface px-5 py-3 text-ld-body-sm text-ld-surface shadow-[0_16px_40px_-16px_rgba(33,26,21,0.6)] animate-in fade-in slide-in-from-bottom-2 duration-300">
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
      <span className="sr-only">Undo stays available for {Math.round(BUCKET_UNDO_WINDOW_MS / 60000)} minutes after a delete.</span>
    </div>
  );
}

function Ring({ percent }: { percent: number }) {
  const r = 40;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative size-28 shrink-0" role="img" aria-label={`${percent} percent of dreams done`}>
      <svg viewBox="0 0 100 100" className="size-full -rotate-90" aria-hidden="true">
        <circle cx="50" cy="50" r={r} fill="none" stroke="currentColor" strokeWidth="9" className="text-ld-surface-container" />
        <circle cx="50" cy="50" r={r} fill="none" strokeWidth="9" strokeLinecap="round" stroke="currentColor" className="text-ld-primary transition-all duration-700" strokeDasharray={c} strokeDashoffset={c * (1 - percent / 100)} />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center font-display text-ld-headline-md text-ld-on-surface tabular-nums">{percent}%</span>
    </div>
  );
}

function EmptyList({ onAdd }: { onAdd: () => void }) {
  return (
    <section aria-labelledby="bucket-empty" className="relative overflow-hidden rounded-3xl bg-ld-surface-container-lowest px-6 py-16 text-center shadow-sm">
      <div aria-hidden="true" className="pointer-events-none absolute -left-16 -top-16 size-64 rounded-full bg-ld-secondary-container/40 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-20 -right-10 size-64 rounded-full bg-ld-tertiary-fixed/50 blur-3xl" />
      <div className="relative flex flex-col items-center gap-5">
        <span className="flex size-16 items-center justify-center rounded-full bg-ld-secondary-container/50 text-ld-primary">
          <Sparkles className="size-7" aria-hidden="true" />
        </span>
        <div className="space-y-2">
          <h2 id="bucket-empty" className="font-display text-ld-headline-md text-ld-on-surface">What do you want to do together, someday?</h2>
          <p className="mx-auto max-w-md text-ld-body-sm text-ld-on-surface-variant">
            Start with one thing. A sunrise hike, a cooking night, a city you keep talking about.
          </p>
        </div>
        <button type="button" onClick={onAdd} className="inline-flex h-12 items-center gap-2 rounded-full bg-ld-primary px-6 text-ld-label-md text-ld-on-primary shadow-[0_8px_20px_rgba(201,126,139,0.28)] transition-colors hover:bg-ld-on-primary-fixed-variant">
          <Plus className="size-5" aria-hidden="true" />
          Add the first dream
        </button>
      </div>
    </section>
  );
}
