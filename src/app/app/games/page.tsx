import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";
import { ArrowRight, Clock, Users } from "lucide-react";
import { GAME_REGION_LABEL, GAMES, type GameRegion } from "@/components/games/game-registry";
import { GamesPager } from "@/components/games/games-pager";
import { cn } from "@/lib/utils";
import { FREE_GAME_SLUGS, PLAN_LIMITS } from "@/config/plan-limits";
import { requireVerifiedUser } from "@/server/authorization/session";
import { planForUser } from "@/server/services/plan-limits";

export const metadata: Metadata = {
  title: "Games",
  robots: { index: false, follow: false },
};

const PAGE_SIZE = 10;
const STYLES: GameRegion[] = ["classic", "indian", "western"];

export default function GamesPage({ searchParams }: { searchParams: Promise<{ style?: string; page?: string }> }) {
  return (
    <Suspense fallback={<div role="status" aria-label="Loading games" className="h-96 animate-pulse rounded-3xl bg-ld-surface-container" />}>
      <GamesContent searchParams={searchParams} />
    </Suspense>
  );
}

async function GamesContent({ searchParams }: { searchParams: Promise<{ style?: string; page?: string }> }) {
  await connection();
  const user = await requireVerifiedUser();
  const plan = await planForUser(user.id);
  const lockedSlugs = new Set(PLAN_LIMITS[plan].games === Infinity ? [] : GAMES.filter((g) => !(FREE_GAME_SLUGS as readonly string[]).includes(g.slug)).map((g) => g.slug));
  const sp = await searchParams;
  const style = (STYLES as string[]).includes(sp.style ?? "") ? (sp.style as GameRegion) : "all";
  const list = style === "all" ? GAMES : GAMES.filter((g) => (g.region ?? "classic") === style);
  const totalPages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
  const page = Math.min(Math.max(1, Math.floor(Number(sp.page)) || 1), totalPages);
  const start = (page - 1) * PAGE_SIZE;
  const items = list.slice(start, start + PAGE_SIZE);

  const chips: { key: string; label: string; count: number }[] = [
    { key: "all", label: "All games", count: GAMES.length },
    ...STYLES.map((s) => ({ key: s, label: GAME_REGION_LABEL[s], count: GAMES.filter((g) => (g.region ?? "classic") === s).length })),
  ];

  return (
    <div className="space-y-8">
      <header className="space-y-4">
        <p className="max-w-xl text-ld-body-md text-ld-on-surface-variant">
          Little games for two, to laugh, learn something new and feel close. Pick a style, then pick a game.
        </p>
        <nav aria-label="Game styles" className="flex flex-wrap gap-2">
          {chips.map((c) => {
            const active = style === c.key;
            const href = c.key === "all" ? "/app/games" : `/app/games?style=${c.key}`;
            return (
              <Link
                key={c.key}
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "rounded-full px-4 py-2 text-ld-label-sm ring-1 transition-colors",
                  active ? "bg-ld-primary text-ld-on-primary ring-ld-primary" : "bg-ld-surface-container-lowest text-ld-on-surface ring-ld-outline-variant/50 hover:bg-ld-surface"
                )}
              >
                {c.label} <span className="opacity-70">({c.count})</span>
              </Link>
            );
          })}
        </nav>
      </header>

      <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3" aria-label="Games">
        {items.map((g) => (
          <li key={g.slug}>
            <Link href={`/app/games/${g.slug}`} className="group flex h-full flex-col overflow-hidden rounded-3xl bg-ld-surface-container-lowest shadow-sm ring-1 ring-ld-on-surface/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_44px_-24px_rgba(64,56,50,0.4)] focus:outline-none focus-visible:ring-2 focus-visible:ring-ld-primary">
              <div className={`flex h-28 items-center justify-between bg-gradient-to-br px-6 ${g.cover}`}>
                <span className="flex size-12 items-center justify-center rounded-2xl bg-ld-surface/80 text-ld-primary shadow-sm">
                  <g.icon className="size-6" aria-hidden="true" />
                </span>
                <ArrowRight className="size-5 text-ld-on-surface transition-transform group-hover:translate-x-1" aria-hidden="true" />
              </div>
              <div className="flex flex-1 flex-col gap-3 p-6">
                <div className="flex items-center gap-2">
                  <h2 className="font-display text-ld-title-lg text-ld-on-surface">{g.title}</h2>
                </div>
                <p className="text-ld-body-sm text-ld-on-surface-variant">{g.blurb}</p>
                <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-1 pt-2 text-ld-caption text-ld-on-surface-variant">
                  <span className="inline-flex items-center gap-1.5"><Users className="size-3.5" aria-hidden="true" />{g.players}</span>
                  <span className="inline-flex items-center gap-1.5"><Clock className="size-3.5" aria-hidden="true" />{g.time}</span>
                  <span className="rounded-full bg-ld-surface-container px-2.5 py-0.5 text-[11px] font-medium">{GAME_REGION_LABEL[g.region ?? "classic"]}</span>
                  {lockedSlugs.has(g.slug) && <span className="rounded-full bg-ld-primary px-2.5 py-0.5 text-[11px] font-semibold text-ld-on-primary">Pro</span>}
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>

      <GamesPager
        style={style}
        page={page}
        totalPages={totalPages}
        total={list.length}
        from={start + 1}
        to={Math.min(start + PAGE_SIZE, list.length)}
      />
    </div>
  );
}
