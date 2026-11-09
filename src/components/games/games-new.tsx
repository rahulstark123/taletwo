"use client";

import Link from "next/link";
import { useState } from "react";
import { CalendarDays, Check, Dices, RefreshCw, Shuffle, X } from "lucide-react";
import { GameShell, PlayButton } from "@/components/games/game-shell";
import {
  BUDGET_LABEL,
  DATE_IDEAS,
  MAD_LIBS,
  MAD_LIB_LABELS,
  WOULD_RATHER,
  type DateIdea,
} from "@/components/games/games-new-content";
import { cn } from "@/lib/utils";

/** Pause between two people sharing one screen, so the first can look away. */
export function Handoff({ text, onNext }: { text: string; onNext: () => void }) {
  return (
    <div className="flex flex-col items-center gap-6 py-10 text-center">
      <p className="font-display text-ld-headline-md text-ld-on-surface">{text}</p>
      <PlayButton onClick={onNext}>Ready</PlayButton>
    </div>
  );
}

/* ---------- Would You Rather ---------- */

type Side = "a" | "b";

/** Each of you picks in secret. Matching picks score a point. Ten questions, one round. */
export function WouldYouRather() {
  const qs = WOULD_RATHER;
  const [i, setI] = useState(0);
  const [step, setStep] = useState<"you" | "handoff" | "partner" | "reveal">("you");
  const [you, setYou] = useState<Side | null>(null);
  const [partner, setPartner] = useState<Side | null>(null);
  const [matches, setMatches] = useState(0);

  function resetQuestion() {
    setYou(null);
    setPartner(null);
    setStep("you");
  }

  if (i >= qs.length) {
    return (
      <GameShell title="Would You Rather" subtitle="Pick in secret, then see how alike you think." score={`${matches} of ${qs.length} matched`}>
        <div className="flex flex-col items-center gap-5 py-6 text-center">
          <p className="font-display text-ld-headline-md text-ld-on-surface">
            {matches >= qs.length * 0.7
              ? "Practically the same brain. Lovely."
              : matches >= qs.length * 0.4
                ? "You balance each other out nicely."
                : "Opposites attract. Plenty to talk about."}
          </p>
          <PlayButton onClick={() => { setI(0); setMatches(0); resetQuestion(); }}>
            <RefreshCw className="size-4" aria-hidden="true" />
            Play again
          </PlayButton>
        </div>
      </GameShell>
    );
  }

  const q = qs[i];
  const options: { side: Side; text: string }[] = [
    { side: "a", text: q.a },
    { side: "b", text: q.b },
  ];

  function nextQuestion() {
    if (you && partner && you === partner) setMatches((m) => m + 1);
    setI((n) => n + 1);
    resetQuestion();
  }

  if (step === "handoff") return <Handoff text="Partner, your turn. Look away while they choose." onNext={() => setStep("partner")} />;

  if (step === "reveal") {
    const same = you === partner;
    return (
      <GameShell title="Would You Rather" subtitle={`Question ${i + 1} of ${qs.length}`} score={`${matches} matched`}>
        <div className="space-y-6">
          <p className="text-center font-display text-ld-title-lg text-ld-on-surface">{same ? "You matched!" : "Different picks. Time to talk."}</p>
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
            <PlayButton onClick={nextQuestion}>{i + 1 === qs.length ? "See the result" : "Next question"}</PlayButton>
          </div>
        </div>
      </GameShell>
    );
  }

  const picking = step === "you" ? you : partner;
  const setPicking = step === "you" ? setYou : setPartner;

  return (
    <GameShell title="Would You Rather" subtitle={step === "you" ? "You choose first, in secret." : "Partner, choose now."} score={`Question ${i + 1} of ${qs.length}`}>
      <div className="space-y-6">
        <p className="text-center font-display text-ld-title-lg text-ld-on-surface">Would you rather&hellip;</p>
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

/* ---------- Two Truths and a Lie ---------- */

/** One of you writes three statements, two true and one false. The other finds the lie. */
export function TwoTruthsAndALie() {
  const [phase, setPhase] = useState<"write" | "handoff" | "guess" | "reveal">("write");
  const [statements, setStatements] = useState(["", "", ""]);
  const [lie, setLie] = useState<number | null>(null);
  const [guess, setGuess] = useState<number | null>(null);
  const [score, setScore] = useState({ right: 0, rounds: 0 });

  const ready = statements.every((s) => s.trim().length >= 3) && lie !== null;

  function reset() {
    setStatements(["", "", ""]);
    setLie(null);
    setGuess(null);
    setPhase("write");
  }

  if (phase === "handoff") return <Handoff text="Pass it over. No peeking at the lie!" onNext={() => setPhase("guess")} />;

  if (phase === "guess") {
    return (
      <GameShell title="Two Truths and a Lie" subtitle="Which one is the lie?" score={`${score.right} of ${score.rounds} found`}>
        <div className="space-y-4">
          {statements.map((s, idx) => (
            <button
              key={idx}
              type="button"
              aria-pressed={guess === idx}
              onClick={() => setGuess(idx)}
              className={cn(
                "w-full rounded-2xl p-5 text-left text-ld-body-md ring-1 transition-all",
                guess === idx ? "bg-ld-primary text-ld-on-primary ring-ld-primary shadow-md" : "bg-ld-surface-container text-ld-on-surface ring-ld-outline-variant/40 hover:bg-ld-surface-container-high"
              )}
            >
              {s}
            </button>
          ))}
          <div className="flex justify-center pt-2">
            <PlayButton
              disabled={guess === null}
              onClick={() => {
                setScore((sc) => ({ right: sc.right + (guess === lie ? 1 : 0), rounds: sc.rounds + 1 }));
                setPhase("reveal");
              }}
            >
              Reveal the lie
            </PlayButton>
          </div>
        </div>
      </GameShell>
    );
  }

  if (phase === "reveal") {
    const right = guess === lie;
    return (
      <GameShell title="Two Truths and a Lie" subtitle="The verdict" score={`${score.right} of ${score.rounds} found`}>
        <div className="flex flex-col items-center gap-5 py-4 text-center">
          <span className={cn("flex size-14 items-center justify-center rounded-full", right ? "bg-ld-tertiary-fixed text-ld-on-tertiary-fixed-variant" : "bg-ld-error-container text-ld-on-error-container")}>
            {right ? <Check className="size-7" aria-hidden="true" /> : <X className="size-7" aria-hidden="true" />}
          </span>
          <p className="font-display text-ld-headline-md text-ld-on-surface">{right ? "Spot on. You know them well." : "Caught out! That one was the lie."}</p>
          <p className="text-ld-body-sm text-ld-on-surface-variant">The lie was: &ldquo;{statements[lie ?? 0]}&rdquo;</p>
          <PlayButton onClick={reset}>
            <RefreshCw className="size-4" aria-hidden="true" />
            Another round
          </PlayButton>
        </div>
      </GameShell>
    );
  }

  return (
    <GameShell title="Two Truths and a Lie" subtitle="Write three things about yourself. Two are true, one is a lie. Tick the lie, then pass the device." score="Your turn to write">
      <div className="space-y-4">
        {statements.map((s, idx) => (
          <div key={idx} className="flex items-start gap-3">
            <button
              type="button"
              aria-pressed={lie === idx}
              aria-label={`Mark statement ${idx + 1} as the lie`}
              onClick={() => setLie(idx)}
              className={cn(
                "mt-3 inline-flex size-9 shrink-0 items-center justify-center rounded-full text-ld-label-sm ring-1 transition-colors",
                lie === idx ? "bg-ld-error text-ld-on-error ring-ld-error" : "bg-ld-surface-container text-ld-on-surface-variant ring-ld-outline-variant/40"
              )}
            >
              {lie === idx ? "Lie" : idx + 1}
            </button>
            <textarea
              value={s}
              maxLength={160}
              rows={2}
              placeholder={`Statement ${idx + 1}`}
              onChange={(e) => setStatements((prev) => prev.map((x, j) => (j === idx ? e.target.value : x)))}
              className="w-full resize-none rounded-2xl border border-ld-outline-variant bg-ld-surface px-4 py-3 text-ld-body-sm text-ld-on-surface placeholder:text-ld-on-surface-variant/70 focus:border-ld-primary focus:outline-none"
            />
          </div>
        ))}
        <p className="text-ld-caption text-ld-on-surface-variant">Tap a number to mark the lie. Only you will know which one it is.</p>
        <div className="flex justify-center pt-2">
          <PlayButton disabled={!ready} onClick={() => setPhase("handoff")}>
            Pass to partner
          </PlayButton>
        </div>
      </div>
    </GameShell>
  );
}

/* ---------- Mad Libs for Two ---------- */

interface Token {
  kind: string;
  index: number;
}

function parseTemplate(template: string): { parts: (string | Token)[]; tokens: Token[] } {
  const parts: (string | Token)[] = [];
  const tokens: Token[] = [];
  for (const piece of template.split(/(\{\w+\})/)) {
    const match = /^\{(\w+)\}$/.exec(piece);
    if (match) {
      const token = { kind: match[1], index: tokens.length };
      tokens.push(token);
      parts.push(token);
    } else if (piece) {
      parts.push(piece);
    }
  }
  return { parts, tokens };
}

/** Each of you fills in every other blank without seeing the story. Then the whole story is read aloud. */
export function MadLibsForTwo() {
  const [libIndex, setLibIndex] = useState(0);
  const lib = MAD_LIBS[libIndex];
  const { parts, tokens } = parseTemplate(lib.template);
  const [answers, setAnswers] = useState<string[]>(() => tokens.map(() => ""));
  const [revealed, setRevealed] = useState(false);

  function startOver(nextLib: number) {
    const next = parseTemplate(MAD_LIBS[nextLib].template).tokens;
    setLibIndex(nextLib);
    setAnswers(next.map(() => ""));
    setRevealed(false);
  }

  const complete = answers.every((a) => a.trim().length > 0);

  if (revealed) {
    return (
      <GameShell title="Mad Libs for Two" subtitle={lib.title} score="The story">
        <div className="space-y-6">
          <p className="font-display text-ld-title-lg leading-relaxed text-ld-on-surface">
            {parts.map((p, i) =>
              typeof p === "string" ? (
                <span key={i}>{p}</span>
              ) : (
                <mark key={i} className="rounded bg-ld-secondary-container/60 px-1 text-ld-on-surface not-italic">
                  {answers[p.index]}
                </mark>
              )
            )}
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <PlayButton onClick={() => setRevealed(false)} variant="quiet">Edit words</PlayButton>
            <PlayButton onClick={() => startOver((libIndex + 1) % MAD_LIBS.length)}>Next story</PlayButton>
          </div>
        </div>
      </GameShell>
    );
  }

  return (
    <GameShell title="Mad Libs for Two" subtitle={`${lib.title}. Fill in the blanks without reading the story. Take turns with the words.`} score={`${answers.filter((a) => a.trim()).length} of ${tokens.length} filled`}>
      <div className="space-y-4">
        {tokens.map((t) => {
          const label = MAD_LIB_LABELS[t.kind] ?? "A word";
          return (
            <label key={t.index} className="block space-y-1.5">
              <span className="text-ld-label-sm text-ld-on-surface-variant">
                {t.index + 1}. {label}
              </span>
              <input
                value={answers[t.index]}
                maxLength={40}
                onChange={(e) => setAnswers((prev) => prev.map((x, j) => (j === t.index ? e.target.value : x)))}
                className="h-11 w-full rounded-xl border border-ld-outline-variant bg-ld-surface px-4 text-ld-body-md text-ld-on-surface focus:border-ld-primary focus:outline-none"
              />
            </label>
          );
        })}
        <div className="flex justify-center pt-3">
          <PlayButton disabled={!complete} onClick={() => setRevealed(true)}>
            Reveal the story
          </PlayButton>
        </div>
      </div>
    </GameShell>
  );
}

/* ---------- Date Night Roulette ---------- */

/** Pick a date idea at random, filtered by budget. Save it to the calendar if you like it. */
export function DateNightRoulette() {
  const [budget, setBudget] = useState<DateIdea["budget"] | "any">("any");
  const [pick, setPick] = useState<DateIdea | null>(null);
  const pool = DATE_IDEAS.filter((d) => budget === "any" || d.budget === budget);

  function shuffle() {
    if (pool.length === 0) return;
    const choices = pick ? pool.filter((d) => d.idea !== pick.idea) : pool;
    const source = choices.length > 0 ? choices : pool;
    setPick(source[Math.floor(Math.random() * source.length)]);
  }

  return (
    <GameShell title="Date Night Roulette" subtitle="Can't decide? Let the roulette choose tonight's date." score={`${pool.length} ideas`}>
      <div className="space-y-6">
        <div role="radiogroup" aria-label="Budget" className="flex flex-wrap justify-center gap-2">
          {(["any", "free", "cozy", "treat"] as const).map((b) => (
            <button
              key={b}
              type="button"
              role="radio"
              aria-checked={budget === b}
              onClick={() => {
                setBudget(b);
                setPick(null);
              }}
              className={cn(
                "rounded-full px-4 py-2 text-ld-label-sm ring-1 transition-colors",
                budget === b ? "bg-ld-primary text-ld-on-primary ring-ld-primary" : "bg-ld-surface-container text-ld-on-surface ring-ld-outline-variant/40"
              )}
            >
              {b === "any" ? "Any budget" : BUDGET_LABEL[b]}
            </button>
          ))}
        </div>

        <div className="flex min-h-[180px] flex-col items-center justify-center gap-4 rounded-3xl bg-ld-surface-container p-6 text-center" aria-live="polite">
          {pick ? (
            <>
              <span className="rounded-full bg-ld-surface-container-lowest px-3 py-1 text-ld-caption text-ld-on-surface-variant">{BUDGET_LABEL[pick.budget]}</span>
              <p className="font-display text-ld-headline-md text-ld-on-surface">{pick.idea}</p>
            </>
          ) : (
            <p className="text-ld-body-sm text-ld-on-surface-variant">Press shuffle to get tonight&apos;s idea.</p>
          )}
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          <PlayButton onClick={shuffle} disabled={pool.length === 0}>
            {pick ? <RefreshCw className="size-4" aria-hidden="true" /> : <Shuffle className="size-4" aria-hidden="true" />}
            {pick ? "Shuffle again" : "Shuffle"}
          </PlayButton>
          {pick && (
            <Link href="/app/calendar" className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-ld-surface-container px-5 text-ld-label-md text-ld-on-surface transition-colors hover:bg-ld-surface-container-high">
              <CalendarDays className="size-4" aria-hidden="true" />
              Add to calendar
            </Link>
          )}
        </div>
        <p className="flex items-center justify-center gap-2 text-ld-caption text-ld-on-surface-variant">
          <Dices className="size-3.5" aria-hidden="true" />
          Ideas are only suggestions. Check opening times and bookings before you go.
        </p>
      </div>
    </GameShell>
  );
}
