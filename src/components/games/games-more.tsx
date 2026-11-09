"use client";

import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { GameShell, PlayButton } from "@/components/games/game-shell";
import { KNOW_BETTER_QUESTIONS, LOVE_RESULTS, LOVE_SEGMENTS, type GuessQuestion } from "@/components/games/games-content";
import { cn } from "@/lib/utils";

/* ---------- Who Knows Better? ---------- */
/** Both answer about themselves in secret, then both guess the other. Most correct guesses wins the round. */
export function WhoKnowsBetter() {
  const qs = KNOW_BETTER_QUESTIONS;
  const [i, setI] = useState(0);
  const [step, setStep] = useState<"you" | "handoff-partner" | "partner" | "handoff-guess" | "guess-partner" | "guess-you" | "reveal">("you");
  const [yours, setYours] = useState<number | null>(null);
  const [theirs, setTheirs] = useState<number | null>(null);
  const [guessAboutPartner, setGuessAboutPartner] = useState<number | null>(null);
  const [guessAboutYou, setGuessAboutYou] = useState<number | null>(null);
  const [youScore, setYouScore] = useState(0);
  const [partnerScore, setPartnerScore] = useState(0);
  const finished = i >= qs.length;

  function resetRound() {
    setYours(null);
    setTheirs(null);
    setGuessAboutPartner(null);
    setGuessAboutYou(null);
    setStep("you");
  }

  if (finished) {
    return (
      <GameShell title="Who Knows Better?" subtitle="Guess each other, then see who really knows whom." score={`You ${youScore} · Partner ${partnerScore}`}>
        <div className="flex flex-col items-center gap-5 py-6 text-center">
          <p className="font-display text-ld-headline-md text-ld-on-surface">
            {youScore === partnerScore ? "A perfect tie. You both know each other well." : youScore > partnerScore ? "You know your partner better." : "Your partner knows you better."}
          </p>
          <PlayButton onClick={() => { setI(0); setYouScore(0); setPartnerScore(0); resetRound(); }}>
            <RefreshCw className="size-4" aria-hidden="true" />
            Play again
          </PlayButton>
        </div>
      </GameShell>
    );
  }

  const q = qs[i];

  function finishRound() {
    if (guessAboutPartner === theirs) setYouScore((s) => s + 1);
    if (guessAboutYou === yours) setPartnerScore((s) => s + 1);
    setStep("reveal");
  }

  return (
    <GameShell title="Who Knows Better?" subtitle="Answer for yourself, then guess your partner's answer." score={`Question ${i + 1} of ${qs.length}`}>
      {step === "you" && <Pick label="You, answer for yourself" q={q} selected={yours} onSelect={setYours} next={<PlayButton disabled={yours === null} onClick={() => setStep("handoff-partner")}>Lock it</PlayButton>} />}
      {step === "handoff-partner" && <Hand text="Partner, answer for yourself. Look away, please." next={() => setStep("partner")} />}
      {step === "partner" && <Pick label="Partner, answer for yourself" q={q} selected={theirs} onSelect={setTheirs} next={<PlayButton disabled={theirs === null} onClick={() => setStep("handoff-guess")}>Lock it</PlayButton>} />}
      {step === "handoff-guess" && <Hand text="Now guess! Pass it back to them." next={() => setStep("guess-partner")} />}
      {step === "guess-partner" && <Pick label="Partner, guess what the other answered" q={q} selected={guessAboutYou} onSelect={setGuessAboutYou} next={<PlayButton disabled={guessAboutYou === null} onClick={() => setStep("guess-you")}>Next</PlayButton>} />}
      {step === "guess-you" && <Pick label="You, guess what your partner answered" q={q} selected={guessAboutPartner} onSelect={setGuessAboutPartner} next={<PlayButton disabled={guessAboutPartner === null} onClick={finishRound}>Reveal</PlayButton>} />}
      {step === "reveal" && (
        <div className="space-y-5">
          <p className="font-display text-ld-headline-md text-ld-on-surface">{q.prompt}</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <Card title="Your answer" value={yours !== null ? q.options[yours] : "-"} tone="rose" />
            <Card title="Partner's answer" value={theirs !== null ? q.options[theirs] : "-"} tone="sage" />
            <Card title="Your guess about them" value={guessAboutPartner !== null ? q.options[guessAboutPartner] : "-"} tone="stone" />
            <Card title="Their guess about you" value={guessAboutYou !== null ? q.options[guessAboutYou] : "-"} tone="stone" />
          </div>
          <PlayButton onClick={() => { setI((n) => n + 1); resetRound(); }}>{i + 1 === qs.length ? "See the result" : "Next question"}</PlayButton>
        </div>
      )}
    </GameShell>
  );
}

function Pick({ label, q, selected, onSelect, next }: { label: string; q: GuessQuestion; selected: number | null; onSelect: (i: number) => void; next: React.ReactNode }) {
  return (
    <div className="space-y-5">
      <p className="text-ld-label-sm font-semibold uppercase tracking-widest text-ld-primary">{label}</p>
      <p className="font-display text-ld-headline-md text-ld-on-surface">{q.prompt}</p>
      <div role="radiogroup" className="grid gap-3 sm:grid-cols-2">
        {q.options.map((o, i) => (
          <button key={o} type="button" role="radio" aria-checked={selected === i} onClick={() => onSelect(i)} className={cn("rounded-2xl border px-4 py-4 text-left text-ld-body-sm transition-colors", selected === i ? "border-ld-primary bg-ld-secondary-container/40" : "border-ld-outline-variant hover:bg-ld-surface-container-low")}>{o}</button>
        ))}
      </div>
      <div>{next}</div>
    </div>
  );
}

function Hand({ text, next }: { text: string; next: () => void }) {
  return (
    <div className="flex flex-col items-center gap-5 py-6 text-center">
      <p className="font-display text-ld-headline-md text-ld-on-surface">{text}</p>
      <PlayButton onClick={next}>Ready</PlayButton>
    </div>
  );
}

function Card({ title, value, tone }: { title: string; value: string; tone: "rose" | "sage" | "stone" }) {
  const bg = tone === "rose" ? "bg-ld-secondary-container/40" : tone === "sage" ? "bg-ld-tertiary-fixed/40" : "bg-ld-surface-container";
  return (
    <div className={cn("rounded-2xl p-4", bg)}>
      <p className="text-ld-label-sm font-semibold text-ld-on-surface">{title}</p>
      <p className="mt-1 text-ld-body-sm text-ld-on-surface">{value}</p>
    </div>
  );
}

/* ---------- Love Calculator: Spin the Wheel ---------- */
export function LoveCalculator() {
  const [a, setA] = useState("");
  const [b, setB] = useState("");
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState<{ percent: number; message: string } | null>(null);
  const seg = 360 / LOVE_SEGMENTS.length;

  function spin() {
    if (spinning) return;
    const landing = Math.floor(Math.random() * LOVE_SEGMENTS.length);
    const extra = 360 * 5;
    const target = rotation + extra + (360 - landing * seg - seg / 2) - (rotation % 360);
    setSpinning(true);
    setResult(null);
    setRotation(target);
    setTimeout(() => {
      const percent = LOVE_SEGMENTS[landing];
      setResult({ percent, message: (LOVE_RESULTS.find((r) => percent >= r.min) ?? LOVE_RESULTS[LOVE_RESULTS.length - 1]).message });
      setSpinning(false);
    }, 3200);
  }

  return (
    <GameShell title="Love Calculator" subtitle="Spin the wheel for a playful score. It is for fun, not a verdict." score={result ? `${result.percent}%` : undefined}>
      <div className="flex flex-col items-center gap-6">
        <div className="grid w-full max-w-md gap-3 sm:grid-cols-2">
          <input aria-label="First name" value={a} maxLength={24} onChange={(e) => setA(e.target.value)} placeholder="Your name" className="h-11 rounded-xl border border-ld-outline-variant bg-ld-surface px-4 text-ld-body-sm text-ld-on-surface placeholder:text-ld-outline focus:border-ld-primary focus:outline-none focus:ring-2 focus:ring-ld-primary/25" />
          <input aria-label="Second name" value={b} maxLength={24} onChange={(e) => setB(e.target.value)} placeholder="Partner's name" className="h-11 rounded-xl border border-ld-outline-variant bg-ld-surface px-4 text-ld-body-sm text-ld-on-surface placeholder:text-ld-outline focus:border-ld-primary focus:outline-none focus:ring-2 focus:ring-ld-primary/25" />
        </div>

        <div className="relative size-72 sm:size-80" aria-hidden="true">
          <div className="absolute left-1/2 -top-2 z-10 h-0 w-0 -translate-x-1/2 border-x-[12px] border-b-[20px] border-x-transparent border-b-ld-on-surface" />
          <svg viewBox="0 0 200 200" className="size-full transition-transform duration-[3200ms] ease-[cubic-bezier(0.17,0.67,0.2,1)]" style={{ transform: `rotate(${rotation}deg)` }}>
            {LOVE_SEGMENTS.map((v, i) => {
              const start = i * seg;
              const end = start + seg;
              const rad = (d: number) => ((d - 90) * Math.PI) / 180;
              const x1 = 100 + 100 * Math.cos(rad(start));
              const y1 = 100 + 100 * Math.sin(rad(start));
              const x2 = 100 + 100 * Math.cos(rad(end));
              const y2 = 100 + 100 * Math.sin(rad(end));
              const fill = ["#e9a8ae", "#fbe3e6", "#ebe3f2", "#eef4ee", "#fbe3c9", "#dfe9f3"][i % 6];
              const mid = rad(start + seg / 2);
              return (
                <g key={i}>
                  <path d={`M100 100 L${x1} ${y1} A100 100 0 0 1 ${x2} ${y2} Z`} fill={fill} stroke="#fff8f5" strokeWidth="1" />
                  <text x={100 + 62 * Math.cos(mid)} y={100 + 62 * Math.sin(mid)} fontSize="11" textAnchor="middle" dominantBaseline="middle" fill="#211a15" transform={`rotate(${start + seg / 2} ${100 + 62 * Math.cos(mid)} ${100 + 62 * Math.sin(mid)})`}>{v}%</text>
                </g>
              );
            })}
            <circle cx="100" cy="100" r="14" fill="#c97e8b" />
          </svg>
        </div>

        <PlayButton onClick={spin} disabled={spinning}>{spinning ? "Spinning…" : "Spin the wheel"}</PlayButton>

        <p className="sr-only" aria-live="polite">{result ? `${result.percent} percent. ${result.message}` : ""}</p>
        {result && (
          <div className="max-w-md rounded-3xl bg-gradient-to-br from-ld-secondary-container via-[#fbe3e6] to-ld-surface-container p-6 text-center animate-in fade-in zoom-in-95 duration-500">
            <p className="font-display text-[48px] leading-none text-ld-on-surface">{result.percent}%</p>
            <p className="mt-2 text-ld-caption text-ld-on-surface-variant">{a || "You"} &amp; {b || "your partner"}</p>
            <p className="mt-4 font-display text-ld-title-lg text-ld-on-surface">{result.message}</p>
          </div>
        )}
      </div>
    </GameShell>
  );
}
