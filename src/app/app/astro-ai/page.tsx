import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { AlertTriangle, ArrowRight, Sparkles } from "lucide-react";
import { ASTRO_TOPICS } from "@/components/astro/astro-topics";
import { CreditsChip } from "@/components/astro/credits-chip";
import { AI_FEATURE_COSTS, SIGNUP_AI_CREDITS, type AiFeature } from "@/config/ai-credits";
import { requireVerifiedUser } from "@/server/authorization/session";
import { getBalance } from "@/server/services/ai-credits";

export const metadata: Metadata = {
  title: "Astro AI",
  robots: { index: false, follow: false },
};

/** Astro AI hub. Every feature uses AI credits. Entertainment and reflection, not a substitute for professional advice. */
export default async function AstroAiPage() {
  await connection();
  const user = await requireVerifiedUser();
  const balance = await getBalance(user.id);

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-3xl bg-ld-surface-container-lowest p-7 shadow-sm sm:p-10">
        <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-16 size-64 rounded-full bg-ld-secondary-container/40 blur-3xl" />
        <div className="relative space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-full bg-ld-tertiary-fixed/60 px-3 py-1 text-ld-caption font-medium text-ld-on-tertiary-fixed-variant">
              <Sparkles className="size-3.5" aria-hidden="true" />
              Astro AI is getting ready
            </span>
            <CreditsChip balance={balance} />
          </div>
          <h1 className="font-display text-ld-headline-lg-mobile text-ld-on-surface md:text-ld-headline-lg">Ask the stars, together.</h1>
          <p className="max-w-2xl text-ld-body-md text-ld-on-surface-variant">
            Reflective guidance from Indian (Vedic) astrology and Western numerology, for love, money, career and everyday decisions. Each use costs AI credits. New accounts start with {SIGNUP_AI_CREDITS}.
          </p>
          <p className="flex max-w-2xl items-start gap-2 rounded-2xl bg-ld-surface-container p-4 text-ld-body-sm text-ld-on-surface">
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-ld-primary" aria-hidden="true" />
            <span>
              <strong className="font-semibold">Be cautious.</strong> Astro AI is an AI tool. Its replies can be wrong, incomplete or out of date. Do not rely on them for medical, legal, financial or safety decisions, and check important choices with a qualified professional.
            </span>
          </p>
        </div>
      </section>

      <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3" aria-label="Astro AI topics">
        {ASTRO_TOPICS.map((t) => {
          const cost = AI_FEATURE_COSTS[t.slug as AiFeature]?.credits ?? 0;
          return (
            <li key={t.slug}>
              <Link href={`/app/astro-ai/${t.slug}`} className="group flex h-full flex-col overflow-hidden rounded-3xl bg-ld-surface-container-lowest shadow-sm ring-1 ring-ld-on-surface/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_44px_-24px_rgba(64,56,50,0.4)] focus:outline-none focus-visible:ring-2 focus-visible:ring-ld-primary">
                <div className={`flex h-24 items-center justify-between bg-gradient-to-br px-6 ${t.cover}`}>
                  <span className="flex size-12 items-center justify-center rounded-2xl bg-ld-surface/80 text-ld-primary shadow-sm">
                    <t.icon className="size-6" aria-hidden="true" />
                  </span>
                  <span className={`rounded-full px-3 py-1 text-[11px] font-semibold ${t.status === "preview" ? "bg-ld-on-surface text-ld-surface" : "bg-ld-surface/80 text-ld-on-surface-variant"}`}>
                    {t.status === "preview" ? "Preview" : "Soon"}
                  </span>
                </div>
                <div className="flex flex-1 flex-col gap-3 p-6">
                  <h2 className="font-display text-ld-title-lg text-ld-on-surface">{t.title}</h2>
                  <p className="text-ld-body-sm text-ld-on-surface-variant">{t.blurb}</p>
                  <div className="mt-auto flex items-center justify-between pt-2">
                    <span className="text-ld-label-sm text-ld-on-surface-variant">{cost} credits per use</span>
                    <span className="flex items-center gap-2 text-ld-label-sm text-ld-primary">
                      Open <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                    </span>
                  </div>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
