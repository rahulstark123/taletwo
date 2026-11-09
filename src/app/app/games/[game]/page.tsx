import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { findGame, GAMES } from "@/components/games/game-registry";

type Params = Promise<{ game: string }>;

export function generateStaticParams() {
  return GAMES.map((g) => ({ game: g.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { game } = await params;
  const meta = findGame(game);
  return { title: meta?.title ?? "Game", robots: { index: false, follow: false } };
}

/** Opens one game. Unknown slugs get a 404. */
export default async function GamePage({ params }: { params: Params }) {
  const { game } = await params;
  const meta = findGame(game);
  if (!meta) notFound();
  const Game = meta.component;
  return <Game />;
}
