"use client";

import { useState } from "react";
import { Check, Eye, EyeOff, RefreshCw } from "lucide-react";
import { GameShell, PlayButton } from "@/components/games/game-shell";
import { DARE_CHALLENGES, EMOJI_QUIZ, NEVER_HAVE_I_EVER, SENTENCE_STARTERS, TRUTH_QUESTIONS, GUESS_QUESTIONS } from "@/components/games/games-content";
import { cn } from "@/lib/utils";

const pick = <T,>(list: T[], avoid?: T) => {
  const pool = avoid === undefined ? list : list.filter((x) => x !== avoid);
  return pool[Math.floor(Math.random() * pool.length)];
};

/* ---------- Truth or Dare ---------- */
export function TruthOrDare() {
  const [turn, setTurn] = useState<"You" | "Partner">("You");
  const [card, setCard] = useState<{ type: "Truth" | "Dare"; text: string } | null>(null);
  const [done, setDone] = useState(0);

  function draw(type: "Truth" | "Dare") {
    setCard({ type, text: type === "Truth" ? pick(TRUTH_QUESTIONS) : pick(DARE_CHALLENGES) });
  }

  return (
    <GameShell title="Truth or Dare" subtitle="Take turns. Answer honestly or do the dare, with a smile." score={`${done} played`}>
      <div className="flex flex-col items-center gap-6 text-center">
        <p className="text-ld-label-sm font-semibold uppercase tracking-widest text-ld-primary">{turn}&apos;s turn</p>
        {!card ? (
          <>
            <p className="font-display text-ld-headline-md text-ld-on-surface">Truth, or a dare?</p>
            <div className="flex flex-wrap justify-center gap-3">
              <PlayButton onClick={() => draw("Truth")}>Truth</PlayButton>
              <PlayButton onClick={() => draw("Dare")} variant="quiet">Dare</PlayButton>
            </div>
          </>
        ) : (
          <div className="w-full max-w-md animate-in fade-in zoom-in-95 rounded-3xl bg-gradient-to-br from-ld-secondary-container via-[#fbe3e6] to-ld-surface-container p-8 shadow-md duration-500">
            <p className="text-ld-label-sm font-semibold uppercase tracking-widest text-ld-primary">{card.type}</p>
            <p className="mt-3 font-display text-ld-headline-md leading-snug text-ld-on-surface">{card.text}</p>
          </div>
        )}
        {card && (
          <div className="flex flex-wrap justify-center gap-3">
            <PlayButton
              onClick={() => {
                setDone((d) => d + 1);
                setCard(null);
                setTurn((t) => (t === "You" ? "Partner" : "You"));
              }}
            >
              <Check className="size-4" aria-hidden="true" />
              Done, next turn
            </PlayButton>
            <PlayButton variant="quiet" onClick={() => draw(card.type)}>
              <RefreshCw className="size-4" aria-hidden="true" />
              Another {card.type.toLowerCase()}
            </PlayButton>
          </div>
        )}
      </div>
    </GameShell>
  );
}

/* ---------- Guess My Answer ---------- */
export function GuessMyAnswer() {
  const [round, setRound] = useState(0);
  const [phase, setPhase] = useState<"pick" | "handoff" | "guess" | "result">("pick");
  const [mine, setMine] = useState<number | null>(null);
  const [guess, setGuess] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const q = GUESS_QUESTIONS[round % GUESS_QUESTIONS.length];

  function nextRound() {
    setRound((r) => r + 1);
    setMine(null);
    setGuess(null);
    setPhase("pick");
  }

  return (
    <GameShell title="Guess My Answer" subtitle="You answer in secret. Your partner guesses what you picked." score={`${score} correct`}>
      {phase === "pick" && (
        <Question
          label="You, answer in secret"
          prompt={q.prompt}
          options={q.options}
          selected={mine}
          onSelect={setMine}
          action={<PlayButton disabled={mine === null} onClick={() => setPhase("handoff")}>Lock my answer</PlayButton>}
        />
      )}
      {phase === "handoff" && <HandOff to="Partner" hint="Look away, your partner is about to guess." onReady={() => setPhase("guess")} />}
      {phase === "guess" && (
        <Question
          label="Partner, guess their answer"
          prompt={q.prompt}
          options={q.options}
          selected={guess}
          onSelect={setGuess}
          action={
            <PlayButton
              disabled={guess === null}
              onClick={() => {
                if (guess === mine) setScore((s) => s + 1);
                setPhase("result");
              }}
            >
              Reveal
            </PlayButton>
          }
        />
      )}
      {phase === "result" && (
        <Reveal
          title={guess === mine ? "Spot on!" : "Close, but not quite."}
          lines={[`Their answer: ${mine !== null ? q.options[mine] : "-"}`, `The guess: ${guess !== null ? q.options[guess] : "-"}`]}
          action={<PlayButton onClick={nextRound}>Next question</PlayButton>}
        />
      )}
    </GameShell>
  );
}

/* ---------- Emoji Love Quiz ---------- */
export function EmojiQuiz() {
  const [i, setI] = useState(0);
  const [chosen, setChosen] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const finished = i >= EMOJI_QUIZ.length;
  const q = EMOJI_QUIZ[i];

  if (finished) {
    return (
      <GameShell title="Emoji Love Quiz" subtitle="Guess the love story from the emojis." score={`${score} / ${EMOJI_QUIZ.length}`}>
        <Reveal
          title={score >= 6 ? "You two read each other perfectly." : "Lovely effort. Play again and beat it."}
          lines={[`You got ${score} out of ${EMOJI_QUIZ.length}.`]}
          action={
            <PlayButton
              onClick={() => {
                setI(0);
                setScore(0);
                setChosen(null);
              }}
            >
              Play again
            </PlayButton>
          }
        />
      </GameShell>
    );
  }

  return (
    <GameShell title="Emoji Love Quiz" subtitle="Guess the love story from the emojis." score={`Question ${i + 1} of ${EMOJI_QUIZ.length}`}>
      <div className="flex flex-col items-center gap-6">
        <p className="text-center text-[56px] leading-tight" aria-label="Emoji clue">{q.emojis}</p>
        <div className="grid w-full gap-3 sm:grid-cols-2">
          {q.options.map((o) => {
            const isRight = o === q.answer;
            const state = chosen === null ? "idle" : isRight ? "right" : o === chosen ? "wrong" : "dim";
            return (
              <button
                key={o}
                type="button"
                disabled={chosen !== null}
                onClick={() => {
                  setChosen(o);
                  if (o === q.answer) setScore((s) => s + 1);
                }}
                className={cn(
                  "rounded-2xl border px-4 py-4 text-left text-ld-body-sm transition-all",
                  state === "idle" && "border-ld-outline-variant hover:bg-ld-surface-container-low",
                  state === "right" && "border-ld-tertiary bg-ld-tertiary-fixed/60 text-ld-on-tertiary-fixed-variant",
                  state === "wrong" && "border-ld-error bg-ld-error-container text-ld-on-error-container",
                  state === "dim" && "opacity-50"
                )}
              >
                {o}
              </button>
            );
          })}
        </div>
        {chosen !== null && (
          <PlayButton
            onClick={() => {
              setI((n) => n + 1);
              setChosen(null);
            }}
          >
            {i + 1 === EMOJI_QUIZ.length ? "See my score" : "Next"}
          </PlayButton>
        )}
      </div>
    </GameShell>
  );
}

/* ---------- Complete My Sentence ---------- */
export function CompleteSentence() {
  const [starter, setStarter] = useState(() => pick(SENTENCE_STARTERS));
  const [mine, setMine] = useState("");
  const [theirs, setTheirs] = useState("");
  const [phase, setPhase] = useState<"you" | "handoff" | "partner" | "reveal">("you");
  const [count, setCount] = useState(0);

  function reset() {
    setStarter(pick(SENTENCE_STARTERS, starter));
    setMine("");
    setTheirs("");
    setPhase("you");
    setCount((c) => c + 1);
  }

  return (
    <GameShell title="Complete My Sentence" subtitle="Finish the sentence in secret. Read both endings together." score={`${count} sentences`}>
      {phase === "you" && (
        <div className="space-y-4">
          <p className="font-display text-ld-headline-md leading-snug text-ld-on-surface">{starter}</p>
          <textarea value={mine} onChange={(e) => setMine(e.target.value)} rows={3} maxLength={300} placeholder="Your ending…" className="w-full resize-none rounded-2xl border border-ld-outline-variant bg-ld-surface px-4 py-3 font-display text-ld-body-lg text-ld-on-surface placeholder:text-ld-outline focus:border-ld-primary focus:outline-none focus:ring-2 focus:ring-ld-primary/25" />
          <PlayButton disabled={!mine.trim()} onClick={() => setPhase("handoff")}>Lock my ending</PlayButton>
        </div>
      )}
      {phase === "handoff" && <HandOff to="Partner" hint="Your partner writes their own ending now." onReady={() => setPhase("partner")} />}
      {phase === "partner" && (
        <div className="space-y-4">
          <p className="font-display text-ld-headline-md leading-snug text-ld-on-surface">{starter}</p>
          <textarea value={theirs} onChange={(e) => setTheirs(e.target.value)} rows={3} maxLength={300} placeholder="Partner's ending…" className="w-full resize-none rounded-2xl border border-ld-outline-variant bg-ld-surface px-4 py-3 font-display text-ld-body-lg text-ld-on-surface placeholder:text-ld-outline focus:border-ld-primary focus:outline-none focus:ring-2 focus:ring-ld-primary/25" />
          <PlayButton disabled={!theirs.trim()} onClick={() => setPhase("reveal")}>Reveal both</PlayButton>
        </div>
      )}
      {phase === "reveal" && (
        <div className="space-y-5">
          <p className="font-display text-ld-title-lg text-ld-on-surface-variant">{starter}</p>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl bg-ld-secondary-container/40 p-5"><p className="text-ld-label-sm font-semibold text-ld-on-surface">You</p><p className="mt-2 font-display text-ld-body-lg text-ld-on-surface">{mine}</p></div>
            <div className="rounded-2xl bg-ld-tertiary-fixed/40 p-5"><p className="text-ld-label-sm font-semibold text-ld-on-surface">Partner</p><p className="mt-2 font-display text-ld-body-lg text-ld-on-surface">{theirs}</p></div>
          </div>
          <PlayButton onClick={reset}>Next sentence</PlayButton>
        </div>
      )}
    </GameShell>
  );
}

/* ---------- Never Have I Ever ---------- */
export function NeverHaveIEver() {
  const [i, setI] = useState(0);
  const [you, setYou] = useState(0);
  const [partner, setPartner] = useState(0);
  const statement = NEVER_HAVE_I_EVER[i % NEVER_HAVE_I_EVER.length];

  return (
    <GameShell title="Never Have I Ever" subtitle="Read it out. If it is true for you, put a finger down." score={`You ${you} · Partner ${partner}`}>
      <div className="flex flex-col items-center gap-6 text-center">
        <p className="font-display text-ld-headline-md leading-snug text-ld-on-surface">{statement}</p>
        <div className="grid w-full max-w-md grid-cols-2 gap-3">
          <button type="button" onClick={() => setYou((n) => n + 1)} className="rounded-2xl bg-ld-secondary-container/50 px-4 py-4 text-ld-label-md text-ld-on-surface hover:bg-ld-secondary-container">I have (you)</button>
          <button type="button" onClick={() => setPartner((n) => n + 1)} className="rounded-2xl bg-ld-tertiary-fixed/60 px-4 py-4 text-ld-label-md text-ld-on-surface hover:bg-ld-tertiary-fixed">I have (partner)</button>
        </div>
        <PlayButton variant="quiet" onClick={() => setI((n) => n + 1)}>Next statement</PlayButton>
      </div>
    </GameShell>
  );
}

/* ---------- shared pieces ---------- */
function Question({ label, prompt, options, selected, onSelect, action }: { label: string; prompt: string; options: string[]; selected: number | null; onSelect: (i: number) => void; action: React.ReactNode }) {
  return (
    <div className="space-y-5">
      <p className="text-ld-label-sm font-semibold uppercase tracking-widest text-ld-primary">{label}</p>
      <p className="font-display text-ld-headline-md text-ld-on-surface">{prompt}</p>
      <div role="radiogroup" className="grid gap-3 sm:grid-cols-2">
        {options.map((o, i) => (
          <button key={o} type="button" role="radio" aria-checked={selected === i} onClick={() => onSelect(i)} className={cn("rounded-2xl border px-4 py-4 text-left text-ld-body-sm transition-colors", selected === i ? "border-ld-primary bg-ld-secondary-container/40" : "border-ld-outline-variant hover:bg-ld-surface-container-low")}>
            {o}
          </button>
        ))}
      </div>
      <div>{action}</div>
    </div>
  );
}

function HandOff({ to, hint, onReady }: { to: string; hint: string; onReady: () => void }) {
  return (
    <div className="flex flex-col items-center gap-5 py-6 text-center">
      <span className="flex size-14 items-center justify-center rounded-full bg-ld-surface-container text-ld-primary"><EyeOff className="size-6" aria-hidden="true" /></span>
      <p className="font-display text-ld-headline-md text-ld-on-surface">Pass the device to {to}.</p>
      <p className="max-w-sm text-ld-body-sm text-ld-on-surface-variant">{hint}</p>
      <PlayButton onClick={onReady}><Eye className="size-4" aria-hidden="true" />I am {to.toLowerCase()}, show me</PlayButton>
    </div>
  );
}

function Reveal({ title, lines, action }: { title: string; lines: string[]; action: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-5 py-6 text-center">
      <p className="font-display text-ld-headline-md text-ld-on-surface">{title}</p>
      {lines.map((l) => <p key={l} className="text-ld-body-sm text-ld-on-surface-variant">{l}</p>)}
      {action}
    </div>
  );
}

export { GUESS_QUESTIONS };
