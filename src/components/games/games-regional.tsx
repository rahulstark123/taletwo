"use client";

import { useEffect, useState } from "react";
import { RefreshCw, Save, Shuffle } from "lucide-react";
import { GameShell, PlayButton } from "@/components/games/game-shell";
import { Handoff } from "@/components/games/games-new";
import {
  ANTAKSHARI_PROMPT,
  BINGO_SQUARES,
  CAPTION_PROMPTS,
  CHARADES_CARDS,
  DESERT_ISLAND_ITEMS,
  DESI_FAMILY_QUESTIONS,
  DHOL_PADS,
  FESTIVAL_QUIZ,
  PLOT_POOLS,
  RAPID_FIRE_PROMPTS,
  type PairQuestion,
  type QuizQuestion,
} from "@/components/games/games-regional-content";
import { cn } from "@/lib/utils";

/** A random item. Only ever called from an event handler, never during render. */
function pick<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

function shuffled<T>(items: readonly T[]): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/* ================= Indian style ================= */

/* ---------- Antakshari Challenge ---------- */

function lastLetter(text: string): string {
  const letters = text.trim().match(/[a-z]/gi);
  return letters ? letters[letters.length - 1].toLowerCase() : "";
}

/** Players take turns naming a song. Each name must start with the last letter of the one before. No lyrics needed. */
export function AntakshariChallenge() {
  const [entries, setEntries] = useState<{ by: 1 | 2; text: string }[]>([]);
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [ended, setEnded] = useState(false);

  const turn: 1 | 2 = entries.length % 2 === 0 ? 1 : 2;
  const need = lastLetter(entries[entries.length - 1]?.text ?? "");

  function add() {
    const t = text.trim();
    if (t.length < 2) return setError("Please type a song name.");
    if (need && t[0].toLowerCase() !== need) return setError(`This one should start with “${need.toUpperCase()}”.`);
    if (entries.some((e) => e.text.toLowerCase() === t.toLowerCase())) return setError("That one has already been sung.");
    setEntries((prev) => [...prev, { by: turn, text: t }]);
    setText("");
    setError(null);
  }

  function restart() {
    setEntries([]);
    setText("");
    setError(null);
    setEnded(false);
  }

  if (ended) {
    const one = entries.filter((e) => e.by === 1).length;
    const two = entries.length - one;
    return (
      <GameShell title="Antakshari Challenge" subtitle="The sing-off is over." score={`${entries.length} songs`}>
        <div className="flex flex-col items-center gap-5 py-6 text-center">
          <p className="font-display text-ld-headline-md text-ld-on-surface">
            {one === two ? "A perfect tie. Both of you know your classics." : one > two ? "Player 1 had the bigger playlist." : "Player 2 had the bigger playlist."}
          </p>
          <p className="text-ld-body-sm text-ld-on-surface-variant">Player 1: {one} · Player 2: {two}</p>
          <PlayButton onClick={restart}>
            <RefreshCw className="size-4" aria-hidden="true" />
            Start again
          </PlayButton>
        </div>
      </GameShell>
    );
  }

  return (
    <GameShell title="Antakshari Challenge" subtitle={ANTAKSHARI_PROMPT} score={`Player ${turn}'s turn`}>
      <div className="space-y-5">
        <ol className="max-h-72 space-y-2 overflow-y-auto" aria-label="Songs so far">
          {entries.length === 0 && <li className="text-ld-body-sm text-ld-on-surface-variant">Player 1 starts. Any song, any language.</li>}
          {entries.map((e, i) => (
            <li key={i} className="flex items-center gap-3 rounded-2xl bg-ld-surface-container p-3 text-ld-body-sm text-ld-on-surface">
              <span className="rounded-full bg-ld-surface-container-lowest px-2.5 py-0.5 text-ld-caption">P{e.by}</span>
              {e.text}
            </li>
          ))}
        </ol>
        {need && <p className="text-ld-label-sm text-ld-primary">Next song starts with &ldquo;{need.toUpperCase()}&rdquo;</p>}
        <form
          className="flex flex-col gap-3 sm:flex-row"
          onSubmit={(e) => {
            e.preventDefault();
            add();
          }}
        >
          <label htmlFor="antakshari-song" className="sr-only">Song name</label>
          <input
            id="antakshari-song"
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={80}
            placeholder="Type a song name"
            className="h-11 flex-1 rounded-xl border border-ld-outline-variant bg-ld-surface px-4 text-ld-body-md text-ld-on-surface focus:border-ld-primary focus:outline-none"
          />
          <PlayButton disabled={text.trim().length < 2}>Sing it</PlayButton>
        </form>
        {error && <p role="alert" className="text-ld-caption text-ld-error">{error}</p>}
        <div className="flex justify-center">
          <PlayButton variant="quiet" onClick={() => setEnded(true)} disabled={entries.length === 0}>
            End the sing-off
          </PlayButton>
        </div>
      </div>
    </GameShell>
  );
}

/* ---------- Filmi Plot Builder ---------- */

type Plot = Record<keyof typeof PLOT_POOLS, string>;

function makePlot(): Plot {
  return {
    hero: pick(PLOT_POOLS.hero),
    love: pick(PLOT_POOLS.love),
    setting: pick(PLOT_POOLS.setting),
    obstacle: pick(PLOT_POOLS.obstacle),
    twist: pick(PLOT_POOLS.twist),
    finale: pick(PLOT_POOLS.finale),
  };
}

function plotText(p: Plot): string {
  return `${cap(p.hero)} falls for ${p.love} at ${p.setting}. Then comes ${p.obstacle}. Just when all seems lost, ${p.twist}. The story ends with ${p.finale}.`;
}

function cap(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** Shuffles one plot from six pools. Save the ones you like, then play them out together. */
export function FilmiPlotBuilder() {
  const [plot, setPlot] = useState<Plot | null>(null);
  const [saved, setSaved] = useState<Plot[]>([]);

  return (
    <GameShell title="Filmi Plot Builder" subtitle="Shuffle a dramatic plot, then decide who plays which part." score={`${saved.length} saved`}>
      <div className="space-y-6">
        <div className="min-h-[160px] rounded-3xl bg-ld-surface-container p-6 text-center" aria-live="polite">
          {plot ? (
            <p className="font-display text-ld-title-lg leading-relaxed text-ld-on-surface">{plotText(plot)}</p>
          ) : (
            <p className="text-ld-body-sm text-ld-on-surface-variant">Press shuffle to create tonight&apos;s story.</p>
          )}
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          <PlayButton onClick={() => setPlot(makePlot())}>
            <Shuffle className="size-4" aria-hidden="true" />
            {plot ? "Shuffle again" : "Shuffle a plot"}
          </PlayButton>
          {plot && (
            <PlayButton variant="quiet" onClick={() => setSaved((s) => [plot, ...s])}>
              <Save className="size-4" aria-hidden="true" />
              Save this plot
            </PlayButton>
          )}
        </div>
        {saved.length > 0 && (
          <ul className="space-y-3">
            {saved.map((p, i) => (
              <li key={i} className="rounded-2xl bg-ld-surface-container-low p-4 text-ld-body-sm text-ld-on-surface">{plotText(p)}</li>
            ))}
          </ul>
        )}
      </div>
    </GameShell>
  );
}

/* ---------- Desi Family Vibes (matching picks) ---------- */

/** Each of you picks in secret. Matching picks score a point. Pass-and-play. */
export function DesiFamilyVibes() {
  return (
    <PairMatchGame
      title="Desi Family Vibes"
      subtitle="Pick in secret, then see how alike your family-style choices are."
      questions={DESI_FAMILY_QUESTIONS}
      verdict={(m, total) =>
        m >= total * 0.7 ? "Same family vibe, same house rules. Lovely." : m >= total * 0.4 ? "A good mix of both your worlds." : "Two different styles. Let us talk it through over chai."
      }
    />
  );
}

/** Generic pass-and-play matching game for two options per question. */
export function PairMatchGame({
  title,
  subtitle,
  questions,
  verdict,
}: {
  title: string;
  subtitle: string;
  questions: PairQuestion[];
  verdict: (matches: number, total: number) => string;
}) {
  const [i, setI] = useState(0);
  const [step, setStep] = useState<"you" | "handoff" | "partner" | "reveal">("you");
  const [you, setYou] = useState<"a" | "b" | null>(null);
  const [partner, setPartner] = useState<"a" | "b" | null>(null);
  const [matches, setMatches] = useState(0);

  function restart() {
    setI(0);
    setMatches(0);
    setYou(null);
    setPartner(null);
    setStep("you");
  }

  if (i >= questions.length) {
    return (
      <GameShell title={title} subtitle={subtitle} score={`${matches} of ${questions.length} matched`}>
        <div className="flex flex-col items-center gap-5 py-6 text-center">
          <p className="font-display text-ld-headline-md text-ld-on-surface">{verdict(matches, questions.length)}</p>
          <PlayButton onClick={restart}>
            <RefreshCw className="size-4" aria-hidden="true" />
            Play again
          </PlayButton>
        </div>
      </GameShell>
    );
  }

  const q = questions[i];
  const options = [
    { side: "a" as const, text: q.a },
    { side: "b" as const, text: q.b },
  ];

  if (step === "handoff") return <Handoff text="Partner, your turn. Look away while they choose." onNext={() => setStep("partner")} />;

  if (step === "reveal") {
    return (
      <GameShell title={title} subtitle={`Question ${i + 1} of ${questions.length}`} score={`${matches} matched`}>
        <div className="space-y-6">
          <p className="text-center font-display text-ld-title-lg text-ld-on-surface">{you === partner ? "You matched!" : "Different picks. Good to know."}</p>
          <div className="grid gap-4 sm:grid-cols-2">
            {options.map((o) => (
              <div key={o.side} className={cn("rounded-2xl p-5 ring-1", o.side === you || o.side === partner ? "bg-ld-secondary-container/40 ring-ld-primary/40" : "bg-ld-surface-container ring-ld-outline-variant/40")}>
                <p className="text-ld-body-sm text-ld-on-surface">{o.text}</p>
                <p className="mt-3 flex flex-wrap gap-2 text-ld-caption text-ld-on-surface-variant">
                  {you === o.side && <span className="rounded-full bg-ld-surface px-2.5 py-0.5">You</span>}
                  {partner === o.side && <span className="rounded-full bg-ld-surface px-2.5 py-0.5">Partner</span>}
                </p>
              </div>
            ))}
          </div>
          <div className="flex justify-center">
            <PlayButton
              onClick={() => {
                if (you && partner && you === partner) setMatches((m) => m + 1);
                setI((n) => n + 1);
                setYou(null);
                setPartner(null);
                setStep("you");
              }}
            >
              {i + 1 === questions.length ? "See the result" : "Next question"}
            </PlayButton>
          </div>
        </div>
      </GameShell>
    );
  }

  const picking = step === "you" ? you : partner;
  const setPicking = step === "you" ? setYou : setPartner;

  return (
    <GameShell title={title} subtitle={step === "you" ? "You choose first, in secret." : "Partner, choose now."} score={`Question ${i + 1} of ${questions.length}`}>
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          {options.map((o) => (
            <button
              key={o.side}
              type="button"
              aria-pressed={picking === o.side}
              onClick={() => setPicking(o.side)}
              className={cn(
                "rounded-2xl p-5 text-left text-ld-body-sm ring-1 transition-all",
                picking === o.side ? "bg-ld-primary text-ld-on-primary ring-ld-primary shadow-md" : "bg-ld-surface-container text-ld-on-surface ring-ld-outline-variant/40 hover:bg-ld-surface-container-high"
              )}
            >
              {o.text}
            </button>
          ))}
        </div>
        <div className="flex justify-center">
          <PlayButton disabled={picking === null} onClick={() => (step === "you" ? setStep("handoff") : setStep("reveal"))}>
            Lock it in
          </PlayButton>
        </div>
      </div>
    </GameShell>
  );
}

/* ---------- Festival Fun Quiz (and the generic quiz) ---------- */

/** Multiple choice. Each answer shows a short note, so the game teaches as it goes. */
export function QuizGame({ title, subtitle, questions }: { title: string; subtitle: string; questions: QuizQuestion[] }) {
  const [i, setI] = useState(0);
  const [chosen, setChosen] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const finished = i >= questions.length;

  function restart() {
    setI(0);
    setChosen(null);
    setScore(0);
  }

  if (finished) {
    return (
      <GameShell title={title} subtitle="Quiz complete." score={`${score} of ${questions.length} right`}>
        <div className="flex flex-col items-center gap-5 py-6 text-center">
          <p className="font-display text-ld-headline-md text-ld-on-surface">
            {score === questions.length ? "A perfect score. Ask me anything else." : score >= questions.length / 2 ? "Well done. You know your festivals." : "A good start. Next time, you will get more."}
          </p>
          <PlayButton onClick={restart}>
            <RefreshCw className="size-4" aria-hidden="true" />
            Play again
          </PlayButton>
        </div>
      </GameShell>
    );
  }

  const q = questions[i];
  const answered = chosen !== null;

  return (
    <GameShell title={title} subtitle={subtitle} score={`Question ${i + 1} of ${questions.length}`}>
      <div className="space-y-6">
        <p className="font-display text-ld-title-lg text-ld-on-surface">{q.q}</p>
        <div className="grid gap-3 sm:grid-cols-2">
          {q.options.map((opt, idx) => {
            const correct = idx === q.answer;
            return (
              <button
                key={opt}
                type="button"
                disabled={answered}
                onClick={() => {
                  setChosen(idx);
                  if (idx === q.answer) setScore((s) => s + 1);
                }}
                className={cn(
                  "rounded-2xl p-4 text-left text-ld-body-sm ring-1 transition-colors disabled:cursor-default",
                  answered && correct && "bg-ld-tertiary-fixed/60 text-ld-on-tertiary-fixed-variant ring-ld-tertiary",
                  answered && idx === chosen && !correct && "bg-ld-error-container text-ld-on-error-container ring-ld-error",
                  !answered && "bg-ld-surface-container text-ld-on-surface ring-ld-outline-variant/40 hover:bg-ld-surface-container-high",
                  answered && !correct && idx !== chosen && "bg-ld-surface-container text-ld-on-surface-variant ring-ld-outline-variant/30"
                )}
              >
                {opt}
              </button>
            );
          })}
        </div>
        {answered && (
          <div className="space-y-4 rounded-2xl bg-ld-surface-container-low p-5">
            <p className="text-ld-body-sm text-ld-on-surface">{chosen === q.answer ? "Correct! " : "Not quite. "}{q.note}</p>
            <div className="flex justify-center">
              <PlayButton onClick={() => { setI((n) => n + 1); setChosen(null); }}>
                {i + 1 === questions.length ? "See the score" : "Next question"}
              </PlayButton>
            </div>
          </div>
        )}
      </div>
    </GameShell>
  );
}

export function FestivalFunQuiz() {
  return <QuizGame title="Festival Fun Quiz" subtitle="Test what you know about India's festivals." questions={FESTIVAL_QUIZ} />;
}

/* ---------- Dhol Beat Challenge ---------- */

type DholPhase = "idle" | "play" | "tap" | "round-won" | "over";

/** Watch the pads light up in order, then tap the same pattern back. Each round adds one more beat. */
export function DholBeatChallenge() {
  const [phase, setPhase] = useState<DholPhase>("idle");
  const [seq, setSeq] = useState<number[]>([]);
  const [playIdx, setPlayIdx] = useState(0);
  const [lit, setLit] = useState<number | null>(null);
  const [tapIdx, setTapIdx] = useState(0);
  const [rounds, setRounds] = useState(0);

  // Plays the pattern one beat at a time.
  useEffect(() => {
    if (phase !== "play") return;
    const t = setTimeout(() => {
      if (playIdx >= seq.length) {
        setLit(null);
        setTapIdx(0);
        setPhase("tap");
        return;
      }
      setLit(seq[playIdx]);
      setPlayIdx(playIdx + 1);
    }, 500);
    return () => clearTimeout(t);
  }, [phase, playIdx, seq]);

  function startRound(length: number) {
    setSeq(Array.from({ length }, () => Math.floor(Math.random() * DHOL_PADS.length)));
    setPlayIdx(0);
    setLit(null);
    setPhase("play");
  }

  function tap(pad: number) {
    if (phase !== "tap") return;
    setLit(pad);
    if (pad !== seq[tapIdx]) {
      setPhase("over");
      return;
    }
    if (tapIdx + 1 === seq.length) {
      setRounds((r) => r + 1);
      setPhase("round-won");
      return;
    }
    setTapIdx(tapIdx + 1);
  }

  const score = `${rounds} round${rounds === 1 ? "" : "s"} won`;

  return (
    <GameShell title="Dhol Beat Challenge" subtitle="Watch the beat, then copy it. Every round adds one more." score={score}>
      <div className="space-y-6">
        <div className="grid grid-cols-3 gap-4">
          {DHOL_PADS.map((name, idx) => (
            <button
              key={name}
              type="button"
              onClick={() => tap(idx)}
              disabled={phase !== "tap"}
              aria-label={`Drum pad ${name}`}
              className={cn(
                "aspect-square rounded-3xl text-ld-title-lg font-semibold ring-1 transition-all duration-150 disabled:cursor-default",
                lit === idx ? "scale-95 bg-ld-primary text-ld-on-primary ring-ld-primary shadow-md" : "bg-ld-surface-container text-ld-on-surface ring-ld-outline-variant/40"
              )}
            >
              {name}
            </button>
          ))}
        </div>
        <p className="text-center text-ld-body-sm text-ld-on-surface-variant" aria-live="polite">
          {phase === "idle" && "Press start to hear the first beat."}
          {phase === "play" && "Watch closely…"}
          {phase === "tap" && `Your turn. ${seq.length} beats.`}
          {phase === "round-won" && "Beautiful. Next round is longer."}
          {phase === "over" && `Off-beat! You made it ${rounds} round${rounds === 1 ? "" : "s"}.`}
        </p>
        <div className="flex justify-center">
          {phase === "idle" && <PlayButton onClick={() => startRound(3)}>Start</PlayButton>}
          {phase === "round-won" && <PlayButton onClick={() => startRound(seq.length + 1)}>Next round</PlayButton>}
          {phase === "over" && (
            <PlayButton onClick={() => { setRounds(0); startRound(3); }}>
              <RefreshCw className="size-4" aria-hidden="true" />
              Try again
            </PlayButton>
          )}
        </div>
      </div>
    </GameShell>
  );
}

/* ================= Western style ================= */

/* ---------- Rapid Fire Round ---------- */

const RAPID_SECONDS = 60;

/** One minute on the clock. Answer out loud as fast as you can, then tap next. */
export function RapidFireRound() {
  const [gameId, setGameId] = useState(0);
  const [left, setLeft] = useState(RAPID_SECONDS);
  const [prompt, setPrompt] = useState<number>(0);
  const [answered, setAnswered] = useState(0);

  // Counts the minute down while a game is running.
  useEffect(() => {
    if (gameId === 0) return;
    const id = setInterval(() => setLeft((l) => Math.max(0, l - 1)), 1000);
    return () => clearInterval(id);
  }, [gameId]);

  const running = gameId > 0 && left > 0;

  function start() {
    setGameId((g) => g + 1);
    setLeft(RAPID_SECONDS);
    setAnswered(0);
    setPrompt(Math.floor(Math.random() * RAPID_FIRE_PROMPTS.length));
  }

  function next() {
    setAnswered((a) => a + 1);
    setPrompt((p) => (p + 1 + Math.floor(Math.random() * (RAPID_FIRE_PROMPTS.length - 1))) % RAPID_FIRE_PROMPTS.length);
  }

  return (
    <GameShell title="Rapid Fire Round" subtitle="One minute. Answer every question out loud before the clock runs out." score={gameId === 0 ? "Ready" : `${answered} answered`}>
      <div className="space-y-6 text-center">
        <p className="font-display text-ld-headline-lg-mobile text-ld-primary tabular-nums" aria-live="polite">{left}s</p>
        {running ? (
          <div className="min-h-[120px] rounded-3xl bg-ld-surface-container p-6">
            <p className="font-display text-ld-title-lg text-ld-on-surface">{RAPID_FIRE_PROMPTS[prompt]}</p>
          </div>
        ) : (
          <p className="text-ld-body-sm text-ld-on-surface-variant">
            {gameId === 0 ? "Press start when you are both ready." : `Time! You answered ${answered} question${answered === 1 ? "" : "s"}.`}
          </p>
        )}
        <div className="flex flex-wrap justify-center gap-3">
          {!running && <PlayButton onClick={start}>{gameId === 0 ? "Start" : "Play again"}</PlayButton>}
          {running && <PlayButton onClick={next}>Next question</PlayButton>}
        </div>
      </div>
    </GameShell>
  );
}

/* ---------- Couple Bingo ---------- */

const CENTER = 12;

function bingoLines(): number[][] {
  const lines: number[][] = [];
  for (let r = 0; r < 5; r += 1) lines.push([0, 1, 2, 3, 4].map((c) => r * 5 + c));
  for (let c = 0; c < 5; c += 1) lines.push([0, 1, 2, 3, 4].map((r) => r * 5 + c));
  lines.push([0, 6, 12, 18, 24], [4, 8, 12, 16, 20]);
  return lines;
}

/** A five by five card of couple activities. Tick the ones you have done. A full line is a bingo. */
export function CoupleBingo() {
  const [card, setCard] = useState<string[] | null>(null);
  const [marked, setMarked] = useState<Set<number>>(new Set([CENTER]));

  function newCard() {
    const squares = shuffled(BINGO_SQUARES).slice(0, 24);
    squares.splice(CENTER, 0, "Free square");
    setCard(squares);
    setMarked(new Set([CENTER]));
  }

  const bingo = bingoLines().some((line) => line.every((i) => marked.has(i)));

  return (
    <GameShell title="Couple Bingo" subtitle="Tick off the things you have done together. Get a full line to win." score={bingo ? "BINGO!" : card ? `${marked.size - 1} ticked` : "New card"}>
      {!card ? (
        <div className="flex justify-center py-6">
          <PlayButton onClick={newCard}>
            <Shuffle className="size-4" aria-hidden="true" />
            Get a card
          </PlayButton>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-5 gap-2">
            {card.map((square, i) => {
              const on = marked.has(i);
              return (
                <button
                  key={i}
                  type="button"
                  aria-pressed={on}
                  disabled={i === CENTER}
                  onClick={() =>
                    setMarked((prev) => {
                      const next = new Set(prev);
                      if (next.has(i)) next.delete(i);
                      else next.add(i);
                      return next;
                    })
                  }
                  className={cn(
                    "flex aspect-square items-center justify-center rounded-xl p-1 text-center text-[11px] leading-tight ring-1 transition-colors sm:text-ld-caption",
                    on ? "bg-ld-primary text-ld-on-primary ring-ld-primary" : "bg-ld-surface-container text-ld-on-surface ring-ld-outline-variant/40 hover:bg-ld-surface-container-high"
                  )}
                >
                  {square}
                </button>
              );
            })}
          </div>
          <div className="flex justify-center">
            <PlayButton variant="quiet" onClick={newCard}>
              <RefreshCw className="size-4" aria-hidden="true" />
              New card
            </PlayButton>
          </div>
        </div>
      )}
    </GameShell>
  );
}

/* ---------- Caption Contest ---------- */

/** Each of you writes a caption for the same picture-in-words, in secret. Then you vote on the funnier one. */
export function CaptionContest() {
  const [round, setRound] = useState(0);
  const [phase, setPhase] = useState<"you" | "handoff" | "partner" | "vote" | "done">("you");
  const [youText, setYouText] = useState("");
  const [partnerText, setPartnerText] = useState("");
  const [score, setScore] = useState({ you: 0, partner: 0 });

  function nextRound() {
    setRound((r) => r + 1);
    setYouText("");
    setPartnerText("");
    setPhase("you");
  }

  function restart() {
    setScore({ you: 0, partner: 0 });
    setRound(0);
    nextRound();
  }

  if (phase === "done") {
    return (
      <GameShell title="Caption Contest" subtitle="Final score" score={`${score.you} – ${score.partner}`}>
        <div className="flex flex-col items-center gap-5 py-6 text-center">
          <p className="font-display text-ld-headline-md text-ld-on-surface">
            {score.you === score.partner ? "A tie. Two comedians, one winner: the couple." : score.you > score.partner ? "You are the funnier one tonight." : "Your partner takes the crown."}
          </p>
          <PlayButton onClick={restart}>
            <RefreshCw className="size-4" aria-hidden="true" />
            Play again
          </PlayButton>
        </div>
      </GameShell>
    );
  }

  const prompt = CAPTION_PROMPTS[round];

  if (phase === "handoff") return <Handoff text="Partner, write your caption. No peeking!" onNext={() => setPhase("partner")} />;

  if (phase === "vote") {
    return (
      <GameShell title="Caption Contest" subtitle={prompt} score={`Round ${round + 1} of ${CAPTION_PROMPTS.length}`}>
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl bg-ld-surface-container p-5"><p className="text-ld-label-sm text-ld-on-surface-variant">You</p><p className="mt-2 text-ld-body-md text-ld-on-surface">{youText}</p></div>
            <div className="rounded-2xl bg-ld-surface-container p-5"><p className="text-ld-label-sm text-ld-on-surface-variant">Partner</p><p className="mt-2 text-ld-body-md text-ld-on-surface">{partnerText}</p></div>
          </div>
          <p className="text-center text-ld-body-sm text-ld-on-surface-variant">Which one made you laugh more?</p>
          <div className="flex flex-wrap justify-center gap-3">
            <PlayButton onClick={() => { setScore((s) => ({ ...s, you: s.you + 1 })); advance(); }}>Yours</PlayButton>
            <PlayButton variant="quiet" onClick={() => { setScore((s) => ({ you: s.you, partner: s.partner + 1 })); advance(); }}>Partner&apos;s</PlayButton>
            <PlayButton variant="quiet" onClick={advance}>Tie</PlayButton>
          </div>
        </div>
      </GameShell>
    );
  }

  function advance() {
    if (round + 1 >= CAPTION_PROMPTS.length) setPhase("done");
    else nextRound();
  }

  const isYou = phase === "you";
  const text = isYou ? youText : partnerText;
  const setText = isYou ? setYouText : setPartnerText;

  return (
    <GameShell title="Caption Contest" subtitle={prompt} score={`Round ${round + 1} of ${CAPTION_PROMPTS.length}`}>
      <div className="space-y-5">
        <p className="text-ld-caption text-ld-on-surface-variant">{isYou ? "You write first." : "Partner writes now."} Keep it short and a little silly.</p>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={140}
          rows={3}
          placeholder="Your caption"
          className="w-full resize-none rounded-2xl border border-ld-outline-variant bg-ld-surface px-4 py-3 text-ld-body-md text-ld-on-surface placeholder:text-ld-on-surface-variant/70 focus:border-ld-primary focus:outline-none"
        />
        <div className="flex justify-center">
          <PlayButton disabled={text.trim().length < 3} onClick={() => setPhase(isYou ? "handoff" : "vote")}>
            {isYou ? "Lock my caption" : "Lock and compare"}
          </PlayButton>
        </div>
      </div>
    </GameShell>
  );
}

/* ---------- Charades Cards ---------- */

/** Act out the card without words. The guesser calls it. Pass-and-play, no timer. */
export function CharadesCards() {
  const [deck, setDeck] = useState<string[]>([]);
  const [idx, setIdx] = useState(0);
  const [showing, setShowing] = useState(false);
  const [got, setGot] = useState(0);

  function start() {
    setDeck(shuffled(CHARADES_CARDS).slice(0, 10));
    setIdx(0);
    setGot(0);
    setShowing(false);
  }

  const started = deck.length > 0;
  const done = started && idx >= deck.length;

  if (!started || done) {
    return (
      <GameShell title="Charades Cards" subtitle="Act it out without a single word." score={started ? `${got} of ${deck.length} guessed` : "Ready"}>
        <div className="flex flex-col items-center gap-5 py-6 text-center">
          <p className="font-display text-ld-headline-md text-ld-on-surface">
            {done ? (got >= deck.length / 2 ? "Brilliant acting, both of you." : "Dramatic, if not very clear. Go again!") : "Ten cards, one actor at a time."}
          </p>
          <PlayButton onClick={start}>
            <RefreshCw className="size-4" aria-hidden="true" />
            {done ? "Play again" : "Start"}
          </PlayButton>
        </div>
      </GameShell>
    );
  }

  return (
    <GameShell title="Charades Cards" subtitle="Only the actor looks at the card." score={`Card ${idx + 1} of ${deck.length}`}>
      <div className="space-y-6 text-center">
        {!showing ? (
          <>
            <p className="text-ld-body-sm text-ld-on-surface-variant">Hand the device to the actor. Only they should tap next.</p>
            <PlayButton onClick={() => setShowing(true)}>Show the card</PlayButton>
          </>
        ) : (
          <>
            <div className="min-h-[140px] rounded-3xl bg-ld-surface-container p-6">
              <p className="font-display text-ld-headline-md text-ld-on-surface">{deck[idx]}</p>
            </div>
            <div className="flex flex-wrap justify-center gap-3">
              <PlayButton onClick={() => { setGot((g) => g + 1); setIdx((n) => n + 1); setShowing(false); }}>Guessed it!</PlayButton>
              <PlayButton variant="quiet" onClick={() => { setIdx((n) => n + 1); setShowing(false); }}>Skip</PlayButton>
            </div>
          </>
        )}
      </div>
    </GameShell>
  );
}

/* ---------- Desert Island Picks ---------- */

const PICK_COUNT = 5;

/** Each of you picks five things for a desert island, in secret. The overlap says a lot about you. */
export function DesertIslandPicks() {
  const [step, setStep] = useState<"you" | "handoff" | "partner" | "reveal">("you");
  const [yours, setYours] = useState<string[]>([]);
  const [theirs, setTheirs] = useState<string[]>([]);
  const [rounds, setRounds] = useState(0);

  const current = step === "partner" ? theirs : yours;
  const setCurrent = step === "partner" ? setTheirs : setYours;

  function toggle(item: string) {
    setCurrent((prev) => {
      if (prev.includes(item)) return prev.filter((x) => x !== item);
      if (prev.length >= PICK_COUNT) return prev;
      return [...prev, item];
    });
  }

  function reset() {
    setYours([]);
    setTheirs([]);
    setStep("you");
  }

  if (step === "handoff") return <Handoff text="Partner, pick your five. No peeking at their list." onNext={() => setStep("partner")} />;

  if (step === "reveal") {
    const shared = yours.filter((x) => theirs.includes(x));
    return (
      <GameShell title="Desert Island Picks" subtitle="Here is what you both would take." score={`${shared.length} in common`}>
        <div className="space-y-6 text-center">
          <p className="font-display text-ld-headline-md text-ld-on-surface">
            {shared.length === 0 ? "Not one thing in common. Survival will be interesting." : shared.length >= 3 ? "You would survive together beautifully." : "A few things in common, and a lot to talk about."}
          </p>
          {shared.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2">
              {shared.map((x) => (
                <span key={x} className="rounded-full bg-ld-secondary-container/50 px-3 py-1 text-ld-label-sm text-ld-on-surface">{x}</span>
              ))}
            </div>
          )}
          <div className="grid gap-4 text-left sm:grid-cols-2">
            <div className="rounded-2xl bg-ld-surface-container p-4"><p className="text-ld-label-sm text-ld-on-surface-variant">You</p><p className="mt-2 text-ld-body-sm text-ld-on-surface">{yours.join(", ")}</p></div>
            <div className="rounded-2xl bg-ld-surface-container p-4"><p className="text-ld-label-sm text-ld-on-surface-variant">Partner</p><p className="mt-2 text-ld-body-sm text-ld-on-surface">{theirs.join(", ")}</p></div>
          </div>
          <PlayButton onClick={() => { setRounds((r) => r + 1); reset(); }}>
            <RefreshCw className="size-4" aria-hidden="true" />
            Another island
          </PlayButton>
        </div>
      </GameShell>
    );
  }

  return (
    <GameShell title="Desert Island Picks" subtitle={`Choose ${PICK_COUNT} things. ${step === "you" ? "You first, in secret." : "Partner, your turn."}`} score={`${current.length} of ${PICK_COUNT} picked${rounds ? ` · island ${rounds + 1}` : ""}`}>
      <div className="space-y-6">
        <div className="flex flex-wrap gap-2">
          {DESERT_ISLAND_ITEMS.map((item) => {
            const on = current.includes(item);
            return (
              <button
                key={item}
                type="button"
                aria-pressed={on}
                onClick={() => toggle(item)}
                className={cn(
                  "rounded-full px-3.5 py-2 text-ld-label-sm ring-1 transition-colors",
                  on ? "bg-ld-primary text-ld-on-primary ring-ld-primary" : "bg-ld-surface-container text-ld-on-surface ring-ld-outline-variant/40 hover:bg-ld-surface-container-high"
                )}
              >
                {item}
              </button>
            );
          })}
        </div>
        <div className="flex justify-center">
          <PlayButton disabled={current.length !== PICK_COUNT} onClick={() => (step === "you" ? setStep("handoff") : setStep("reveal"))}>
            Lock my five
          </PlayButton>
        </div>
      </div>
    </GameShell>
  );
}
