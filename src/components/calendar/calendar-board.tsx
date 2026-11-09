"use client";

import { useConfirm } from "@/components/shared/use-confirm";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Plus, Sparkles } from "lucide-react";
import { apiCall } from "@/components/onboarding/api-client";
import { COLOR_CLASS, lookFor, SOURCE_LABEL } from "@/components/calendar/calendar-kinds";
import { EventEditorModal, type EventDraft } from "@/components/calendar/event-editor-modal";
import type { CalendarEventDTO, CalendarItem, CalendarPayload } from "@/lib/calendar-types";
import { cn } from "@/lib/utils";
import { Pagination, usePagination } from "@/components/shared/pagination";

type View = "month" | "week" | "agenda";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const DAY = 86_400_000;

const monthTitle = new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric", timeZone: "UTC" });
const dayTitle = new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" });
const shortDay = new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" });

const iso = (t: number) => new Date(t).toISOString().slice(0, 10);
const parse = (s: string) => Date.parse(`${s}T00:00:00Z`);

/** Monday on or before the 1st of the month, then 42 days (six weeks) for the grid. */
function gridStart(year: number, month: number) {
  const first = Date.UTC(year, month, 1);
  const weekday = (new Date(first).getUTCDay() + 6) % 7; // Monday = 0
  return first - weekday * DAY;
}

function timeLabel(iso: string | null, tz: string) {
  if (!iso) return "";
  return new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: tz }).format(new Date(iso));
}

export function CalendarBoard({ initial, today }: { initial: CalendarPayload; today: string }) {
  const tz = initial.timezone;
  const [cursor, setCursor] = useState(() => {
    const d = new Date(`${today}T00:00:00Z`);
    return { year: d.getUTCFullYear(), month: d.getUTCMonth() };
  });
  const [selected, setSelected] = useState(today);
  const [view, setView] = useState<View>("month");
  const [items, setItems] = useState<CalendarItem[]>(initial.items);
  const [range, setRange] = useState({ from: initial.from, to: initial.to });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [editing, setEditing] = useState<{ open: boolean; event: CalendarEventDTO | null; date: string | null }>({ open: false, event: null, date: null });
  const [openSeq, setOpenSeq] = useState(0);
  const [activeKinds, setActiveKinds] = useState<string[]>([]);
  const seq = useRef(0);

  // The visible window: the month grid for month view, the week for week view, and 3 weeks for agenda.
  const window = useMemo(() => {
    if (view === "month") {
      const start = gridStart(cursor.year, cursor.month);
      return { from: iso(start), to: iso(start + 41 * DAY) };
    }
    if (view === "week") {
      const sel = parse(selected);
      const start = sel - ((new Date(sel).getUTCDay() + 6) % 7) * DAY;
      return { from: iso(start), to: iso(start + 6 * DAY) };
    }
    const start = parse(today);
    return { from: iso(start), to: iso(start + 27 * DAY) };
  }, [view, cursor, selected, today]);

  // Refetch whenever the window changes.
  useEffect(() => {
    if (window.from === range.from && window.to === range.to) return;
    let cancelled = false;
    const my = ++seq.current;
    (async () => {
      setLoading(true);
      const res = await apiCall<CalendarPayload>(`/api/calendar?from=${window.from}&to=${window.to}`);
      if (cancelled || my !== seq.current) return;
      setLoading(false);
      if (res.ok) {
        setItems(res.data.items);
        setRange({ from: window.from, to: window.to });
      } else setMessage(res.error.message);
    })();
    return () => {
      cancelled = true;
    };
  }, [window, range]);

  const byDate = useMemo(() => {
    const map = new Map<string, CalendarItem[]>();
    items.forEach((i) => {
      if (activeKinds.length && !activeKinds.includes(i.source)) return;
      map.set(i.date, [...(map.get(i.date) ?? []), i]);
    });
    return map;
  }, [items, activeKinds]);

  // The agenda pages through days, 10 at a time, so a busy month never runs on for ever.
  const agendaPaged = usePagination(Array.from(byDate.keys()).sort(), "");
  const counts = useMemo(() => {
    const c: Record<string, number> = { EVENT: 0, PLAN: 0, SPECIAL_DAY: 0, BUCKET: 0 };
    items.forEach((i) => (c[i.source] = (c[i.source] ?? 0) + 1));
    return c;
  }, [items]);

  function shift(delta: number) {
    if (view === "month") {
      setCursor((c) => {
        const d = new Date(Date.UTC(c.year, c.month + delta, 1));
        return { year: d.getUTCFullYear(), month: d.getUTCMonth() };
      });
    } else {
      setSelected((s) => iso(parse(s) + delta * (view === "week" ? 7 : 28) * DAY));
    }
  }

  function goToday() {
    const d = new Date(`${today}T00:00:00Z`);
    setCursor({ year: d.getUTCFullYear(), month: d.getUTCMonth() });
    setSelected(today);
  }

  function openEditor(event: CalendarEventDTO | null, date: string | null) {
    setOpenSeq((s) => s + 1);
    setEditing({ open: true, event, date });
  }

  async function reload() {
    const res = await apiCall<CalendarPayload>(`/api/calendar?from=${window.from}&to=${window.to}`);
    if (res.ok) {
      setItems(res.data.items);
      setRange({ from: window.from, to: window.to });
    }
  }

  async function saveEvent(draft: EventDraft) {
    const res = editing.event
      ? await apiCall<{ event: CalendarEventDTO }>(`/api/calendar/events/${editing.event.id}`, { method: "PATCH", body: draft })
      : await apiCall<{ event: CalendarEventDTO }>("/api/calendar/events", { method: "POST", body: draft });
    if (!res.ok) throw new Error(res.error.message);
    setEditing({ open: false, event: null, date: null });
    setMessage(editing.event ? "Event updated." : "Added to the calendar.");
    await reload();
  }

  const { confirm, dialog } = useConfirm();
  async function deleteEvent() {
    if (!(await confirm({ title: "Delete this event?", description: "It will be removed from the calendar for both of you.", confirmLabel: "Delete" }))) return;
    if (!editing.event) return;
    const res = await apiCall<{ deleted: boolean }>(`/api/calendar/events/${editing.event.id}`, { method: "DELETE" });
    if (!res.ok) throw new Error(res.error.message);
    setEditing({ open: false, event: null, date: null });
    setMessage("Event removed.");
    await reload();
  }

  function onItemClick(item: CalendarItem) {
    if (item.source === "EVENT") {
      const ev: CalendarEventDTO = {
        id: item.id,
        title: item.title,
        description: item.description,
        kind: item.kind as CalendarEventDTO["kind"],
        startsAt: item.startsAt ?? `${item.date}T00:00:00.000Z`,
        endsAt: null,
        allDay: item.allDay,
        location: item.location,
        reminder: item.reminder,
        createdByName: "You",
        isMine: true,
      };
      openEditor(ev, null);
    }
  }

  const selectedItems = byDate.get(selected) ?? [];
  const title = view === "month" ? monthTitle.format(new Date(Date.UTC(cursor.year, cursor.month, 1))) : shortDay.format(new Date(parse(view === "week" ? window.from : selected)));

  return (
    <div className="space-y-6">
      {dialog}
      {/* Toolbar */}
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => shift(-1)} aria-label="Previous" className="inline-flex size-10 items-center justify-center rounded-full bg-ld-surface-container-lowest shadow-sm hover:bg-ld-surface"><ChevronLeft className="size-5" aria-hidden="true" /></button>
          <h2 className="min-w-[10rem] text-center font-display text-ld-headline-md text-ld-on-surface" aria-live="polite">{title}</h2>
          <button type="button" onClick={() => shift(1)} aria-label="Next" className="inline-flex size-10 items-center justify-center rounded-full bg-ld-surface-container-lowest shadow-sm hover:bg-ld-surface"><ChevronRight className="size-5" aria-hidden="true" /></button>
          <button type="button" onClick={goToday} className="ml-1 h-10 rounded-full bg-ld-surface-container px-4 text-ld-label-sm text-ld-on-surface hover:bg-ld-surface-container-high">Today</button>
          {loading && <span className="text-ld-caption text-ld-outline">Updating…</span>}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div role="radiogroup" aria-label="Calendar view" className="hidden gap-1 rounded-full bg-ld-surface-container p-1 md:inline-flex">
            {(["month", "week", "agenda"] as View[]).map((v) => (
              <button key={v} type="button" role="radio" aria-checked={view === v} onClick={() => setView(v)} className={cn("h-8 rounded-full px-3.5 text-ld-label-sm capitalize transition-colors", view === v ? "bg-ld-surface-container-lowest text-ld-on-surface shadow-sm" : "text-ld-on-surface-variant")}>{v}</button>
            ))}
          </div>
          <button type="button" onClick={() => openEditor(null, selected)} className="inline-flex h-11 items-center gap-2 rounded-full bg-ld-primary px-5 text-ld-label-md text-ld-on-primary shadow-[0_8px_20px_rgba(201,126,139,0.28)] transition-colors hover:bg-ld-on-primary-fixed-variant">
            <Plus className="size-4" aria-hidden="true" />
            Add event
          </button>
        </div>
      </div>

      {/* Legend and filters */}
      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Show">
        {(["EVENT", "PLAN", "SPECIAL_DAY", "BUCKET"] as const).map((s) => {
          const on = activeKinds.length === 0 || activeKinds.includes(s);
          return (
            <button key={s} type="button" aria-pressed={activeKinds.includes(s)} onClick={() => setActiveKinds((list) => (list.includes(s) ? list.filter((x) => x !== s) : [...list, s]))} className={cn("inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-ld-caption transition-opacity", on ? "bg-ld-surface-container-lowest shadow-sm text-ld-on-surface" : "bg-ld-surface-container text-ld-outline opacity-60")}>
              <span className={cn("size-2.5 rounded-full", s === "EVENT" ? "bg-ld-secondary-container" : s === "PLAN" ? "bg-[#dfe9f3]" : s === "SPECIAL_DAY" ? "bg-ld-tertiary-fixed" : "bg-[#fbe3c9]")} aria-hidden="true" />
              {SOURCE_LABEL[s]}
              <span className="tabular-nums text-ld-outline">{counts[s] ?? 0}</span>
            </button>
          );
        })}
      </div>

      {message && <p role="status" className="rounded-xl bg-ld-secondary-container/40 px-4 py-2 text-ld-caption text-ld-on-surface">{message}</p>}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="min-w-0 space-y-6">
          {/* Month grid (desktop) */}
          <div className={cn("overflow-hidden rounded-3xl bg-ld-surface-container-lowest shadow-sm", view === "month" ? "hidden md:block" : "hidden")}>
            <div className="grid grid-cols-7 border-b border-ld-on-surface/5 bg-ld-surface-container/50">
              {WEEKDAYS.map((w) => <div key={w} className="px-3 py-2 text-center text-ld-label-sm font-semibold uppercase tracking-wider text-ld-on-surface-variant">{w}</div>)}
            </div>
            <div className="grid grid-cols-7">
              {Array.from({ length: 42 }, (_, i) => {
                const start = gridStart(cursor.year, cursor.month);
                const key = iso(start + i * DAY);
                const inMonth = new Date(parse(key)).getUTCMonth() === cursor.month;
                return <DayCell key={key} date={key} inMonth={inMonth} isToday={key === today} isSelected={key === selected} items={byDate.get(key) ?? []} tz={tz} onSelect={() => setSelected(key)} onItem={onItemClick} />;
              })}
            </div>
          </div>

          {/* Week (desktop) */}
          <div className={cn("grid grid-cols-7 gap-2", view === "week" ? "hidden md:grid" : "hidden")}>
            {Array.from({ length: 7 }, (_, i) => {
              const key = iso(parse(window.from) + i * DAY);
              return (
                <div key={key} className={cn("flex min-h-[18rem] flex-col gap-2 rounded-2xl bg-ld-surface-container-lowest p-2 shadow-sm", key === today && "ring-2 ring-ld-primary/40", key === selected && "bg-ld-secondary-container/20")}>
                  <button type="button" onClick={() => setSelected(key)} className="text-left">
                    <p className="text-[11px] uppercase text-ld-on-surface-variant">{WEEKDAYS[i]}</p>
                    <p className="font-display text-ld-title-lg text-ld-on-surface">{new Date(parse(key)).getUTCDate()}</p>
                  </button>
                  <ul className="flex flex-col gap-1">
                    {(byDate.get(key) ?? []).map((item) => <ItemChip key={item.id + item.date} item={item} tz={tz} onClick={() => onItemClick(item)} />)}
                  </ul>
                </div>
              );
            })}
          </div>

          {/* Agenda (always on mobile, and on desktop when chosen) */}
          <section aria-label="Agenda" className={cn("space-y-6", view === "agenda" ? "" : "md:hidden")}>
            {Array.from(byDate.keys()).length === 0 ? (
              <div role="status" className="rounded-3xl border border-dashed border-ld-outline-variant px-6 py-12 text-center">
                <p className="font-display text-ld-headline-md text-ld-on-surface">Nothing on the calendar here yet.</p>
                <p className="mt-2 text-ld-body-sm text-ld-on-surface-variant">Add a date night, or let plans and special days fill it in.</p>
              </div>
            ) : (
              agendaPaged.pageItems.map((key) => (
                <div key={key} className="space-y-2">
                  <h3 className={cn("text-ld-label-sm font-semibold uppercase tracking-wider", key === today ? "text-ld-primary" : "text-ld-on-surface-variant")}>{key === today ? "Today · " : ""}{dayTitle.format(new Date(parse(key)))}</h3>
                  <ul className="space-y-2">
                    {(byDate.get(key) ?? []).map((item) => <li key={item.id + item.date}><ItemRow item={item} tz={tz} onClick={() => onItemClick(item)} /></li>)}
                  </ul>
                </div>
              ))
            )}
            {agendaPaged.total > 0 && (
              <Pagination
                page={agendaPaged.page}
                totalPages={agendaPaged.totalPages}
                total={agendaPaged.total}
                pageSize={agendaPaged.pageSize}
                start={agendaPaged.start}
                setPage={agendaPaged.setPage}
                label="Agenda pages"
              />
            )}
          </section>
        </div>

        {/* Day panel (desktop) */}
        <aside aria-labelledby="day-panel" className="hidden flex-col gap-4 rounded-3xl bg-ld-surface-container p-5 xl:flex">
          <div>
            <p className="text-ld-label-sm font-semibold uppercase tracking-widest text-ld-primary">{selected === today ? "Today" : "Selected day"}</p>
            <h2 id="day-panel" className="font-display text-ld-headline-md text-ld-on-surface">{dayTitle.format(new Date(parse(selected)))}</h2>
          </div>
          {selectedItems.length === 0 ? (
            <p className="text-ld-body-sm text-ld-on-surface-variant">Nothing planned. A quiet day is lovely too.</p>
          ) : (
            <ul className="space-y-2">
              {selectedItems.map((item) => <li key={item.id + item.date}><ItemRow item={item} tz={tz} onClick={() => onItemClick(item)} /></li>)}
            </ul>
          )}
          <button type="button" onClick={() => openEditor(null, selected)} className="mt-auto inline-flex h-10 items-center justify-center gap-2 rounded-full bg-ld-on-surface text-ld-label-sm text-ld-surface hover:bg-ld-on-surface/85">
            <Plus className="size-4" aria-hidden="true" />
            Add to this day
          </button>
          <div className="rounded-2xl bg-ld-surface-container-lowest p-4">
            <p className="flex items-center gap-2 text-ld-label-sm font-semibold text-ld-on-surface"><Sparkles className="size-4 text-ld-primary" aria-hidden="true" />Plan it</p>
            <p className="mt-1 text-ld-caption text-ld-on-surface-variant">Turn an idea into a plan, or a dream into a date.</p>
            <div className="mt-3 flex gap-2">
              <Link href="/app/plans" className="text-ld-label-sm text-ld-primary hover:underline">Plans</Link>
              <Link href="/app/bucket-list" className="text-ld-label-sm text-ld-primary hover:underline">Bucket list</Link>
            </div>
          </div>
        </aside>
      </div>

      <button type="button" onClick={() => openEditor(null, selected)} aria-label="Add event" className="fixed bottom-24 right-5 z-40 inline-flex size-14 items-center justify-center rounded-full bg-ld-primary text-ld-on-primary shadow-[0_12px_30px_-8px_rgba(201,126,139,0.7)] transition-transform active:scale-95 lg:hidden">
        <Plus className="size-6" aria-hidden="true" />
      </button>

      <EventEditorModal
        key={openSeq}
        open={editing.open}
        event={editing.event}
        defaultDate={editing.date}
        onClose={() => setEditing({ open: false, event: null, date: null })}
        onSave={saveEvent}
        onDelete={deleteEvent}
      />
    </div>
  );
}

function DayCell({ date, inMonth, isToday, isSelected, items, tz, onSelect, onItem }: { date: string; inMonth: boolean; isToday: boolean; isSelected: boolean; items: CalendarItem[]; tz: string; onSelect: () => void; onItem: (i: CalendarItem) => void }) {
  const day = new Date(parse(date)).getUTCDate();
  return (
    <div onClick={onSelect} className={cn("flex min-h-[7.5rem] cursor-pointer flex-col gap-1 border-b border-r border-ld-on-surface/5 p-2 transition-colors hover:bg-ld-surface-container/60", !inMonth && "bg-ld-surface-container/30 text-ld-outline", isSelected && "bg-ld-secondary-container/25")}>
      <span className={cn("inline-flex size-7 items-center justify-center self-end rounded-full text-ld-caption tabular-nums", isToday ? "bg-ld-primary text-ld-on-primary" : inMonth ? "text-ld-on-surface" : "text-ld-outline")}>{day}</span>
      <ul className="flex flex-col gap-1">
        {items.slice(0, 3).map((item) => (
          <li key={item.id + item.date}>
            <ItemChip item={item} tz={tz} onClick={(e) => { e?.stopPropagation(); onItem(item); }} />
          </li>
        ))}
        {items.length > 3 && <li className="px-1 text-[11px] text-ld-on-surface-variant">+{items.length - 3} more</li>}
      </ul>
    </div>
  );
}

function ItemChip({ item, tz, onClick }: { item: CalendarItem; tz: string; onClick: (e?: React.MouseEvent) => void }) {
  const look = lookFor(item.kind);
  return (
    <button type="button" onClick={(e) => onClick(e)} title={item.title} className={cn("flex w-full items-center gap-1.5 truncate rounded-lg px-2 py-1 text-left text-[11px] font-medium transition-transform hover:-translate-y-px", COLOR_CLASS[look.color])}>
      {!item.allDay && item.startsAt && <span className="shrink-0 tabular-nums opacity-80">{timeLabel(item.startsAt, tz)}</span>}
      <span className="truncate">{item.title}</span>
    </button>
  );
}

function ItemRow({ item, tz, onClick }: { item: CalendarItem; tz: string; onClick: () => void }) {
  const look = lookFor(item.kind);
  const Icon = look.icon;
  const editable = item.source === "EVENT";
  const content = (
    <>
      <span className={cn("flex size-9 shrink-0 items-center justify-center rounded-xl", COLOR_CLASS[look.color])}><Icon className="size-4" aria-hidden="true" /></span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-ld-body-sm font-semibold text-ld-on-surface">{item.title}</span>
        <span className="block truncate text-ld-caption text-ld-on-surface-variant">
          {item.allDay ? "All day" : timeLabel(item.startsAt, tz)}
          {item.location ? ` · ${item.location}` : ""}
          {` · ${SOURCE_LABEL[item.source]}`}
        </span>
      </span>
    </>
  );
  if (editable) {
    return <button type="button" onClick={onClick} className="flex w-full items-center gap-3 rounded-2xl bg-ld-surface-container-lowest p-3 text-left shadow-sm transition-colors hover:bg-ld-surface">{content}</button>;
  }
  return <Link href={item.href ?? "/app/calendar"} className="flex w-full items-center gap-3 rounded-2xl bg-ld-surface-container-lowest p-3 text-left shadow-sm transition-colors hover:bg-ld-surface">{content}</Link>;
}
