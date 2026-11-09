import { BookOpen, Calculator, Clapperboard, Dices, Drama, Flame, Grid3x3, Heart, Gamepad2, Image, MessageSquareQuote, Mic, PartyPopper, Puzzle, Eye, Scale, Theater, Timer, TreePalm, Drum, Users } from "lucide-react";
import type { ComponentType } from "react";
import type { LucideIcon } from "lucide-react";
import { CompleteSentence, EmojiQuiz, GuessMyAnswer, NeverHaveIEver, TruthOrDare } from "@/components/games/games-playable";
import { LoveCalculator, WhoKnowsBetter } from "@/components/games/games-more";
import { DateNightRoulette, MadLibsForTwo, TwoTruthsAndALie, WouldYouRather } from "@/components/games/games-new";
import {
  AntakshariChallenge,
  CaptionContest,
  CharadesCards,
  CoupleBingo,
  DesertIslandPicks,
  DesiFamilyVibes,
  DholBeatChallenge,
  FestivalFunQuiz,
  FilmiPlotBuilder,
  RapidFireRound,
} from "@/components/games/games-regional";

/** Which style a game belongs to. Games without a style are the couple classics. */
export type GameRegion = "classic" | "indian" | "western";

export const GAME_REGION_LABEL: Record<GameRegion, string> = {
  classic: "Couple classics",
  indian: "Indian style",
  western: "Western style",
};

export interface GameMeta {
  slug: string;
  title: string;
  blurb: string;
  players: string;
  time: string;
  icon: LucideIcon;
  cover: string;
  component: ComponentType;
  region?: GameRegion;
}

/** Every couple game. The list page shows the cards; each slug opens its own screen. */
export const GAMES: GameMeta[] = [
  { slug: "truth-or-dare", title: "Truth or Dare", blurb: "Honest questions and playful dares, one turn at a time.", players: "2 players", time: "10–20 min", icon: Flame, cover: "from-ld-secondary-container via-[#fbe3e6] to-ld-surface-container", component: TruthOrDare },
  { slug: "guess-my-answer", title: "Guess My Answer", blurb: "Answer in secret, then see if your partner really knows you.", players: "2 players", time: "5–10 min", icon: Eye, cover: "from-[#dfe9f3] via-ld-surface-container to-[#f4efe6]", component: GuessMyAnswer },
  { slug: "emoji-love-quiz", title: "Emoji Love Quiz", blurb: "Decode love stories from a string of emojis.", players: "1–2 players", time: "5 min", icon: Puzzle, cover: "from-ld-tertiary-fixed via-ld-surface-container to-ld-surface", component: EmojiQuiz },
  { slug: "complete-my-sentence", title: "Complete My Sentence", blurb: "Finish the same sentence in secret, then read both endings.", players: "2 players", time: "10 min", icon: MessageSquareQuote, cover: "from-[#ebe3f2] via-ld-surface-container to-ld-surface", component: CompleteSentence },
  { slug: "never-have-i-ever", title: "Never Have I Ever", blurb: "Little confessions, and a finger down for every true one.", players: "2 players", time: "10 min", icon: Gamepad2, cover: "from-[#fbe3c9] via-ld-surface-container to-ld-surface", component: NeverHaveIEver },
  { slug: "who-knows-better", title: "Who Knows Better?", blurb: "Answer for yourself, guess for them, and find out who knows whom.", players: "2 players", time: "15 min", icon: Heart, cover: "from-ld-secondary-container/70 via-ld-tertiary-fixed/40 to-ld-surface-container", component: WhoKnowsBetter },
  { slug: "love-calculator", title: "Love Calculator", blurb: "Spin the wheel for a playful love score, just for fun.", players: "2 players", time: "1 min", icon: Calculator, cover: "from-[#fbe3e6] via-ld-surface-container to-[#f4efe6]", component: LoveCalculator },
  { slug: "would-you-rather", title: "Would You Rather", blurb: "Pick in secret, then see how often your choices match.", players: "2 players", time: "10 min", icon: Scale, cover: "from-[#dfe9f3] via-[#f4efe6] to-ld-surface-container", component: WouldYouRather },
  { slug: "two-truths-and-a-lie", title: "Two Truths and a Lie", blurb: "Three statements, one lie. Can your partner spot it?", players: "2 players", time: "5–10 min", icon: Drama, cover: "from-[#ebe3f2] via-ld-surface-container to-[#fbe3e6]", component: TwoTruthsAndALie },
  { slug: "mad-libs-for-two", title: "Mad Libs for Two", blurb: "Fill in the blanks blind, then read the silly story you wrote together.", players: "2 players", time: "10 min", icon: BookOpen, cover: "from-ld-tertiary-fixed via-[#fbe3c9] to-ld-surface-container", component: MadLibsForTwo },
  { slug: "date-night-roulette", title: "Date Night Roulette", blurb: "Can't decide where to go? Let the roulette pick tonight's date.", players: "2 players", time: "1 min", icon: Dices, cover: "from-[#fbe3c9] via-ld-secondary-container/50 to-ld-surface-container", component: DateNightRoulette },

  // Indian style
  { slug: "antakshari-challenge", title: "Antakshari Challenge", blurb: "Take turns naming songs. Each one starts with the last letter of the one before.", players: "2 players", time: "10–15 min", icon: Mic, cover: "from-ld-secondary-container via-[#fbe3c9] to-ld-surface-container", component: AntakshariChallenge, region: "indian" },
  { slug: "filmi-plot-builder", title: "Filmi Plot Builder", blurb: "Shuffle a dramatic plot with a hero, a twist and a grand finale. Then act it out.", players: "2–4 players", time: "10 min", icon: Clapperboard, cover: "from-[#fbe3c9] via-ld-surface-container to-[#fbe3e6]", component: FilmiPlotBuilder, region: "indian" },
  { slug: "desi-family-vibes", title: "Desi Family Vibes", blurb: "Festivals, weddings and weekend plans. How alike is your family style?", players: "2 players", time: "5–10 min", icon: Users, cover: "from-ld-tertiary-fixed via-[#fbe3c9] to-ld-surface-container", component: DesiFamilyVibes, region: "indian" },
  { slug: "festival-fun-quiz", title: "Festival Fun Quiz", blurb: "Diwali, Onam, Bihu and more. Test what you know, and learn a little more.", players: "1–2 players", time: "5–10 min", icon: PartyPopper, cover: "from-ld-tertiary-fixed/70 via-ld-secondary-container/40 to-ld-surface-container", component: FestivalFunQuiz, region: "indian" },
  { slug: "dhol-beat-challenge", title: "Dhol Beat Challenge", blurb: "Watch the beat, then copy it back. Every round adds one more.", players: "1–2 players", time: "5 min", icon: Drum, cover: "from-[#fbe3e6] via-[#fbe3c9] to-ld-surface-container", component: DholBeatChallenge, region: "indian" },

  // Western style
  { slug: "rapid-fire-round", title: "Rapid Fire Round", blurb: "One minute on the clock. Answer every question out loud before time is up.", players: "2 players", time: "1–5 min", icon: Timer, cover: "from-[#dfe9f3] via-ld-surface-container to-[#f4efe6]", component: RapidFireRound, region: "western" },
  { slug: "couple-bingo", title: "Couple Bingo", blurb: "A card of couple activities. Tick off what you have done, and go for a full line.", players: "2 players", time: "15 min", icon: Grid3x3, cover: "from-ld-tertiary-fixed/60 via-[#dfe9f3] to-ld-surface-container", component: CoupleBingo, region: "western" },
  { slug: "caption-contest", title: "Caption Contest", blurb: "Write a caption for the same moment, then vote on the funnier one.", players: "2 players", time: "10 min", icon: Image, cover: "from-[#ebe3f2] via-[#fbe3e6] to-ld-surface-container", component: CaptionContest, region: "western" },
  { slug: "charades-cards", title: "Charades Cards", blurb: "Act it out without a single word. The other one calls the guess.", players: "2 players", time: "10 min", icon: Theater, cover: "from-[#fbe3c9] via-[#ebe3f2] to-ld-surface-container", component: CharadesCards, region: "western" },
  { slug: "desert-island-picks", title: "Desert Island Picks", blurb: "Five things to take to a desert island. What do you both pick?", players: "2 players", time: "5–10 min", icon: TreePalm, cover: "from-ld-tertiary-fixed via-[#dfe9f3] to-ld-surface-container", component: DesertIslandPicks, region: "western" },
];

export function findGame(slug: string) {
  return GAMES.find((g) => g.slug === slug) ?? null;
}
