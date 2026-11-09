import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { AlertTriangle, ArrowLeft, Clock } from "lucide-react";
import { ASTRO_TOPICS, findTopic } from "@/components/astro/astro-topics";
import { AstroChat } from "@/components/astro/astro-chat";
import { CreditsChip } from "@/components/astro/credits-chip";
import { NumerologyPanel } from "@/components/astro/numerology-panel";
import { AI_FEATURE_COSTS, type AiFeature } from "@/config/ai-credits";
import { requireVerifiedUser } from "@/server/authorization/session";
import { getBalance } from "@/server/services/ai-credits";

export const metadata: Metadata = {
  title: "Astro AI",
  robots: { index: false, follow: false },
};

export function generateStaticParams() {
  return ASTRO_TOPICS.map((t) => ({ topic: t.slug }));
}

export default async function AstroTopicPage({ params }: { params: Promise<{ topic: string }> }) {
  const { topic: slug } = await params;
  const topic = findTopic(slug);
  if (!topic) notFound();

  await connection();
  const user = await requireVerifiedUser();
  const balance = await getBalance(user.id);
  const cost = AI_FEATURE_COSTS[topic.slug as AiFeature];

  return (
    <div className="space-y-6">
      <Link href="/app/astro-ai" className="inline-flex items-center gap-2 text-ld-label-sm text-ld-on-surface-variant transition-colors hover:text-ld-primary">
        <ArrowLeft className="size-4" aria-hidden="true" />
        All Astro AI topics
      </Link>

      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <h1 className="font-display text-ld-headline-lg-mobile text-ld-on-surface md:text-ld-headline-lg">{topic.title}</h1>
          <p className="max-w-2xl text-ld-body-md text-ld-on-surface-variant">{topic.blurb}</p>
        </div>
        <p className="inline-flex items-center gap-2 self-start rounded-full bg-ld-surface-container px-3 py-1.5 text-ld-caption text-ld-on-surface-variant sm:self-auto">
          Uses: {topic.basis}
        </p>
      </header>

      {cost && (
        <section aria-label="AI credits" className="flex flex-col gap-3 rounded-2xl bg-ld-surface-container-lowest p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-0.5">
            <p className="text-ld-label-md font-semibold text-ld-on-surface">Costs {cost.credits} AI credits per use</p>
            <p className="text-ld-caption text-ld-on-surface-variant">{cost.covers}.</p>
          </div>
          <CreditsChip balance={balance} />
        </section>
      )}

      {topic.slug === "chat" && <AstroChat samples={topic.samples} />}
      {topic.slug === "numerology" && <NumerologyPanel />}

      {topic.slug !== "chat" && topic.slug !== "numerology" && (
        <section className="space-y-5 rounded-3xl bg-ld-surface-container-lowest p-6 shadow-sm sm:p-8">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-2xl bg-ld-surface-container text-ld-primary">
              <Clock className="size-5" aria-hidden="true" />
            </span>
            <div>
              <h2 className="font-display text-ld-title-lg text-ld-on-surface">Coming with Astro AI</h2>
              <p className="text-ld-body-sm text-ld-on-surface-variant">This topic will open once Astro AI is connected. No readings are shown until then, and no credits are used.</p>
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-ld-label-sm text-ld-on-surface-variant">Questions you can ask</p>
            <ul className="space-y-2">
              {topic.samples.map((s) => (
                <li key={s} className="rounded-2xl bg-ld-surface px-4 py-3 text-ld-body-sm text-ld-on-surface-variant ring-1 ring-ld-outline-variant/40">
                  {s}
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <p className="flex items-start gap-2 text-ld-caption text-ld-on-surface-variant">
        <AlertTriangle className="mt-px size-3.5 shrink-0" aria-hidden="true" />
        <span>
          Astro AI is an AI preview. Replies can be wrong or incomplete. Use them for reflection only, and check important decisions with a qualified professional.
        </span>
      </p>
    </div>
  );
}
