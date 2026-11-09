"use client";

import { CalendarDays, Check, MapPin, Pencil, Trash2, Undo2, Wallet } from "lucide-react";
import { AUDIENCE_LABEL, KIND_STYLES, STATUS_LABEL } from "@/components/plans/plan-kinds";
import type { PlanDTO } from "@/lib/plans-types";
import { cn } from "@/lib/utils";

const dateFmt = new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
import { formatMoney } from "@/lib/locale";

/** An amount in the space currency, e.g. ₹5,000 or $5,000. */
export function money(value: number, currency: string) {
  return formatMoney(value, currency);
}

/** Friendly "in 3 days" / "tomorrow" / "today" for a start time, or null when it has passed. */
export function countdownLabel(startsAt: string | null, now: number): string | null {
  if (!startsAt) return null;
  const diff = new Date(startsAt).getTime() - now;
  if (diff < 0) return null;
  const hours = diff / 3_600_000;
  if (hours < 24) return hours < 1 ? "within the hour" : `in ${Math.round(hours)} hours`;
  const days = Math.ceil(hours / 24);
  if (days === 1) return "tomorrow";
  return `in ${days} days`;
}

interface PlanCardProps {
  plan: PlanDTO;
  currency: string;
  now: number;
  onOpen: () => void;
  onMarkDone: () => void;
  onReopen: () => void;
  onDelete: () => void;
}

/** A plan as a card: a coloured cover for its kind, the date and place, progress and the people it is for. */
export function PlanCard({ plan, currency, now, onOpen, onMarkDone, onReopen, onDelete }: PlanCardProps) {
  const kind = KIND_STYLES[plan.kind];
  const Icon = kind.icon;
  const done = plan.checklist.filter((c) => c.done).length;
  const total = plan.checklist.length;
  const percent = total ? Math.round((done / total) * 100) : 0;
  const soon = countdownLabel(plan.startsAt, now);
  const pending = plan.id.startsWith("tmp-");
  const isDone = plan.status === "DONE";

  return (
    <article
      aria-busy={pending}
      className={cn(
        "group flex flex-col overflow-hidden rounded-3xl bg-ld-surface-container-lowest shadow-sm ring-1 ring-ld-on-surface/5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_44px_-24px_rgba(64,56,50,0.4)]",
        pending && "opacity-70",
        isDone && "opacity-85"
      )}
    >
      <button type="button" onClick={onOpen} aria-label={`Open plan: ${plan.title}`} className="flex flex-1 flex-col text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-ld-primary">
        <div className={cn("relative flex h-24 items-end justify-between bg-gradient-to-br p-4", kind.cover)}>
          <span className="inline-flex items-center gap-2 rounded-full bg-ld-surface/80 px-3 py-1 text-ld-caption font-medium text-ld-on-surface">
            <Icon className="size-3.5 text-ld-primary" aria-hidden="true" />
            {kind.short}
          </span>
          <div className="flex items-center gap-1.5">
            {plan.audience === "FAMILY" && (
              <span className="rounded-full bg-ld-tertiary/90 px-2.5 py-1 text-[11px] font-semibold text-ld-on-tertiary">Family</span>
            )}
            <span className={cn("rounded-full px-2.5 py-1 text-[11px] font-semibold", isDone ? "bg-ld-on-surface text-ld-surface" : "bg-ld-surface/80 text-ld-on-surface")}>
              {STATUS_LABEL[plan.status]}
            </span>
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-3 p-5">
          <h3 className={cn("font-display text-ld-title-lg leading-snug text-ld-on-surface", isDone && "line-through decoration-ld-outline")}>{plan.title}</h3>
          {plan.description && <p className="line-clamp-2 text-ld-body-sm text-ld-on-surface-variant">{plan.description}</p>}

          <ul className="flex flex-col gap-1.5 text-ld-caption text-ld-on-surface-variant">
            {plan.startsAt && (
              <li className="flex items-center gap-2">
                <CalendarDays className="size-3.5 shrink-0" aria-hidden="true" />
                <span>{dateFmt.format(new Date(plan.startsAt))}</span>
                {soon && !isDone && <span className="rounded-full bg-ld-secondary-container/60 px-2 py-0.5 text-[11px] text-ld-on-secondary-container">{soon}</span>}
              </li>
            )}
            {plan.location && (
              <li className="flex items-center gap-2">
                <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
                <span className="truncate">{plan.location}</span>
              </li>
            )}
            {plan.budgetRupees !== null && (
              <li className="flex items-center gap-2">
                <Wallet className="size-3.5 shrink-0" aria-hidden="true" />
                <span>{money(plan.budgetRupees, currency)} budget</span>
              </li>
            )}
          </ul>

          {total > 0 && (
            <div className="mt-auto space-y-1.5 pt-1">
              <div className="flex justify-between text-[11px] text-ld-on-surface-variant">
                <span>Checklist</span>
                <span className="tabular-nums">{done} of {total}</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-ld-surface-container" role="progressbar" aria-label="Checklist progress" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}>
                <div className="h-full rounded-full bg-ld-primary transition-all duration-500" style={{ width: `${percent}%` }} />
              </div>
            </div>
          )}
        </div>
      </button>

      <footer className="flex items-center justify-between gap-2 border-t border-ld-on-surface/5 px-4 py-3">
        <p className="min-w-0 truncate text-ld-caption text-ld-on-surface-variant">
          {AUDIENCE_LABEL[plan.audience]} · {plan.createdByName}
        </p>
        <div className="flex shrink-0 items-center gap-1">
          {isDone ? (
            <button type="button" onClick={onReopen} disabled={pending} aria-label="Move back to planned" className="inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-ld-caption text-ld-on-surface-variant hover:bg-ld-on-surface/5 disabled:opacity-40">
              <Undo2 className="size-3.5" aria-hidden="true" />
              Reopen
            </button>
          ) : (
            <button type="button" onClick={onMarkDone} disabled={pending} aria-label="Mark as done" className="inline-flex h-9 items-center gap-1.5 rounded-full bg-ld-tertiary-fixed/60 px-3 text-ld-caption font-medium text-ld-on-tertiary-fixed-variant transition-colors hover:bg-ld-tertiary-fixed disabled:opacity-40">
              <Check className="size-3.5" aria-hidden="true" />
              Done
            </button>
          )}
          <button type="button" onClick={onOpen} disabled={pending} aria-label="Edit plan" className="inline-flex size-9 items-center justify-center rounded-full text-ld-on-surface-variant hover:bg-ld-on-surface/5 disabled:opacity-40">
            <Pencil className="size-4" aria-hidden="true" />
          </button>
          <button type="button" onClick={onDelete} disabled={pending} aria-label="Delete plan" className="inline-flex size-9 items-center justify-center rounded-full text-ld-on-surface-variant hover:bg-ld-error/10 hover:text-ld-error disabled:opacity-40">
            <Trash2 className="size-4" aria-hidden="true" />
          </button>
        </div>
      </footer>
    </article>
  );
}
