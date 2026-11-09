import { BookHeart, Feather, UserPlus, type LucideIcon } from "lucide-react";

const STEPS: { icon: LucideIcon; title: string; body: string }[] = [
  {
    icon: Feather,
    title: "Create your private space",
    body: "Set up your profile, choose a theme and start your couple space. It takes a few minutes.",
  },
  {
    icon: UserPlus,
    title: "Invite your partner",
    body: "Share a personal invitation link or code. Your space is complete when they accept, and only the two of you can see it.",
  },
  {
    icon: BookHeart,
    title: "Start building your story together",
    body: "Add the first memory, write the first note, or plan the first date. Your little world grows one moment at a time.",
  },
];

/** Three-step explanation used on the How It Works page. */
export function HowItWorksSteps() {
  return (
    <ol className="grid gap-6 md:grid-cols-3">
      {STEPS.map((step, i) => (
        <li key={step.title} className="surface-card relative space-y-4 p-7">
          <div className="flex items-center justify-between">
            <span className="flex size-11 items-center justify-center rounded-full bg-brand-accent/25 text-brand-primary">
              <step.icon className="size-5" aria-hidden="true" />
            </span>
            <span className="font-display text-3xl text-brand-accent">0{i + 1}</span>
          </div>
          <h3 className="text-card-title text-foreground">{step.title}</h3>
          <p className="text-sm leading-relaxed text-muted-foreground">{step.body}</p>
        </li>
      ))}
    </ol>
  );
}
