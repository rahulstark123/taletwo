import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { AlertTriangle, ArrowLeft } from "lucide-react";
import { ASTRO_TOPICS, findTopic } from "@/components/astro/astro-topics";
import { AstroChat } from "@/components/astro/astro-chat";
import { AstroTopicRunner } from "@/components/astro/astro-topic-runner";
import { CreditsChip } from "@/components/astro/credits-chip";
import { NumerologyPanel } from "@/components/astro/numerology-panel";
import { AI_FEATURE_COSTS, type AiFeature } from "@/config/ai-credits";
import type { AstroTopicSlug } from "@/lib/validations/astro";
import { requireVerifiedUser } from "@/server/authorization/session";
import { planForUser } from "@/server/services/plan-limits";
import { PLAN_LIMITS } from "@/config/plan-limits";
import Link from "next/link";
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
  const plan = await planForUser(user.id);
  const lockedTopic = !PLAN_LIMITS[plan].partnerTopics && (topic.slug === "partnership" || topic.slug === "finance");
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

      {lockedTopic && (
        <section className="space-y-4 rounded-3xl bg-ld-surface-container-lowest p-6 text-center shadow-sm sm:p-8">
          <h2 className="font-display text-ld-title-lg text-ld-on-surface">{topic.title} is a Pro feature</h2>
          <p className="text-ld-body-sm text-ld-on-surface-variant">Upgrade to Pro or Max to open partnership and finance topics in Astro AI.</p>
          <Link href="/app/subscriptions" className="inline-flex h-11 items-center rounded-full bg-ld-primary px-6 text-ld-label-md text-ld-on-primary">See plans</Link>
        </section>
      )}

      {topic.slug !== "chat" && !lockedTopic && (
        <AstroTopicRunner
          topic={topic.slug as AstroTopicSlug}
          title={topic.title}
          cost={cost?.credits ?? 0}
          samples={topic.samples}
        />
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
