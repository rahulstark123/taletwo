import Link from "next/link";
import {
  Camera,
  CalendarDays,
  Coins,
  Gamepad2,
  Gem,
  KeyRound,
  LifeBuoy,
  ListChecks,
  Mail,
  MessageCircleHeart,
  NotebookPen,
  Route,
  Stars,
  type LucideIcon,
} from "lucide-react";
import { LandingSection, SectionIntro } from "@/components/landing/sections";
import { AI_FEATURE_COSTS, PLAN_AI_CREDITS_PER_MONTH, SIGNUP_AI_CREDITS } from "@/config/ai-credits";
import { cn } from "@/lib/utils";

/* ---------------- Everything in one place ---------------- */

const MODULES: { icon: LucideIcon; title: string; body: string; tag?: string }[] = [
  { icon: Camera, title: "Memories", body: "Photos and moments in a private archive, with places, dates and captions. Photos are compressed so they load fast." },
  { icon: NotebookPen, title: "Our Notes", body: "Shared notes in soft colours, pinned when they matter. Either of you can add, edit or restore a recent delete." },
  { icon: Mail, title: "Love Letters", body: "Write a letter for today, schedule one for later, or seal an “Open When” letter for a hard day." },
  { icon: Route, title: "Our Plans", body: "Trips, dates and projects with budgets, countdowns and a status for each one." },
  { icon: ListChecks, title: "Bucket List", body: "The things you want to do together, sorted by category and priority. Tick them off with a memory." },
  { icon: Gem, title: "Special Days", body: "Anniversaries and birthdays with countdowns and reminders, so nothing important slips by." },
  { icon: MessageCircleHeart, title: "Daily Questions", body: "One gentle question each day. You each answer privately, and it opens up when you are both ready." },
  { icon: CalendarDays, title: "Calendar", body: "Date nights, plans, special days and dreams on one calendar, in month, week or agenda view." },
  { icon: Gamepad2, title: "Couple Games", body: "Twenty-one games to play together, from Truth or Dare to Caption Contest, for any mood." },
  { icon: Stars, title: "Astro AI", body: "Vedic and numerology guidance on love, money, career and more. Currently in preview.", tag: "Preview" },
  { icon: LifeBuoy, title: "Support", body: "Raise a ticket when something is wrong, or suggest an improvement. We read every one." },
];

export function ModulesGrid() {
  return (
    <LandingSection id="everything" className="bg-ld-surface-container-low py-20 md:py-24">
      <div className="flex flex-col gap-12">
        <SectionIntro
          eyebrow="Everything in one space"
          title="Eleven little rooms for the two of you."
          body="Each part of TaleTwo does one job well, and they all share the same private space."
        />
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {MODULES.map((m) => (
            <li key={m.title} className="flex flex-col gap-3 rounded-3xl bg-ld-surface-container-lowest p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="flex size-11 items-center justify-center rounded-2xl bg-ld-secondary-container/40 text-ld-primary">
                  <m.icon className="size-5" aria-hidden="true" />
                </span>
                {m.tag && (
                  <span className="rounded-full bg-ld-on-surface px-2.5 py-0.5 text-[11px] font-semibold text-ld-surface">{m.tag}</span>
                )}
              </div>
              <h3 className="font-display text-ld-title-lg text-ld-on-surface">{m.title}</h3>
              <p className="text-ld-body-sm text-ld-on-surface-variant">{m.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </LandingSection>
  );
}

/* ---------------- Connect with a space code ---------------- */

const CONNECT_STEPS: { title: string; body: string }[] = [
  { title: "Each of you gets a code", body: "Sign up and your account gets its own 6-character space code. It is yours to keep." },
  { title: "Enter your partner's code", body: "On sign-up, onboarding or in Settings, type their code. You can also paste a link." },
  { title: "You are in one space", body: "Your space holds exactly two people, and both of you see the same memories, plans and calendar." },
];

export function SpaceCodeSection() {
  return (
    <LandingSection id="connect" className="py-20 md:py-24">
      <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
        <div className="flex flex-col gap-5 lg:col-span-5">
          <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-ld-secondary-container/40 text-ld-primary">
            <KeyRound className="size-6" aria-hidden="true" />
          </span>
          <h2 className="font-display text-ld-headline-xl-mobile text-ld-on-surface md:text-ld-headline-xl">Join your partner with one code.</h2>
          <p className="text-ld-body-md text-ld-on-surface-variant">
            No searching for emails or sending long links. Each account has a short code that stays the same until you choose to change it.
          </p>
        </div>
        <ol className="flex flex-col gap-4 lg:col-span-7">
          {CONNECT_STEPS.map((s, i) => (
            <li key={s.title} className="flex gap-4 rounded-3xl bg-ld-surface-container-lowest p-6 shadow-sm">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-ld-primary font-display text-ld-on-primary">{i + 1}</span>
              <div className="space-y-1">
                <h3 className="font-display text-ld-title-lg text-ld-on-surface">{s.title}</h3>
                <p className="text-ld-body-sm text-ld-on-surface-variant">{s.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </LandingSection>
  );
}

/* ---------------- Astro AI and credits ---------------- */

const COST_ROWS: { label: string; feature: keyof typeof AI_FEATURE_COSTS }[] = [
  { label: "Chat with Astro AI (one session)", feature: "chat" },
  { label: "Numerology reading", feature: "numerology" },
  { label: "Partnership report", feature: "partnership" },
  { label: "Finance guidance", feature: "finance" },
  { label: "Daily horoscope", feature: "daily-horoscope" },
];

export function AstroCreditsSection() {
  return (
    <LandingSection id="astro" className="bg-ld-surface-container-low py-20 md:py-24">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-start">
        <div className="flex flex-col gap-5 lg:col-span-6">
          <span className="inline-flex w-fit items-center gap-2 rounded-full bg-ld-tertiary-fixed/60 px-3 py-1 text-ld-caption font-medium text-ld-on-tertiary-fixed-variant">
            <Stars className="size-3.5" aria-hidden="true" />
            Astro AI is in preview
          </span>
          <h2 className="font-display text-ld-headline-xl-mobile text-ld-on-surface md:text-ld-headline-xl">Ask the stars, with credits you control.</h2>
          <p className="text-ld-body-md text-ld-on-surface-variant">
            Vedic astrology and Western numerology for the questions that matter to you as a couple. Each use costs a few AI credits, so you always know what you are spending.
          </p>
          <ul className="grid gap-3 sm:grid-cols-3">
            <li className="rounded-2xl bg-ld-surface-container-lowest p-4 shadow-sm">
              <Coins className="size-5 text-ld-primary" aria-hidden="true" />
              <p className="mt-2 font-display text-ld-title-lg text-ld-on-surface">{SIGNUP_AI_CREDITS}</p>
              <p className="text-ld-caption text-ld-on-surface-variant">credits when you sign up</p>
            </li>
            <li className="rounded-2xl bg-ld-surface-container-lowest p-4 shadow-sm">
              <p className="font-display text-ld-title-lg text-ld-on-surface">{PLAN_AI_CREDITS_PER_MONTH.pro}</p>
              <p className="text-ld-caption text-ld-on-surface-variant">more each month on Pro</p>
            </li>
            <li className="rounded-2xl bg-ld-surface-container-lowest p-4 shadow-sm">
              <p className="font-display text-ld-title-lg text-ld-on-surface">{PLAN_AI_CREDITS_PER_MONTH.max}</p>
              <p className="text-ld-caption text-ld-on-surface-variant">more each month on Max</p>
            </li>
          </ul>
        </div>

        <div className="rounded-3xl bg-ld-surface-container-lowest p-6 shadow-sm md:p-8 lg:col-span-6">
          <p className="text-ld-label-sm font-semibold uppercase tracking-wider text-ld-primary">What a use costs</p>
          <ul className="mt-4 divide-y divide-ld-outline-variant/40">
            {COST_ROWS.map((row) => (
              <li key={row.feature} className="flex items-center justify-between gap-4 py-3">
                <span className="text-ld-body-sm text-ld-on-surface">{row.label}</span>
                <span className="shrink-0 rounded-full bg-ld-surface-container px-3 py-1 text-ld-label-sm font-semibold text-ld-on-surface">
                  {AI_FEATURE_COSTS[row.feature].credits} credits
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-ld-caption text-ld-on-surface-variant">
            Astro AI is for reflection and fun. It is not a substitute for medical, legal or financial advice.
          </p>
        </div>
      </div>
    </LandingSection>
  );
}

/* ---------------- Support, plus a link to the plans ---------------- */

export function SupportAndPlansStrip() {
  return (
    <LandingSection id="support" className="py-16 md:py-20">
      <div className="flex flex-col items-start justify-between gap-6 rounded-3xl bg-ld-surface-container-lowest p-8 shadow-sm md:flex-row md:items-center md:p-10">
        <div className="max-w-xl space-y-2">
          <h2 className="font-display text-ld-headline-md text-ld-on-surface">Help that listens.</h2>
          <p className="text-ld-body-md text-ld-on-surface-variant">
            Something not working? Raise a ticket and track it in the app. Have an idea for TaleTwo? Send a suggestion. Both go to the same team.
          </p>
        </div>
        <Link
          href="/pricing"
          className={cn("inline-flex h-12 shrink-0 items-center justify-center rounded-full bg-ld-primary px-7 text-ld-label-md text-ld-on-primary shadow-[0_6px_20px_rgba(201,126,139,0.25)] transition-colors hover:bg-ld-on-primary-fixed-variant")}
        >
          See plans
        </Link>
      </div>
    </LandingSection>
  );
}
