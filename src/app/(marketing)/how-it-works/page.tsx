import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookHeart, Check, Feather, Lock, UserPlus, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";

export const metadata: Metadata = {
  title: "How TaleTwo works: a private app for couples in 3 steps",
  description:
    "Create your private space, invite your partner with a six-character code and start your shared story in three simple steps. Free to start.",
  alternates: { canonical: "/how-it-works" },
  openGraph: { title: "How TaleTwo works", url: "/how-it-works" },
};

interface Step {
  icon: LucideIcon;
  title: string;
  summary: string;
  points: string[];
}

const STEPS: Step[] = [
  {
    icon: Feather,
    title: "Create your private space",
    summary: "Sign up, verify your email and set up your profile. It takes a few minutes.",
    points: [
      "Sign up with your email and verify it.",
      "Add your display name, an optional photo, your relationship start date and your preferred theme.",
      "Choose your country. It sets the currency your space uses for money shown in the app.",
      "Your couple space is created for you, with a six-character code ready to share.",
    ],
  },
  {
    icon: UserPlus,
    title: "Invite your partner",
    summary: "Share your space code. When your partner joins, you are both in one private space.",
    points: [
      "Share your six-character space code by message, email or any app you already use.",
      "The code belongs to your couple space. Only someone with the code can join, and a space holds two people.",
      "When your partner joins, you will both see each other's name and photo.",
    ],
  },
  {
    icon: BookHeart,
    title: "Start building your story together",
    summary: "Add a first memory, write a note or plan a date. Your little world grows one moment at a time.",
    points: [
      "Save a memory with photos, a place and a date.",
      "Write a shared note, add a date that matters or start your bucket list.",
      "Answer the daily question whenever you like. Your answers stay hidden until you reveal them together.",
      "Send a love letter now. Scheduling letters for a future day is included in Pro and Max.",
    ],
  },
];

const FIRST_WEEK = [
  { title: "Add a memory", body: "Start with one photo from your favourite day together." },
  { title: "Answer today's question", body: "Answer on your own, then reveal together when you are both ready." },
  { title: "Add the dates that matter", body: "Anniversaries and birthdays appear with a countdown." },
  { title: "Start your bucket list", body: "Write down three trips or dreams you want to share." },
];

const QUESTIONS = [
  {
    q: "Do we both need an account?",
    a: "Yes. Each of you signs up with your own email. Your space is shared once you are both in it.",
  },
  {
    q: "Can we live in different countries?",
    a: "Yes. Each space uses one currency. Indian couples pay in rupees, and everyone else pays in US dollars.",
  },
  {
    q: "Will we be charged automatically?",
    a: "No. Pro and Max are one-time payments for a month or a year. They do not renew automatically.",
  },
];

export default function HowItWorksPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-20 px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
      <PageHeader
        eyebrow="How it works"
        title="From first sign-up to a shared story."
        description="Three simple steps. The whole setup takes a few minutes, and everything after that is yours to build at your own pace."
      />

      <section aria-label="Setup steps" className="grid gap-8 md:grid-cols-[minmax(0,1fr)]">
        <ol className="relative space-y-10 md:before:absolute md:before:left-[2.1rem] md:before:top-6 md:before:bottom-6 md:before:w-px md:before:bg-border">
          {STEPS.map((step, i) => (
            <li key={step.title} className="relative grid gap-5 md:grid-cols-[auto_minmax(0,1fr)] md:gap-8">
              <div className="flex items-center gap-4 md:flex-col md:items-center md:gap-2">
                <span className="relative z-10 flex size-[4.2rem] items-center justify-center rounded-full border border-border bg-surface text-brand-primary shadow-soft">
                  <step.icon className="size-6" aria-hidden="true" />
                </span>
                <span className="font-display text-3xl text-brand-accent md:hidden">0{i + 1}</span>
              </div>
              <div className="surface-card space-y-4 p-7 sm:p-8">
                <div className="flex items-baseline justify-between gap-4">
                  <h2 className="text-card-title text-foreground">
                    <span className="mr-2 hidden font-display text-brand-accent md:inline">0{i + 1}</span>
                    {step.title}
                  </h2>
                </div>
                <p className="text-base leading-relaxed text-foreground">{step.summary}</p>
                <ul className="space-y-3 border-t border-border pt-5">
                  {step.points.map((point) => (
                    <li key={point} className="flex gap-3 text-sm leading-relaxed text-muted-foreground">
                      <Check className="mt-0.5 size-4 shrink-0 text-success" aria-hidden="true" />
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="first-week" className="space-y-8">
        <div className="space-y-2 text-center">
          <h2 id="first-week" className="text-section-title text-foreground">Your first week, simply</h2>
          <p className="text-muted-foreground">Small steps that make the space feel like yours from day one.</p>
        </div>
        <ul className="grid gap-5 sm:grid-cols-2">
          {FIRST_WEEK.map((item) => (
            <li key={item.title} className="surface-card p-6">
              <p className="text-card-title text-foreground">{item.title}</p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="private" className="flex flex-col items-start gap-4 rounded-card border border-border bg-surface p-8 shadow-soft sm:flex-row sm:items-center sm:justify-between sm:p-10">
        <div className="flex items-start gap-4">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-brand-accent/25 text-brand-primary">
            <Lock className="size-5" aria-hidden="true" />
          </span>
          <div className="space-y-1">
            <h2 id="private" className="text-card-title text-foreground">Only the two of you can see it</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Your photos, notes and letters are shared only inside your couple space. Read how we protect them in our{" "}
              <Link href="/privacy" className="text-brand-primary underline underline-offset-4">Privacy Policy</Link>.
            </p>
          </div>
        </div>
      </section>

      <section aria-labelledby="questions" className="mx-auto max-w-3xl space-y-6">
        <h2 id="questions" className="text-section-title text-center text-foreground">Quick answers</h2>
        <dl className="space-y-4">
          {QUESTIONS.map((item) => (
            <div key={item.q} className="surface-card p-6">
              <dt className="text-card-title text-foreground">{item.q}</dt>
              <dd className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.a}</dd>
            </div>
          ))}
        </dl>
      </section>

      <div className="flex flex-col items-center gap-4 text-center">
        <p className="text-muted-foreground">Ready when you are.</p>
        <Button size="lg" render={<Link href="/signup" />}>
          Create Your Space <ArrowRight className="size-4" aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}
