"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Info, Sparkles } from "lucide-react";
import { apiCall } from "@/components/onboarding/api-client";
import type { AstroTopicSlug } from "@/lib/validations/astro";
import { PlaceInput } from "@/components/astro/place-input";

interface ReadingPayload {
  reply: string;
  charged: boolean;
  cost: number;
  cached: boolean;
}

const PLACEHOLDER: Partial<Record<AstroTopicSlug, string>> = {
  festivals: "A date range or an occasion, for example: our engagement in March",
  finance: "Anything specific on your mind? (optional)",
  partnership: "Anything you want us to focus on? (optional)",
};

/**
 * One reading for a topic other than chat. The person adds birth details and an optional note, then
 * gets a single reply. The cost is shown before they ask. Daily readings are kept for the day.
 */
export function AstroTopicRunner({ topic, title, cost, samples }: { topic: AstroTopicSlug; title: string; cost: number; samples: string[] }) {
  const router = useRouter();
  const [birthDate, setBirthDate] = useState("");
  const [birthTime, setBirthTime] = useState("");
  const [birthPlace, setBirthPlace] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ReadingPayload | null>(null);

  async function ask() {
    if (busy) return;
    setBusy(true);
    setError(null);
    const birth = {
      ...(birthDate ? { date: birthDate } : {}),
      ...(birthTime ? { time: birthTime } : {}),
      ...(birthPlace.trim() ? { place: birthPlace.trim() } : {}),
    };
    const res = await apiCall<ReadingPayload>("/api/astro/reply", {
      method: "POST",
      body: { topic, messages: [], note: note.trim() || undefined, birth },
    });
    setBusy(false);
    if (!res.ok) {
      setError(res.error.message);
      return;
    }
    setResult(res.data);
    if (res.data.charged) router.refresh();
  }

  return (
    <section className="space-y-5 rounded-3xl bg-ld-surface-container-lowest p-6 shadow-sm sm:p-8">
      <div className="space-y-1">
        <h2 className="font-display text-ld-title-lg text-ld-on-surface">Your {title.toLowerCase()} reading</h2>
        <p className="text-ld-caption text-ld-on-surface-variant">
          {topic === "daily-horoscope"
            ? "Once a day, free to view again the same day."
            : `Each reading costs ${cost} AI credits.`}
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <label className="block space-y-1.5">
          <span className="text-ld-label-sm text-ld-on-surface-variant">Date of birth</span>
          <input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} className="h-11 w-full rounded-xl border border-ld-outline-variant bg-ld-surface px-3 text-ld-body-md text-ld-on-surface focus:border-ld-primary focus:outline-none" />
        </label>
        <label className="block space-y-1.5">
          <span className="text-ld-label-sm text-ld-on-surface-variant">Time of birth</span>
          <input type="time" value={birthTime} onChange={(e) => setBirthTime(e.target.value)} className="h-11 w-full rounded-xl border border-ld-outline-variant bg-ld-surface px-3 text-ld-body-md text-ld-on-surface focus:border-ld-primary focus:outline-none" />
        </label>
        <label className="block space-y-1.5">
          <span className="text-ld-label-sm text-ld-on-surface-variant">Place of birth</span>
          <PlaceInput value={birthPlace} onChange={setBirthPlace} />
        </label>
      </div>

      {topic !== "daily-horoscope" && (
        <label className="block space-y-1.5">
          <span className="text-ld-label-sm text-ld-on-surface-variant">Anything specific? (optional)</span>
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={500}
            placeholder={PLACEHOLDER[topic] ?? "Add a note (optional)"}
            className="h-11 w-full rounded-xl border border-ld-outline-variant bg-ld-surface px-4 text-ld-body-md text-ld-on-surface placeholder:text-ld-on-surface-variant/70 focus:border-ld-primary focus:outline-none"
          />
        </label>
      )}

      {samples.length > 0 && topic !== "daily-horoscope" && (
        <div className="flex flex-wrap gap-2" aria-label="Suggested questions">
          {samples.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setNote(s)}
              className="rounded-full border border-ld-outline-variant bg-ld-surface px-3 py-1.5 text-left text-ld-label-sm text-ld-on-surface-variant transition-colors hover:border-ld-primary hover:text-ld-primary"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={ask}
          disabled={busy}
          className="inline-flex h-11 items-center gap-2 rounded-full bg-ld-primary px-6 text-ld-label-md text-ld-on-primary transition-opacity disabled:opacity-50"
        >
          <Sparkles className="size-4" aria-hidden="true" />
          {busy ? "Reading the stars…" : topic === "daily-horoscope" ? "Get today's note" : `Get reading · ${cost} credits`}
        </button>
        <p className="flex items-center gap-2 text-ld-caption text-ld-on-surface-variant">
          <Info className="size-3.5" aria-hidden="true" />
          Birth details are used for this reading and are not stored.
        </p>
      </div>

      {error && (
        <p role="alert" className="rounded-xl bg-ld-error-container px-4 py-2 text-ld-caption text-ld-on-error-container">
          {error}
        </p>
      )}

      {result && (
        <article className="space-y-2 rounded-2xl bg-ld-surface-container p-5">
          {result.cached && <p className="text-ld-caption text-ld-on-surface-variant">Today&apos;s note. Already read today, so no credits were used.</p>}
          <p className="whitespace-pre-wrap text-ld-body-md leading-relaxed text-ld-on-surface">{result.reply}</p>
        </article>
      )}
    </section>
  );
}
