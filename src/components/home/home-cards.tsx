import Link from "next/link";
import {
  ArrowRight,
  Check,
  Clock,
  Compass,
  Gem,
  Heart,
  Hourglass,
  LucideIcon,
  MapPin,
  MessageCircle,
  PartyPopper,
  Sparkles,
} from "lucide-react";
import { daysUntilNextAnnual, formatDate } from "@/lib/dates";
import { cn } from "@/lib/utils";

/** Shared card shell for the home dashboard, in the landing palette. */
export function HomeCard({
  id,
  title,
  eyebrow,
  action,
  className,
  children,
}: {
  id: string;
  title: string;
  eyebrow?: string;
  action?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      aria-labelledby={`${id}-title`}
      className={cn("flex flex-col gap-6 rounded-3xl bg-ld-surface-container-lowest p-6 shadow-sm md:p-7", className)}
    >
      <header className="flex items-start justify-between gap-4">
        <div className="min-w-0 space-y-1">
          {eyebrow && <p className="text-ld-label-sm font-semibold uppercase tracking-wider text-ld-primary">{eyebrow}</p>}
          <h2 id={`${id}-title`} className="font-display text-ld-headline-md text-ld-on-surface">
            {title}
          </h2>
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </header>
      {children}
    </section>
  );
}

/** Shown in a card that has nothing to display yet. Keeps the card's space so the layout does not jump. */
export function EmptyState({
  icon: Icon,
  message,
  href,
  cta,
}: {
  icon: LucideIcon;
  message: string;
  href?: string;
  cta?: string;
}) {
  return (
    <div className="flex min-h-[200px] flex-1 flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-ld-outline-variant/70 bg-ld-surface/60 p-6 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-ld-secondary-container/40 text-ld-primary">
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <p className="max-w-xs text-ld-body-sm text-ld-on-surface-variant">{message}</p>
      {href && cta && (
        <Link href={href} className="inline-flex h-10 items-center gap-2 rounded-full bg-ld-surface-container-lowest px-5 text-ld-label-sm text-ld-primary shadow-sm ring-1 ring-ld-outline-variant/50 hover:bg-ld-surface">
          {cta}
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      )}
    </div>
  );
}

export function ViewLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="inline-flex items-center gap-1 text-ld-label-md font-medium text-ld-primary hover:underline">
      {label}
      <ArrowRight className="size-4" aria-hidden="true" />
    </Link>
  );
}

/* ---------- Relationship counter and anniversary ---------- */

export function AnniversaryCard({
  label,
  month,
  day,
  timezone,
  now,
}: {
  label: string;
  month: number;
  day: number;
  timezone: string;
  now: Date;
}) {
  const days = daysUntilNextAnnual(month, day, now, timezone);
  const date = formatDate(new Date(Date.UTC(2000, month - 1, day)), { day: "numeric", month: "long" }, "UTC");
  return (
    <HomeCard id="anniversary" title={label} eyebrow="Next special day" className="bg-ld-surface-container">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="font-display text-[56px] font-semibold leading-none text-ld-primary">{days === 0 ? "Today" : days}</p>
          <p className="mt-2 text-ld-body-sm text-ld-on-surface-variant">
            {days === 0 ? "Happy day to you both." : days === 1 ? "day to go" : "days to go"} · {date}
          </p>
        </div>
        <PartyPopper className="size-10 text-ld-primary/60" aria-hidden="true" />
      </div>
    </HomeCard>
  );
}

/** Used when the couple has no special day yet. */
export function NoSpecialDayCard() {
  return (
    <HomeCard id="anniversary" title="Next special day" eyebrow="Special days" className="bg-ld-surface-container">
      <EmptyState
        icon={Gem}
        message="No special day yet. Add an anniversary or a birthday and we will count down to it."
        href="/app/special-days"
        cta="Add a special day"
      />
    </HomeCard>
  );
}

/* ---------- Daily question ---------- */

export function DailyQuestionCard({
  question,
  category,
  myAnswerSubmitted,
  partnerAnswered,
  partnerName,
}: {
  question: string;
  category: string;
  myAnswerSubmitted: boolean;
  partnerAnswered: boolean;
  partnerName: string;
}) {
  return (
    <HomeCard
      id="daily-question"
      title="Today's question"
      eyebrow={category}
      className="bg-ld-surface-container-low"
      action={<MessageCircle className="size-5 text-ld-primary" aria-hidden="true" />}
    >
      <p className="font-display text-ld-headline-md leading-snug text-ld-on-surface">&ldquo;{question}&rdquo;</p>
      <div className="flex flex-col gap-2 text-ld-body-sm text-ld-on-surface-variant">
        <span className="inline-flex items-center gap-2">
          {myAnswerSubmitted ? <Check className="size-4 text-ld-tertiary" /> : <Clock className="size-4" />}
          {myAnswerSubmitted ? "You have answered" : "Your answer is waiting"}
        </span>
        <span className="inline-flex items-center gap-2">
          <span className={cn("size-2 rounded-full", partnerAnswered ? "bg-ld-tertiary" : "bg-ld-outline-variant")} />
          {partnerAnswered ? `${partnerName} has answered` : `${partnerName} hasn't answered yet`}
        </span>
      </div>
      <Link
        href="/app/daily-question"
        className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-ld-primary px-6 text-ld-label-md text-ld-on-primary transition-colors hover:bg-ld-on-primary-fixed-variant"
      >
        {myAnswerSubmitted ? "View today's question" : "Answer today's question"}
      </Link>
    </HomeCard>
  );
}

/* ---------- Recent memories ---------- */

export interface MemoryPreview {
  id: string;
  title: string;
  date: string;
  location: string | null;
  photoCount: number;
  favourite: boolean;
  tone: "rose" | "stone" | "sage";
}

const TILE: Record<MemoryPreview["tone"], string> = {
  rose: "from-ld-secondary-container to-ld-surface-container",
  stone: "from-ld-surface-container-highest to-ld-outline-variant/60",
  sage: "from-ld-tertiary-fixed to-ld-surface-container",
};

export function RecentMemoriesCard({ memories }: { memories: MemoryPreview[] }) {
  return (
    <HomeCard
      id="recent-memories"
      title="Recent memories"
      eyebrow="Our memories"
      className="min-h-[300px]"
      action={<ViewLink href="/app/memories" label="View all" />}
    >
      {memories.length === 0 ? (
        <EmptyState icon={Heart} message="No memories yet. Save your first photo or a moment you want to keep." href="/app/memories" cta="Add a memory" />
      ) : (
        <ul className="grid gap-5 sm:grid-cols-3">
          {memories.map((m) => (
            <li key={m.id}>
              <Link href="/app/memories" className="group block space-y-3">
                <div className={cn("relative aspect-[4/3] overflow-hidden rounded-2xl bg-gradient-to-br transition-transform duration-500 group-hover:-translate-y-0.5", TILE[m.tone])}>
                  <span className="absolute bottom-2 left-2 rounded-full bg-ld-surface/90 px-2.5 py-1 text-[11px] text-ld-on-surface">
                    {m.photoCount} photos
                  </span>
                  {m.favourite && (
                    <Heart className="absolute right-3 top-3 size-4 fill-ld-primary text-ld-primary" aria-label="Favourite" />
                  )}
                </div>
                <div>
                  <p className="line-clamp-1 text-ld-body-sm font-semibold text-ld-on-surface">{m.title}</p>
                  <p className="flex items-center gap-1 text-ld-caption text-ld-on-surface-variant">
                    {formatDate(new Date(m.date), { day: "numeric", month: "short" }, "UTC")}
                    {m.location && (
                      <>
                        <span aria-hidden="true">·</span>
                        <MapPin className="size-3" aria-hidden="true" />
                        {m.location}
                      </>
                    )}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </HomeCard>
  );
}

/* ---------- Notes ---------- */

export interface NotePreview {
  id: string;
  title: string;
  excerpt: string;
  author: string;
  updatedAt: string;
  pinned: boolean;
}

export function RecentNotesCard({ notes }: { notes: NotePreview[] }) {
  return (
    <HomeCard id="recent-notes" title="Our notes" className="min-h-[300px]" action={<ViewLink href="/app/notes" label="Open" />}>
      {notes.length === 0 ? (
        <EmptyState icon={Sparkles} message="No notes yet. Start a shared note for groceries, ideas or a sweet reminder." href="/app/notes" cta="Write a note" />
      ) : (
        <ul className="flex flex-col gap-5">
          {notes.map((n) => (
            <li key={n.id} className="flex gap-3">
              <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-ld-surface-container text-ld-label-sm font-semibold text-ld-on-surface">
                {n.author.charAt(0)}
              </span>
              <div className="min-w-0">
                <p className="flex items-center gap-2 text-ld-body-sm font-semibold text-ld-on-surface">
                  <span className="truncate">{n.title}</span>
                  {n.pinned && <span className="shrink-0 rounded-full bg-ld-secondary-container/50 px-2 py-0.5 text-[10px] text-ld-primary">Pinned</span>}
                </p>
                <p className="line-clamp-2 text-ld-body-sm text-ld-on-surface-variant">{n.excerpt}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </HomeCard>
  );
}

/* ---------- Plans ---------- */

export interface PlanPreview {
  id: string;
  title: string;
  type: string;
  when: string;
  location: string | null;
  checklistDone: number;
  checklistTotal: number;
}

export function UpcomingPlansCard({ plans, timezone }: { plans: PlanPreview[]; timezone: string }) {
  return (
    <HomeCard id="upcoming-plans" title="Upcoming plans" className="min-h-[300px]" action={<ViewLink href="/app/plans" label="All" />}>
      {plans.length === 0 ? (
        <EmptyState icon={Compass} message="No upcoming plans. Plan your next date, trip or project together." href="/app/plans" cta="Plan something" />
      ) : (
        <ul className="flex flex-col gap-4">
          {plans.map((p) => (
            <li key={p.id} className="flex items-center gap-3 rounded-xl bg-ld-surface-container-low p-3.5">
              <div className="flex size-11 shrink-0 flex-col items-center justify-center rounded-lg bg-ld-surface-container-highest text-ld-on-surface">
                <span className="text-[10px] font-bold uppercase text-ld-primary">
                  {formatDate(new Date(p.when), { month: "short" }, timezone)}
                </span>
                <span className="text-[15px] font-bold leading-none">
                  {formatDate(new Date(p.when), { day: "2-digit" }, timezone)}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-ld-body-sm font-semibold text-ld-on-surface">{p.title}</p>
                <p className="truncate text-ld-caption text-ld-on-surface-variant">
                  {p.type} · {p.location ?? "Location to be decided"} · {p.checklistDone}/{p.checklistTotal} ready
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </HomeCard>
  );
}

/* ---------- Bucket list ---------- */

export function BucketListProgressCard({
  total,
  completed,
  nextItems,
}: {
  total: number;
  completed: number;
  nextItems: { id: string; title: string; category: string }[];
}) {
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);
  return (
    <HomeCard id="bucket-progress" title="Bucket list" className="min-h-[300px]" action={<ViewLink href="/app/bucket-list" label="Open" />}>
      {total === 0 ? (
        <EmptyState icon={Hourglass} message="Your bucket list is empty. Add the first dream you want to chase together." href="/app/bucket-list" cta="Add a dream" />
      ) : (
        <>
          <div className="space-y-2">
            <div className="flex items-baseline justify-between">
              <span className="font-display text-[40px] leading-none text-ld-primary">{percent}%</span>
              <span className="text-ld-caption text-ld-on-surface-variant">
                {completed} of {total} dreams
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-ld-surface-container" role="progressbar" aria-label="Bucket list progress" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}>
              <div className="h-full rounded-full bg-ld-primary transition-all duration-700" style={{ width: `${percent}%` }} />
            </div>
          </div>
          <ul className="flex flex-col gap-2">
            {nextItems.length === 0 ? (
              <li className="rounded-lg bg-ld-surface-container-low px-3 py-2.5 text-ld-body-sm text-ld-on-surface-variant">Every dream is done. Add a new one.</li>
            ) : (
              nextItems.map((item, i) => {
                const Icon = i === 0 ? Compass : i === 1 ? Sparkles : Hourglass;
                return (
                  <li key={item.id} className="flex items-center justify-between gap-3 rounded-lg bg-ld-surface-container-low px-3 py-2.5 text-ld-body-sm">
                    <span className="flex min-w-0 items-center gap-2.5">
                      <Icon className="size-4 shrink-0 text-ld-primary" aria-hidden="true" />
                      <span className="truncate text-ld-on-surface">{item.title}</span>
                    </span>
                    <span className="shrink-0 text-ld-caption text-ld-on-surface-variant">{item.category}</span>
                  </li>
                );
              })
            )}
          </ul>
        </>
      )}
    </HomeCard>
  );
}

/* ---------- Activity ---------- */

export interface ActivityItem {
  id: string;
  actor: string;
  text: string;
  target: string;
  at: string;
}

export function RecentActivityCard({ items, timezone }: { items: ActivityItem[]; timezone: string }) {
  return (
    <HomeCard id="recent-activity" title="Recent activity" eyebrow="Together" className="min-h-[300px]">
      {items.length === 0 ? (
        <EmptyState icon={Clock} message="Nothing yet. Notes, memories and finished dreams will appear here as you both add them." />
      ) : (
        <ol className="relative flex flex-col gap-5 border-l border-ld-outline-variant/60 pl-6">
          {items.map((item) => (
            <li key={item.id} className="relative">
              <span className="absolute -left-[29px] top-1.5 size-2.5 rounded-full bg-ld-primary-container ring-4 ring-ld-surface-container-lowest" aria-hidden="true" />
              <p className="text-ld-body-sm text-ld-on-surface">
                <span className="font-semibold">{item.actor}</span> {item.text}
              </p>
              <p className="text-ld-caption text-ld-on-surface-variant">
                &ldquo;{item.target}&rdquo; · {formatDate(new Date(item.at), { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }, timezone)}
              </p>
            </li>
          ))}
        </ol>
      )}
    </HomeCard>
  );
}

/* ---------- Premium (free plan) ---------- */

export function PremiumUpgradeCard() {
  return (
    <section
      aria-labelledby="premium-card-heading"
      className="relative flex flex-col gap-5 overflow-hidden rounded-3xl bg-ld-surface-container-lowest p-7 shadow-sm ring-1 ring-ld-secondary-container md:flex-row md:items-center md:justify-between"
    >
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-16 -left-10 size-56 rounded-full bg-ld-secondary-container/40 blur-3xl" />
      <div className="relative max-w-xl space-y-2">
        <p className="text-ld-label-sm font-semibold uppercase tracking-wider text-ld-primary">Pro and Max</p>
        <h2 id="premium-card-heading" className="font-display text-ld-headline-md text-ld-on-surface">
          Make room for the whole story.
        </h2>
        <p className="text-ld-body-sm text-ld-on-surface-variant">
          Unlimited notes, plans and calendar events, scheduled letters, the full game library and monthly AI credits. One payment covers you both.
        </p>
      </div>
      <Link
        href="/app/subscriptions"
        className="relative inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-ld-primary px-7 text-ld-label-md text-ld-on-primary shadow-[0_6px_20px_rgba(201,126,139,0.25)] transition-colors hover:bg-ld-on-primary-fixed-variant"
      >
        See plans
        <ArrowRight className="size-4" aria-hidden="true" />
      </Link>
    </section>
  );
}

/* ---------- Add your partner (shown while the space has one person) ---------- */

export function AddPartnerCard() {
  return (
    <section
      aria-labelledby="add-partner-title"
      className="relative flex flex-col gap-5 overflow-hidden rounded-3xl bg-ld-secondary-container/30 p-7 shadow-sm md:flex-row md:items-center md:justify-between"
    >
      <div className="relative max-w-xl space-y-2">
        <p className="text-ld-label-sm font-semibold uppercase tracking-wider text-ld-primary">Your space is ready</p>
        <h2 id="add-partner-title" className="font-display text-ld-headline-md text-ld-on-surface">
          Add your partner.
        </h2>
        <p className="text-ld-body-sm text-ld-on-surface-variant">
          Share your 6-character space code with them. Once they enter it, you will both see the same memories, plans and calendar.
        </p>
      </div>
      <Link
        href="/app/settings"
        className="relative inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-ld-primary px-7 text-ld-label-md text-ld-on-primary shadow-[0_6px_20px_rgba(201,126,139,0.25)] transition-colors hover:bg-ld-on-primary-fixed-variant"
      >
        Get my space code
        <ArrowRight className="size-4" aria-hidden="true" />
      </Link>
    </section>
  );
}
