import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { findGame, GAMES } from "@/components/games/game-registry";
import { GameShell } from "@/components/games/game-shell";
import { FREE_GAME_SLUGS, PLAN_LIMITS } from "@/config/plan-limits";
import { requireVerifiedUser } from "@/server/authorization/session";
import { planForUser } from "@/server/services/plan-limits";

type Params = Promise<{ game: string }>;

export function generateStaticParams() {
  return GAMES.map((g) => ({ game: g.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { game } = await params;
  const meta = findGame(game);
  return { title: meta?.title ?? "Game", robots: { index: false, follow: false } };
}

/** Opens one game. Unknown slugs get a 404. Free spaces can open only the first two games. */
export default function GamePage({ params }: { params: Params }) {
  return (
    <Suspense fallback={<div role="status" aria-label="Loading game" className="h-96 animate-pulse rounded-3xl bg-ld-surface-container" />}>
      <GameContent params={params} />
    </Suspense>
  );
}

async function GameContent({ params }: { params: Params }) {
  await connection();
  const { game } = await params;
  const meta = findGame(game);
  if (!meta) notFound();
  const user = await requireVerifiedUser();
  const plan = await planForUser(user.id);
  const allowed = PLAN_LIMITS[plan].games === Infinity || (FREE_GAME_SLUGS as readonly string[]).includes(meta.slug);
  if (!allowed) {
    return (
      <GameShell title={meta.title} subtitle="This game is part of Pro and Max.">
        <div className="flex flex-col items-center gap-5 py-6 text-center">
          <p className="max-w-md text-ld-body-md text-ld-on-surface-variant">
            Your Free plan includes Truth or Dare and Guess My Answer. Upgrade to Pro to play all 21 games.
          </p>
          <Link href="/app/subscriptions" className="inline-flex h-12 items-center rounded-full bg-ld-primary px-6 text-ld-label-md text-ld-on-primary">
            See plans
          </Link>
        </div>
      </GameShell>
    );
  }
  const Game = meta.component;
  return <Game />;
}
