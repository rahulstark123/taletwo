"use client";

import { useConfirm } from "@/components/shared/use-confirm";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, Bell, CalendarHeart, Pencil, Plus, Sparkles, Trash2, X } from "lucide-react";
import { apiCall } from "@/components/onboarding/api-client";
import { DayEditorModal, type DayDraft } from "@/components/special-days/day-editor-modal";
import { daysUntil, nextDate, ordinalLabel, relativeDays, shortDate } from "@/components/special-days/day-math";
import { KIND_ORDER, KIND_STYLES, REMINDER_LABEL } from "@/components/special-days/special-day-kinds";
import { Pagination, usePagination } from "@/components/shared/pagination";
import { SPECIAL_DAY_UNDO_WINDOW_MS, type SpecialDayDTO, type SpecialDayKindValue, type SpecialDaysPayload } from "@/lib/special-days-types";
import { cn } from "@/lib/utils";

interface Toast {
  id: number;
  message: string;
  action?: { label: string; run: () => void };
}

export function SpecialDaysBoard({ initial }: { initial: SpecialDaysPayload }) {
  const tz = initial.timezone;
  const [days, setDays] = useState<SpecialDayDTO[]>(initial.days);
  const [kind, setKind] = useState<SpecialDayKindValue | "ALL">("ALL");
  const [editing, setEditing] = useState<{ open: boolean; day: SpecialDayDTO | null }>({ open: false, day: null });
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

  const ready = now > 0;
  const withDays = useMemo(() => {
    if (!ready) return [];
    return days.map((d) => ({ day: d, n: daysUntil(d, now, tz) }));
  }, [days, now, tz, ready]);

  const filtered = withDays.filter((x) => kind === "ALL" || x.day.kind === kind);
  const upcoming = filtered.filter((x) => x.n >= 0 || x.day.repeatsYearly).sort((a, b) => a.n - b.n);
  const hero = upcoming[0] ?? null;
  const coming = upcoming.slice(1);
  const comingPaged = usePagination(coming, kind);
  const past = filtered
    .filter((x) => !x.day.repeatsYearly && x.n < 0)
    .sort((a, b) => b.n - a.n);
  const within30 = withDays.filter((x) => x.n >= 0 && x.n <= 30).length;

  function pushToast(toast: Omit<Toast, "id">, ms = 6000) {
    const id = ++toastCounter.current;
    setToasts((t) => [...t, { ...toast, id }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), ms);
  }

  function openEditor(day: SpecialDayDTO | null) {
    setOpenSeq((s) => s + 1);
    setEditing({ open: true, day });
  }

  async function saveDraft(draft: DayDraft) {
    if (editing.day) {
      const before = editing.day;
      setDays((prev) => prev.map((d) => (d.id === before.id ? { ...d, ...draft } : d)));
      const result = await apiCall<{ day: SpecialDayDTO }>(`/api/special-days/${before.id}`, { method: "PATCH", body: draft });
      if (!result.ok) {
        setDays((prev) => prev.map((d) => (d.id === before.id ? before : d)));
        throw new Error(result.error.message);
      }
      setDays((prev) => prev.map((d) => (d.id === before.id ? result.data.day : d)));
      setEditing({ open: false, day: null });
      pushToast({ message: "Saved. We will remember it that way." }, 2500);
      return;
    }
    const result = await apiCall<{ day: SpecialDayDTO }>("/api/special-days", { method: "POST", body: draft });
    if (!result.ok) throw new Error(result.error.message);
    setDays((prev) => [...prev, result.data.day]);
    setEditing({ open: false, day: null });
    pushToast({ message: "Marked. We will count down to it together." }, 3500);
  }

  const { confirm, dialog } = useConfirm();
  async function removeDay(day: SpecialDayDTO) {
    if (!(await confirm({ title: "Delete this special day?", description: "It will be removed from your countdowns for both of you. You can undo this for a few minutes.", confirmLabel: "Delete" }))) return;
    setDays((prev) => prev.filter((d) => d.id !== day.id));
    const result = await apiCall<{ deleted: boolean }>(`/api/special-days/${day.id}`, { method: "DELETE" });
    if (!result.ok) {
      setDays((prev) => [...prev, day]);
      pushToast({ message: result.error.message });
      return;
    }
    pushToast(
      {
        message: `"${day.title}" was removed.`,
        action: {
          label: "Undo",
          run: async () => {
            const restored = await apiCall<{ day: SpecialDayDTO }>(`/api/special-days/${day.id}/restore`, { method: "POST" });
            if (restored.ok) {
              setDays((prev) => [...prev, restored.data.day]);
              pushToast({ message: "Restored." }, 2500);
            } else {
              pushToast({ message: "This day can no longer be restored." });
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
          Anniversaries, birthdays and the days that started it all. Count them down together, and never miss one.
        </p>
        <button type="button" onClick={() => openEditor(null)} className="hidden h-12 items-center gap-2 rounded-full bg-ld-primary px-6 text-ld-label-md text-ld-on-primary shadow-[0_8px_20px_rgba(201,126,139,0.28)] transition-colors hover:bg-ld-on-primary-fixed-variant lg:inline-flex">
          <Plus className="size-5" aria-hidden="true" />
          Mark a special day
        </button>
      </header>

      {days.length === 0 ? (
        <EmptyDays onAdd={() => openEditor(null)} />
      ) : (
        <>
          {/* Hero and stats */}
          <div className="grid gap-5 lg:grid-cols-[1.5fr_1fr]">
            <NextUp hero={hero} now={now} timezone={tz} onEdit={() => hero && openEditor(hero.day)} />
            <div className="grid grid-cols-2 gap-4">
              <Stat label="Coming in 30 days" value={ready ? String(within30) : "—"} hint="special days" />
              <Stat label="Saved days" value={String(days.length)} hint="for the two of you" />
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filter by kind">
            <Chip active={kind === "ALL"} onClick={() => setKind("ALL")}>All</Chip>
            {KIND_ORDER.map((k) => (
              <Chip key={k} active={kind === k} onClick={() => setKind(k)}>{KIND_STYLES[k].short}</Chip>
            ))}
          </div>

          {/* Coming up */}
          <section aria-labelledby="coming-up" className="space-y-4">
            <h2 id="coming-up" className="font-display text-ld-headline-md text-ld-on-surface">Coming up</h2>
            {!ready ? (
              <p className="text-ld-caption text-ld-on-surface-variant">Counting the days…</p>
            ) : coming.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-ld-outline-variant px-5 py-8 text-center text-ld-body-sm text-ld-on-surface-variant">
                Nothing else coming up in this view.
              </p>
            ) : (
              <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {comingPaged.pageItems.map(({ day, n }) => (
                  <li key={day.id}>
                    <DayCard day={day} n={n} timezone={tz} now={now} onEdit={() => openEditor(day)} onDelete={() => removeDay(day)} />
                  </li>
                ))}
              </ul>
            )}
            {coming.length > 0 && (
              <Pagination
                page={comingPaged.page}
                totalPages={comingPaged.totalPages}
                total={comingPaged.total}
                pageSize={comingPaged.pageSize}
                start={comingPaged.start}
                setPage={comingPaged.setPage}
                label="Coming up pages"
              />
            )}
          </section>

          {/* Past milestones */}
          {past.length > 0 && (
            <section aria-labelledby="past-milestones" className="space-y-4">
              <h2 id="past-milestones" className="font-display text-ld-headline-md text-ld-on-surface">Past milestones</h2>
              <ol className="relative space-y-4 border-l border-ld-outline-variant/60 pl-6">
                {past.map(({ day, n }) => {
                  const s = KIND_STYLES[day.kind];
                  return (
                    <li key={day.id} className="relative flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-ld-surface-container-lowest p-4 shadow-sm">
                      <span aria-hidden="true" className="absolute -left-[31px] top-6 size-3 rounded-full bg-ld-primary-container ring-4 ring-ld-surface" />
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-ld-surface-container text-ld-primary">
                          <s.icon className="size-4" aria-hidden="true" />
                        </span>
                        <div className="min-w-0">
                          <p className="truncate font-display text-ld-title-lg text-ld-on-surface">{day.title}</p>
                          <p className="text-ld-caption text-ld-on-surface-variant">{shortDate(day.eventDate)} · {relativeDays(n)}</p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button type="button" onClick={() => openEditor(day)} aria-label="Edit" className="inline-flex size-9 items-center justify-center rounded-full text-ld-on-surface-variant hover:bg-ld-on-surface/5"><Pencil className="size-4" aria-hidden="true" /></button>
                        <button type="button" onClick={() => removeDay(day)} aria-label="Delete" className="inline-flex size-9 items-center justify-center rounded-full text-ld-on-surface-variant hover:bg-ld-error/10 hover:text-ld-error"><Trash2 className="size-4" aria-hidden="true" /></button>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </section>
          )}
        </>
      )}

      <button type="button" onClick={() => openEditor(null)} aria-label="Mark a special day" className="fixed bottom-24 right-5 z-40 inline-flex size-14 items-center justify-center rounded-full bg-ld-primary text-ld-on-primary shadow-[0_12px_30px_-8px_rgba(201,126,139,0.7)] transition-transform active:scale-95 lg:hidden">
        <Plus className="size-6" aria-hidden="true" />
      </button>

      <DayEditorModal key={openSeq} open={editing.open} day={editing.day} timezone={tz} now={now} onClose={() => setEditing({ open: false, day: null })} onSave={saveDraft} />

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
      <span className="sr-only">Undo stays available for {Math.round(SPECIAL_DAY_UNDO_WINDOW_MS / 60000)} minutes after a delete.</span>
    </div>
  );
}

function NextUp({ hero, now, timezone, onEdit }: { hero: { day: SpecialDayDTO; n: number } | null; now: number; timezone: string; onEdit: () => void }) {
  if (!hero) {
    return (
      <section aria-labelledby="next-special" className="flex flex-col justify-center rounded-3xl bg-ld-surface-container-lowest p-7 shadow-sm">
        <p className="text-ld-label-sm font-semibold uppercase tracking-widest text-ld-primary">Next up</p>
        <h2 id="next-special" className="mt-2 font-display text-ld-headline-md text-ld-on-surface">Nothing coming up.</h2>
        <p className="mt-2 text-ld-body-sm text-ld-on-surface-variant">Add your anniversary or a birthday, and the countdown starts here.</p>
      </section>
    );
  }
  const { day, n } = hero;
  const s = KIND_STYLES[day.kind];
  const label = ordinalLabel(day, now, timezone);
  return (
    <section aria-labelledby="next-special" className={cn("relative flex flex-col gap-5 overflow-hidden rounded-3xl bg-gradient-to-br p-7 shadow-sm", s.cover)}>
      <div aria-hidden="true" className="pointer-events-none absolute -right-14 -top-14 size-56 rounded-full bg-ld-surface/40 blur-2xl" />
      <div className="relative flex items-start justify-between gap-4">
        <div className="space-y-2">
          <p className="text-ld-label-sm font-semibold uppercase tracking-widest text-ld-primary">Next up · {s.short}</p>
          <h2 id="next-special" className="font-display text-ld-headline-md text-ld-on-surface sm:text-ld-headline-lg">{day.title}</h2>
          {label && <p className="text-ld-body-sm text-ld-on-surface-variant">{label}</p>}
        </div>
        <button type="button" onClick={onEdit} aria-label="Edit this day" className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-ld-surface/70 text-ld-on-surface hover:bg-ld-surface">
          <Pencil className="size-4" aria-hidden="true" />
        </button>
      </div>
      <div className="relative flex items-end gap-4">
        <span className="font-display text-[64px] leading-none tabular-nums text-ld-on-surface">{n === 0 ? "Today" : n}</span>
        {n > 0 && <span className="mb-2 text-ld-body-sm text-ld-on-surface-variant">{n === 1 ? "day to go" : "days to go"}</span>}
      </div>
      <ul className="relative flex flex-wrap gap-2 text-ld-caption text-ld-on-surface-variant">
        <li className="inline-flex items-center gap-1.5 rounded-full bg-ld-surface/70 px-3 py-1"><CalendarHeart className="size-3.5" aria-hidden="true" />{shortDate(nextDate(day, now, timezone))}</li>
        <li className="inline-flex items-center gap-1.5 rounded-full bg-ld-surface/70 px-3 py-1"><Bell className="size-3.5" aria-hidden="true" />{REMINDER_LABEL[day.reminder]}</li>
      </ul>
      <Link href="/app/plans" className="relative inline-flex h-10 w-fit items-center gap-2 rounded-full bg-ld-on-surface px-4 text-ld-label-sm text-ld-surface hover:bg-ld-on-surface/85">
        Plan something for it
        <ArrowRight className="size-4" aria-hidden="true" />
      </Link>
    </section>
  );
}

function DayCard({ day, n, timezone, now, onEdit, onDelete }: { day: SpecialDayDTO; n: number; timezone: string; now: number; onEdit: () => void; onDelete: () => void }) {
  const s = KIND_STYLES[day.kind];
  const label = ordinalLabel(day, now, timezone);
  const pending = day.id.startsWith("tmp-");
  return (
    <article aria-busy={pending} className={cn("flex flex-col overflow-hidden rounded-3xl bg-ld-surface-container-lowest shadow-sm ring-1 ring-ld-on-surface/5 transition-all hover:-translate-y-0.5 hover:shadow-[0_18px_44px_-24px_rgba(64,56,50,0.4)]", pending && "opacity-70")}>
      <div className={cn("flex h-20 items-center justify-between bg-gradient-to-br px-5", s.cover)}>
        <span className="inline-flex items-center gap-2 rounded-full bg-ld-surface/80 px-3 py-1 text-ld-caption font-medium text-ld-on-surface">
          <s.icon className="size-3.5 text-ld-primary" aria-hidden="true" />
          {s.short}
        </span>
        <span className="rounded-full bg-ld-on-surface px-3 py-1 text-[11px] font-semibold tabular-nums text-ld-surface">{relativeDays(n)}</span>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-5">
        <h3 className="font-display text-ld-title-lg leading-snug text-ld-on-surface">{day.title}</h3>
        <p className="text-ld-caption text-ld-on-surface-variant">
          {shortDate(nextDate(day, now, timezone))}
          {label && <span> · {label}</span>}
        </p>
        {day.notes && <p className="line-clamp-2 text-ld-body-sm text-ld-on-surface-variant">{day.notes}</p>}
      </div>
      <footer className="flex items-center justify-between gap-2 border-t border-ld-on-surface/5 px-4 py-3">
        <p className="min-w-0 truncate text-[11px] text-ld-outline">{day.repeatsYearly ? "Every year" : "One time"} · {REMINDER_LABEL[day.reminder]}</p>
        <div className="flex shrink-0 gap-1">
          <button type="button" onClick={onEdit} disabled={pending} aria-label="Edit" className="inline-flex size-9 items-center justify-center rounded-full text-ld-on-surface-variant hover:bg-ld-on-surface/5 disabled:opacity-40"><Pencil className="size-4" aria-hidden="true" /></button>
          <button type="button" onClick={onDelete} disabled={pending} aria-label="Delete" className="inline-flex size-9 items-center justify-center rounded-full text-ld-on-surface-variant hover:bg-ld-error/10 hover:text-ld-error disabled:opacity-40"><Trash2 className="size-4" aria-hidden="true" /></button>
        </div>
      </footer>
    </article>
  );
}

function Stat({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="flex flex-col justify-between gap-3 rounded-3xl bg-ld-surface-container-lowest p-5 shadow-sm">
      <CalendarHeart className="size-4 text-ld-primary" aria-hidden="true" />
      <div>
        <p className="font-display text-ld-headline-md tabular-nums text-ld-on-surface">{value}</p>
        <p className="text-ld-caption text-ld-on-surface-variant">{label}</p>
        <p className="text-[11px] text-ld-outline">{hint}</p>
      </div>
    </div>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" aria-pressed={active} onClick={onClick} className={cn("inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-ld-caption transition-colors", active ? "bg-ld-on-surface text-ld-surface" : "bg-ld-surface-container text-ld-on-surface-variant hover:bg-ld-surface-container-high")}>
      {children}
      {active && <X className="size-3 hidden" aria-hidden="true" />}
    </button>
  );
}

function EmptyDays({ onAdd }: { onAdd: () => void }) {
  return (
    <section aria-labelledby="days-empty" className="relative overflow-hidden rounded-3xl bg-ld-surface-container-lowest px-6 py-16 text-center shadow-sm">
      <div aria-hidden="true" className="pointer-events-none absolute -left-16 -top-16 size-64 rounded-full bg-ld-secondary-container/40 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-20 -right-10 size-64 rounded-full bg-ld-tertiary-fixed/50 blur-3xl" />
      <div className="relative flex flex-col items-center gap-5">
        <span className="flex size-16 items-center justify-center rounded-full bg-ld-secondary-container/50 text-ld-primary">
          <CalendarHeart className="size-7" aria-hidden="true" />
        </span>
        <div className="space-y-2">
          <h2 id="days-empty" className="font-display text-ld-headline-md text-ld-on-surface">Which day should we never forget?</h2>
          <p className="mx-auto max-w-md text-ld-body-sm text-ld-on-surface-variant">
            Start with your anniversary. Add birthdays and the day you first met, and TaleTwo counts the days for you.
          </p>
        </div>
        <button type="button" onClick={onAdd} className="inline-flex h-12 items-center gap-2 rounded-full bg-ld-primary px-6 text-ld-label-md text-ld-on-primary shadow-[0_8px_20px_rgba(201,126,139,0.28)] transition-colors hover:bg-ld-on-primary-fixed-variant">
          <Plus className="size-5" aria-hidden="true" />
          Mark your first special day
        </button>
      </div>
    </section>
  );
}
