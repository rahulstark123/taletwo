"use client";

import { useConfirm } from "@/components/shared/use-confirm";
import { useEffect, useMemo, useRef, useState } from "react";
import { CalendarDays, Heart, MapPin, Plus, Search, Sparkles, Wallet, X } from "lucide-react";
import { apiCall } from "@/components/onboarding/api-client";
import { PlanCard, countdownLabel, money } from "@/components/plans/plan-card";
import { Pagination, usePagination } from "@/components/shared/pagination";
import { PlanEditorModal, type PlanDraft } from "@/components/plans/plan-editor-modal";
import { AUDIENCE_LABEL, KIND_ORDER, KIND_STYLES } from "@/components/plans/plan-kinds";
import { PLAN_UNDO_WINDOW_MS, type PlanDTO, type PlansPayload } from "@/lib/plans-types";
import type { PlanKindValue, PlanStatusValue } from "@/lib/validations/plans";
import { cn } from "@/lib/utils";

type Tab = "PLANNED" | "IDEA" | "DONE";
type AudienceFilter = "ALL" | "COUPLE" | "FAMILY";

interface Toast {
  id: number;
  message: string;
  action?: { label: string; run: () => void };
}

const TAB_LABEL: Record<Tab, string> = { PLANNED: "Upcoming", IDEA: "Ideas", DONE: "Done" };

/** Upcoming plans by date (undated last), then the rest by most recent. */
function sortPlans(list: PlanDTO[]) {
  return [...list].sort((a, b) => {
    if (a.startsAt && b.startsAt) return a.startsAt.localeCompare(b.startsAt);
    if (a.startsAt) return -1;
    if (b.startsAt) return 1;
    return b.createdAt.localeCompare(a.createdAt);
  });
}

export function PlansBoard({ initial }: { initial: PlansPayload }) {
  const [plans, setPlans] = useState<PlanDTO[]>(() => sortPlans(initial.plans));
  const [tab, setTab] = useState<Tab>("PLANNED");
  const [audience, setAudience] = useState<AudienceFilter>("ALL");
  const [kind, setKind] = useState<PlanKindValue | "ALL">("ALL");
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<{ open: boolean; plan: PlanDTO | null }>({ open: false, plan: null });
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

  const me = initial.currentUserId;
  const currency = initial.currency;
  const partnerName = initial.members.find((m) => m.userId !== me)?.displayName ?? "your partner";

  const upcoming = useMemo(() => sortPlans(plans.filter((p) => p.status === "PLANNED")), [plans]);
  const nextUp = upcoming.find((p) => p.startsAt && countdownLabel(p.startsAt, now) !== null) ?? null;
  const plannedBudget = plans.filter((p) => p.status === "PLANNED").reduce((sum, p) => sum + (p.budgetRupees ?? 0), 0);
  const counts = {
    PLANNED: plans.filter((p) => p.status === "PLANNED").length,
    IDEA: plans.filter((p) => p.status === "IDEA").length,
    DONE: plans.filter((p) => p.status === "DONE").length,
  };

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = plans.filter((p) => {
      if (p.status !== tab) return false;
      if (audience !== "ALL" && p.audience !== audience) return false;
      if (kind !== "ALL" && p.kind !== kind) return false;
      if (!q) return true;
      return p.title.toLowerCase().includes(q) || p.location.toLowerCase().includes(q) || p.description.toLowerCase().includes(q);
    });
    return tab === "DONE" ? list.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)) : sortPlans(list);
  }, [plans, tab, audience, kind, query]);
  const paged = usePagination(visible, `${tab}|${audience}|${kind}|${query}`);

  function pushToast(toast: Omit<Toast, "id">, ms = 6000) {
    const id = ++toastCounter.current;
    setToasts((t) => [...t, { ...toast, id }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), ms);
  }

  function openEditor(plan: PlanDTO | null) {
    setOpenSeq((s) => s + 1);
    setEditing({ open: true, plan });
  }

  function closeEditor() {
    setEditing({ open: false, plan: null });
  }

  /** Applies a change at once, sends it, and rolls back with a message if the server refuses. */
  async function patchPlan(id: string, patch: Partial<Omit<PlanDraft, "budgetRupees">> & { budgetRupees?: number | null }) {
    const before = plans.find((p) => p.id === id);
    if (!before) return;
    const optimistic: PlanDTO = {
      ...before,
      ...patch,
      budgetRupees: patch.budgetRupees === undefined ? before.budgetRupees : patch.budgetRupees,
      updatedAt: new Date().toISOString(),
    } as PlanDTO;
    setPlans((prev) => prev.map((p) => (p.id === id ? optimistic : p)));

    const result = await apiCall<{ plan: PlanDTO }>(`/api/plans/${id}`, { method: "PATCH", body: patch });
    if (!result.ok) {
      setPlans((prev) => prev.map((p) => (p.id === id ? before : p)));
      throw new Error(result.error.message);
    }
    setPlans((prev) => prev.map((p) => (p.id === id ? result.data.plan : p)));
    return result.data.plan;
  }

  async function savePlan(draft: PlanDraft) {
    if (editing.plan) {
      await patchPlan(editing.plan.id, draft);
      closeEditor();
      pushToast({ message: "Plan updated." }, 2500);
      return;
    }
    const tempId = `tmp-${crypto.randomUUID()}`;
    const stamp = new Date().toISOString();
    const optimistic: PlanDTO = {
      id: tempId,
      title: draft.title,
      description: draft.description,
      kind: draft.kind,
      audience: draft.audience,
      status: draft.status,
      startsAt: draft.startsAt,
      location: draft.location,
      budgetRupees: draft.budgetRupees,
      checklist: draft.checklist,
      createdById: me,
      createdByName: "You",
      isMine: true,
      createdAt: stamp,
      updatedAt: stamp,
    };
    setPlans((prev) => sortPlans([optimistic, ...prev]));
    setTab(draft.status);
    closeEditor();

    const result = await apiCall<{ plan: PlanDTO }>("/api/plans", { method: "POST", body: draft });
    if (!result.ok) {
      setPlans((prev) => prev.filter((p) => p.id !== tempId));
      pushToast({ message: result.error.message });
      return;
    }
    setPlans((prev) => sortPlans(prev.map((p) => (p.id === tempId ? result.data.plan : p))));
    pushToast({ message: draft.status === "DONE" ? "Lovely. Added to your done list." : "Plan saved. Your partner can see it now." }, 3500);
  }

  async function setStatus(plan: PlanDTO, status: PlanStatusValue) {
    try {
      await patchPlan(plan.id, { status });
      pushToast({ message: status === "DONE" ? `"${plan.title}" is done. Look at you two.` : `"${plan.title}" is back on the calendar.` }, 3500);
    } catch (e) {
      pushToast({ message: e instanceof Error ? e.message : "Could not update this plan." });
    }
  }

  /** Deletes at once and offers Undo for a short window. */
  const { confirm, dialog } = useConfirm();
  async function deletePlan(plan: PlanDTO) {
    if (!(await confirm({ title: "Delete this plan?", description: "It will disappear for both of you. You can undo this for a few minutes after deleting.", confirmLabel: "Delete" }))) return;
    setPlans((prev) => prev.filter((p) => p.id !== plan.id));
    const result = await apiCall<{ deleted: boolean }>(`/api/plans/${plan.id}`, { method: "DELETE" });
    if (!result.ok) {
      setPlans((prev) => sortPlans([plan, ...prev]));
      pushToast({ message: result.error.message });
      return;
    }
    pushToast({
      message: `"${plan.title}" was removed.`,
      action: {
        label: "Undo",
        run: async () => {
          const restored = await apiCall<{ plan: PlanDTO }>(`/api/plans/${plan.id}/restore`, { method: "POST" });
          if (restored.ok) {
            setPlans((prev) => sortPlans([restored.data.plan, ...prev]));
            pushToast({ message: "Plan restored." }, 2500);
          } else {
            pushToast({ message: "This plan can no longer be restored." });
          }
        },
      },
    }, 8000);
  }

  const filtersActive = audience !== "ALL" || kind !== "ALL" || query.trim() !== "";

  return (
    <div className="space-y-8">
      {dialog}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <p className="max-w-xl text-ld-body-md text-ld-on-surface-variant">
          Dates, trips and little adventures you are looking forward to. Plan them together, tick them off together.
        </p>
        <button
          type="button"
          onClick={() => openEditor(null)}
          className="hidden h-12 items-center gap-2 rounded-full bg-ld-primary px-6 text-ld-label-md text-ld-on-primary shadow-[0_8px_20px_rgba(201,126,139,0.28)] transition-colors hover:bg-ld-on-primary-fixed-variant lg:inline-flex"
        >
          <Plus className="size-5" aria-hidden="true" />
          Plan something
        </button>
      </header>

      {/* Hero and stats */}
      <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <NextUp plan={nextUp} now={now} partnerName={partnerName} onOpen={() => nextUp && openEditor(nextUp)} />
        <div className="grid grid-cols-2 gap-4">
          <Stat icon={CalendarDays} label="Coming up" value={String(counts.PLANNED)} hint="planned" />
          <Stat icon={Sparkles} label="Ideas" value={String(counts.IDEA)} hint="waiting to be picked" />
          <Stat icon={Heart} label="Done together" value={String(counts.DONE)} hint="memories made" />
          <Stat icon={Wallet} label="Planned budget" value={plannedBudget ? money(plannedBudget, currency) : "—"} hint="for upcoming plans" />
        </div>
      </div>

      {/* Filters */}
      <div className="space-y-3">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div role="tablist" aria-label="Plan status" className="inline-flex w-fit gap-1 rounded-full bg-ld-surface-container p-1">
            {(["PLANNED", "IDEA", "DONE"] as Tab[]).map((t) => (
              <button
                key={t}
                type="button"
                role="tab"
                aria-selected={tab === t}
                onClick={() => setTab(t)}
                className={cn("inline-flex h-10 items-center gap-2 rounded-full px-4 text-ld-label-md transition-colors", tab === t ? "bg-ld-surface-container-lowest text-ld-on-surface shadow-sm" : "text-ld-on-surface-variant hover:text-ld-on-surface")}
              >
                {TAB_LABEL[t]}
                <span className="rounded-full bg-ld-on-surface/5 px-1.5 text-[11px] tabular-nums">{counts[t]}</span>
              </button>
            ))}
          </div>
          <label className="relative flex h-10 w-full items-center md:max-w-xs">
            <span className="sr-only">Search plans</span>
            <Search className="pointer-events-none absolute left-4 size-4 text-ld-on-surface-variant" aria-hidden="true" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search plans"
              className="h-10 w-full rounded-full border border-ld-outline-variant bg-ld-surface-container-lowest pl-11 pr-4 text-ld-body-sm text-ld-on-surface placeholder:text-ld-outline focus:border-ld-primary focus:outline-none focus:ring-2 focus:ring-ld-primary/25"
            />
          </label>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Chip active={audience === "ALL"} onClick={() => setAudience("ALL")}>Everyone</Chip>
          <Chip active={audience === "COUPLE"} onClick={() => setAudience("COUPLE")}>{AUDIENCE_LABEL.COUPLE}</Chip>
          <Chip active={audience === "FAMILY"} onClick={() => setAudience("FAMILY")}>{AUDIENCE_LABEL.FAMILY}</Chip>
          <span aria-hidden="true" className="mx-1 h-5 w-px bg-ld-outline-variant" />
          <Chip active={kind === "ALL"} onClick={() => setKind("ALL")}>All kinds</Chip>
          {KIND_ORDER.map((k) => (
            <Chip key={k} active={kind === k} onClick={() => setKind(k)}>
              {KIND_STYLES[k].short}
            </Chip>
          ))}
          {filtersActive && (
            <button
              type="button"
              onClick={() => {
                setAudience("ALL");
                setKind("ALL");
                setQuery("");
              }}
              className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-ld-caption text-ld-primary hover:underline"
            >
              <X className="size-3.5" aria-hidden="true" />
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Grid */}
      {plans.length === 0 ? (
        <EmptyPlans onStart={() => openEditor(null)} />
      ) : visible.length === 0 ? (
        <div role="status" className="rounded-3xl border border-dashed border-ld-outline-variant px-6 py-14 text-center">
          <p className="font-display text-ld-headline-md text-ld-on-surface">
            {tab === "DONE" ? "Nothing ticked off yet." : tab === "IDEA" ? "No ideas here yet." : "Nothing planned in this view."}
          </p>
          <p className="mt-2 text-ld-body-sm text-ld-on-surface-variant">Try another filter, or start something new.</p>
        </div>
      ) : (
        <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3" aria-label={`${TAB_LABEL[tab]} plans`}>
          {paged.pageItems.map((plan) => (
            <li key={plan.id}>
              <PlanCard
                plan={plan}
                currency={currency}
                now={now}
                onOpen={() => openEditor(plan)}
                onMarkDone={() => setStatus(plan, "DONE")}
                onReopen={() => setStatus(plan, "PLANNED")}
                onDelete={() => deletePlan(plan)}
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
          label="Plans pages"
        />
      )}

      <button
        type="button"
        onClick={() => openEditor(null)}
        aria-label="Plan something"
        className="fixed bottom-24 right-5 z-40 inline-flex size-14 items-center justify-center rounded-full bg-ld-primary text-ld-on-primary shadow-[0_12px_30px_-8px_rgba(201,126,139,0.7)] transition-transform active:scale-95 lg:hidden"
      >
        <Plus className="size-6" aria-hidden="true" />
      </button>

      <PlanEditorModal key={openSeq} open={editing.open} plan={editing.plan} currency={currency} onClose={closeEditor} onSave={savePlan} />

      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-24 z-[95] flex flex-col items-center gap-2 px-4 lg:bottom-6">
        {toasts.map((t) => (
          <div key={t.id} role="status" className="pointer-events-auto flex max-w-md items-center gap-4 rounded-full bg-ld-on-surface px-5 py-3 text-ld-body-sm text-ld-surface shadow-[0_16px_40px_-16px_rgba(33,26,21,0.6)] animate-in fade-in slide-in-from-bottom-2 duration-300">
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

      <span className="sr-only">Undo stays available for {Math.round(PLAN_UNDO_WINDOW_MS / 60000)} minutes.</span>
    </div>
  );
}

function NextUp({ plan, now, partnerName, onOpen }: { plan: PlanDTO | null; now: number; partnerName: string; onOpen: () => void }) {
  if (!plan) {
    return (
      <section aria-labelledby="next-up" className="relative flex flex-col justify-center overflow-hidden rounded-3xl bg-ld-surface-container-lowest p-7 shadow-sm">
        <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-16 size-56 rounded-full bg-ld-secondary-container/50 blur-3xl" />
        <p className="text-ld-label-sm font-semibold uppercase tracking-widest text-ld-primary">Next up</p>
        <h2 id="next-up" className="mt-2 font-display text-ld-headline-md text-ld-on-surface">Nothing on the calendar yet.</h2>
        <p className="mt-2 max-w-md text-ld-body-sm text-ld-on-surface-variant">
          Pick a date night, a weekend away or a family dinner. Even a small plan feels bigger once it has a day.
        </p>
      </section>
    );
  }
  const kind = KIND_STYLES[plan.kind];
  const soon = countdownLabel(plan.startsAt, now);
  const done = plan.checklist.filter((c) => c.done).length;
  return (
    <section aria-labelledby="next-up" className={cn("relative flex flex-col gap-5 overflow-hidden rounded-3xl bg-gradient-to-br p-7 shadow-sm", kind.cover)}>
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <p className="text-ld-label-sm font-semibold uppercase tracking-widest text-ld-primary">Next up · {partnerName} & you</p>
          <h2 id="next-up" className="font-display text-ld-headline-md text-ld-on-surface sm:text-ld-headline-lg">{plan.title}</h2>
        </div>
        {soon && <span className="shrink-0 rounded-full bg-ld-surface/80 px-3 py-1.5 text-ld-label-sm font-semibold text-ld-on-surface">{soon}</span>}
      </div>
      <ul className="flex flex-wrap gap-3 text-ld-caption text-ld-on-surface-variant">
        {plan.startsAt && <li className="inline-flex items-center gap-1.5 rounded-full bg-ld-surface/70 px-3 py-1"><CalendarDays className="size-3.5" aria-hidden="true" />{new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" }).format(new Date(plan.startsAt))}</li>}
        {plan.location && <li className="inline-flex items-center gap-1.5 rounded-full bg-ld-surface/70 px-3 py-1"><MapPin className="size-3.5" aria-hidden="true" />{plan.location}</li>}
        {plan.checklist.length > 0 && <li className="inline-flex items-center gap-1.5 rounded-full bg-ld-surface/70 px-3 py-1">{done} of {plan.checklist.length} ready</li>}
      </ul>
      <button type="button" onClick={onOpen} className="inline-flex h-11 w-fit items-center gap-2 rounded-full bg-ld-on-surface px-5 text-ld-label-md text-ld-surface transition-colors hover:bg-ld-on-surface/85">
        Open plan
      </button>
    </section>
  );
}

function Stat({ icon: Icon, label, value, hint }: { icon: typeof Heart; label: string; value: string; hint: string }) {
  return (
    <div className="flex flex-col justify-between gap-3 rounded-3xl bg-ld-surface-container-lowest p-5 shadow-sm">
      <Icon className="size-4 text-ld-primary" aria-hidden="true" />
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
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn("rounded-full px-3 py-1.5 text-ld-caption transition-colors", active ? "bg-ld-on-surface text-ld-surface" : "bg-ld-surface-container text-ld-on-surface-variant hover:bg-ld-surface-container-high")}
    >
      {children}
    </button>
  );
}

function EmptyPlans({ onStart }: { onStart: () => void }) {
  return (
    <section aria-labelledby="plans-empty" className="relative overflow-hidden rounded-3xl bg-ld-surface-container-lowest px-6 py-16 text-center shadow-sm">
      <div aria-hidden="true" className="pointer-events-none absolute -left-16 -top-16 size-64 rounded-full bg-ld-secondary-container/40 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-20 -right-10 size-64 rounded-full bg-ld-tertiary-fixed/50 blur-3xl" />
      <div className="relative flex flex-col items-center gap-5">
        <span className="flex size-16 items-center justify-center rounded-full bg-ld-secondary-container/50 text-ld-primary">
          <CalendarDays className="size-7" aria-hidden="true" />
        </span>
        <div className="space-y-2">
          <h2 id="plans-empty" className="font-display text-ld-headline-md text-ld-on-surface">Your next adventure starts with one idea.</h2>
          <p className="mx-auto max-w-md text-ld-body-sm text-ld-on-surface-variant">
            Plan a date night, a weekend away or a family dinner. Add a checklist so nothing gets forgotten.
          </p>
        </div>
        <button type="button" onClick={onStart} className="inline-flex h-12 items-center gap-2 rounded-full bg-ld-primary px-6 text-ld-label-md text-ld-on-primary shadow-[0_8px_20px_rgba(201,126,139,0.28)] transition-colors hover:bg-ld-on-primary-fixed-variant">
          <Plus className="size-5" aria-hidden="true" />
          Plan something
        </button>
      </div>
    </section>
  );
}
