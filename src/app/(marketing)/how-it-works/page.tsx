import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HowItWorksSteps } from "@/components/marketing/how-it-works-steps";
import { PageHeader } from "@/components/shared/page-header";

export const metadata: Metadata = {
  title: "How TaleTwo works: a private app for couples in 3 steps",
  description: "Create your private space, invite your partner and start building your story together in three simple steps.",
  alternates: { canonical: "/how-it-works" },
  openGraph: { title: "How TaleTwo works", url: "/how-it-works" },
};

const DETAILS = [
  {
    title: "1. Create your private space",
    points: [
      "Sign up with your email and verify it.",
      "Tell us your display name, an optional photo, your relationship start date and your preferred theme.",
      "Your couple space is created for you, with a secure invitation ready to share.",
    ],
  },
  {
    title: "2. Invite your partner",
    points: [
      "Share your invitation link or a short code by message, email or any app you already use.",
      "Invitations expire and can be used only once, so a link never lingers.",
      "When your partner joins, you will both see each other's name and photo.",
    ],
  },
  {
    title: "3. Start building your story together",
    points: [
      "Save your first memory, write a note, or schedule a letter for later.",
      "Add the dates that matter and start your shared bucket list.",
      "Answer the daily question whenever you like, and reveal answers together.",
    ],
  },
];

export default function HowItWorksPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-20 px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
      <PageHeader
        eyebrow="How it works"
        title="From first sign-up to a shared story."
        description="Three simple steps. The whole setup takes a few minutes, and everything after that is yours to build at your own pace."
      />

      <HowItWorksSteps />

      <div className="grid gap-6 md:grid-cols-3">
        {DETAILS.map((step) => (
          <div key={step.title} className="surface-card space-y-4 p-7">
            <h2 className="text-card-title text-foreground">{step.title}</h2>
            <ul className="space-y-3">
              {step.points.map((point) => (
                <li key={point} className="flex gap-3 text-sm leading-relaxed text-muted-foreground">
                  <Check className="mt-0.5 size-4 shrink-0 text-success" aria-hidden="true" />
                  {point}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="flex flex-col items-center gap-4 text-center">
        <p className="text-muted-foreground">Ready when you are.</p>
        <Button size="lg" render={<Link href="/signup" />}>
          Create Your Space <ArrowRight className="size-4" aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}
