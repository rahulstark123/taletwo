import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BookHeart,
  CalendarDays,
  Camera,
  Gem,
  ListChecks,
  Mail,
  MessageCircleHeart,
  NotebookPen,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Couples app features: memories, love letters, plans and games",
  description:
    "Shared memories, notes, love letters, plans, bucket lists, special days, daily questions and a shared calendar, all in one private space for two.",
  alternates: { canonical: "/features" },
  openGraph: { title: "TaleTwo features", url: "/features" },
};

interface Feature {
  id: string;
  icon: LucideIcon;
  title: string;
  body: string;
  bullets: string[];
  preview: ReactNode;
}

function Tile({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("rounded-[14px] border border-border bg-surface p-4 shadow-soft", className)}>{children}</div>;
}

const FEATURES: Feature[] = [
  {
    id: "memories",
    icon: Camera,
    title: "Shared Memories",
    body: "A private photo journal. Upload several photos, add a title, caption, place and date, then find any moment by search, tag or timeline.",
    bullets: ["Multiple photos per memory", "Tags, categories and locations", "Grid and timeline views", "Favourites"],
    preview: (
      <div className="grid grid-cols-3 gap-2">
        {["from-brand-accent/60", "from-success/30", "from-surface-muted", "from-border", "from-brand-accent/40", "from-success/20"].map((g, i) => (
          <div key={i} className={cn("aspect-square rounded-[10px] bg-gradient-to-br to-surface-muted", g)} />
        ))}
      </div>
    ),
  },
  {
    id: "notes",
    icon: NotebookPen,
    title: "Our Notes",
    body: "Shared notes for ideas, reminders and everyday thoughts. Pin the ones that matter and see who wrote and updated each one.",
    bullets: ["Rich text formatting", "Pin and search", "Created by, last updated"],
    preview: (
      <div className="space-y-3">
        <Tile>
          <p className="text-sm font-semibold text-foreground">Things to pick up this weekend</p>
          <p className="mt-1 text-xs text-muted-foreground">Good coffee beans, the blue candles…</p>
        </Tile>
        <Tile>
          <p className="text-sm font-semibold text-foreground">Ideas for our next dinner</p>
          <p className="mt-1 text-xs text-muted-foreground">Somewhere with a view, no rush…</p>
        </Tile>
      </div>
    ),
  },
  {
    id: "letters",
    icon: Mail,
    title: "Love Letters",
    body: "Write a letter and send it now, save it as a draft, or schedule it for later. Letters can be sealed for a moment such as “Open when you miss me”.",
    bullets: ["Drafts stay private to you", "Scheduled release times", "Read and unread status", "Letter templates"],
    preview: (
      <Tile className="border-brand-accent/50">
        <p className="text-eyebrow">Open when you need a smile</p>
        <p className="mt-3 font-display text-lg leading-snug text-foreground">Remember the terrible pancakes? I would eat them every Sunday.</p>
      </Tile>
    ),
  },
  {
    id: "plans",
    icon: Sparkles,
    title: "Our Plans",
    body: "Date nights, trips and weekend experiences, each with a description, a time, a location, an optional budget and a checklist.",
    bullets: ["Planned and completed status", "Checklists", "Optional budget", "Shown on the shared calendar"],
    preview: (
      <Tile>
        <p className="text-eyebrow">Trip</p>
        <p className="mt-2 font-display text-lg text-foreground">Weekend in the hills</p>
        <p className="text-xs text-muted-foreground">Coorg · 5 Dec</p>
        <div className="mt-3 h-1.5 rounded-full bg-surface-muted">
          <div className="h-full w-1/3 rounded-full bg-brand-primary" />
        </div>
      </Tile>
    ),
  },
  {
    id: "bucket-list",
    icon: ListChecks,
    title: "Bucket List",
    body: "Shared dreams with categories, priorities and target dates. Complete an item and add a memory of how it went.",
    bullets: ["Travel, food, adventures and more", "Progress percentage", "Completion memories", "Filter pending or done"],
    preview: (
      <Tile>
        <div className="flex items-baseline justify-between">
          <span className="font-display text-3xl text-foreground">33%</span>
          <span className="text-xs text-muted-foreground">4 of 12 dreams</span>
        </div>
        <div className="mt-3 h-2 rounded-full bg-surface-muted">
          <div className="h-full w-1/3 rounded-full bg-brand-primary" />
        </div>
      </Tile>
    ),
  },
  {
    id: "special-days",
    icon: Gem,
    title: "Special Days",
    body: "Anniversaries, birthdays, first meetings and custom dates, each with a countdown, an annual repeat and reminder preferences.",
    bullets: ["Countdown to the next date", "Repeats every year", "Time-zone aware"],
    preview: (
      <Tile className="flex items-center justify-between">
        <div>
          <p className="font-display text-lg text-foreground">Our anniversary</p>
          <p className="text-xs text-muted-foreground">14 March</p>
        </div>
        <p className="font-display text-3xl text-foreground">126</p>
      </Tile>
    ),
  },
  {
    id: "daily-questions",
    icon: MessageCircleHeart,
    title: "Daily Questions",
    body: "One question each day. Answer independently and reveal your answers when you are both ready. Nobody sees the other's answer before then.",
    bullets: ["Fun, memories, deep conversations, future and romance", "Private until revealed", "Answer history"],
    preview: (
      <Tile>
        <p className="text-eyebrow">Romance</p>
        <p className="mt-2 font-display text-lg leading-snug text-foreground">What is one little thing I do that makes you happy?</p>
        <p className="mt-3 text-xs text-muted-foreground">Your partner&apos;s answer stays hidden until you reveal.</p>
      </Tile>
    ),
  },
  {
    id: "calendar",
    icon: CalendarDays,
    title: "Shared Calendar",
    body: "A monthly calendar with special days, plans and date nights in consistent colours. Add, edit and remind yourselves of what is coming.",
    bullets: ["Monthly and weekly views", "Event descriptions", "Reminder preferences"],
    preview: (
      <Tile>
        <div className="grid grid-cols-7 gap-1 text-center text-[10px] text-muted-foreground">
          {Array.from({ length: 14 }, (_, i) => (
            <span
              key={i}
              className={cn(
                "flex aspect-square items-center justify-center rounded-md",
                i === 3 && "bg-event-rose/40 text-foreground",
                i === 9 && "bg-event-plum/40 text-on-primary",
                i === 12 && "bg-event-sage/40 text-foreground"
              )}
            >
              {i + 1}
            </span>
          ))}
        </div>
      </Tile>
    ),
  },
];

export default function FeaturesPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-24 px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
      <PageHeader
        eyebrow="Features"
        title="Everything a couple needs, quietly in one place."
        description="Each part of TaleTwo is built for two people. Your memories, words and plans are shared only between you and your partner."
      />

      {FEATURES.map((feature, index) => (
        <section
          key={feature.id}
          id={feature.id}
          aria-labelledby={`${feature.id}-title`}
          className={cn(
            "grid scroll-mt-24 items-center gap-10 lg:grid-cols-2 lg:gap-16",
            index % 2 === 1 && "lg:[&>*:first-child]:order-2"
          )}
        >
          <div className="space-y-5">
            <span className="flex size-11 items-center justify-center rounded-full bg-brand-accent/25 text-brand-primary">
              <feature.icon className="size-5" aria-hidden="true" />
            </span>
            <h2 id={`${feature.id}-title`} className="text-section-title text-foreground">
              {feature.title}
            </h2>
            <p className="text-base leading-relaxed text-muted-foreground">{feature.body}</p>
            <ul className="grid gap-2 sm:grid-cols-2">
              {feature.bullets.map((b) => (
                <li key={b} className="flex items-start gap-2 text-sm text-foreground">
                  <span aria-hidden="true" className="mt-2 size-1.5 shrink-0 rounded-full bg-brand-primary" />
                  {b}
                </li>
              ))}
            </ul>
          </div>
          <div className="surface-card p-6 sm:p-8">{feature.preview}</div>
        </section>
      ))}

      <div className="flex flex-col items-center gap-4 rounded-card border border-border bg-surface px-6 py-12 text-center shadow-soft">
        <BookHeart className="size-6 text-brand-primary" aria-hidden="true" />
        <h2 className="text-section-title text-foreground">Ready to build your little world?</h2>
        <Button size="lg" render={<Link href="/signup" />}>
          Create Your Space <ArrowRight className="size-4" aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}
