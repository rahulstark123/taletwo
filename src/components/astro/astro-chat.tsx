"use client";

import { useState } from "react";
import { AlertTriangle, Info, Send } from "lucide-react";
/**
 * Chat UI for Astro AI. Nothing is sent and no reply is generated yet: the send button stays
 * disabled until the Groq connection is added on the server. Birth details stay in this tab only.
 * Takes plain strings only, so it can receive data from a server component.
 */
export function AstroChat({ samples }: { samples: string[] }) {
  const [birthDate, setBirthDate] = useState("");
  const [birthTime, setBirthTime] = useState("");
  const [birthPlace, setBirthPlace] = useState("");
  const [question, setQuestion] = useState("");

  const detailsReady = birthDate !== "" && birthTime !== "" && birthPlace.trim() !== "";

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
      <section className="flex min-h-[460px] flex-col overflow-hidden rounded-3xl bg-ld-surface-container-lowest shadow-sm">
        <div className="flex-1 space-y-4 p-6">
          <p className="flex items-start gap-2 rounded-xl bg-ld-surface-container p-3 text-ld-caption text-ld-on-surface-variant">
            <AlertTriangle className="mt-px size-3.5 shrink-0 text-ld-primary" aria-hidden="true" />
            AI replies can be wrong. Use them for reflection, not as advice.
          </p>
          <div className="max-w-md rounded-2xl rounded-tl-sm bg-ld-surface-container p-4 text-ld-body-sm text-ld-on-surface">
            Namaste. I am Astro AI. Add your birth details, then ask me anything about love, money, career or your day. Replies will appear here once I am connected.
          </div>
          <div className="flex flex-wrap gap-2 pt-2" aria-label="Suggested questions">
            {samples.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setQuestion(s)}
                className="rounded-full border border-ld-outline-variant bg-ld-surface px-3 py-1.5 text-left text-ld-label-sm text-ld-on-surface-variant transition-colors hover:border-ld-primary hover:text-ld-primary"
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <form
          onSubmit={(e) => e.preventDefault()}
          className="flex items-center gap-2 border-t border-ld-outline-variant/40 p-4"
        >
          <label className="sr-only" htmlFor="astro-question">Your question</label>
          <input
            id="astro-question"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask Astro AI a question"
            className="h-11 flex-1 rounded-xl border border-ld-outline-variant bg-ld-surface px-4 text-ld-body-md text-ld-on-surface placeholder:text-ld-on-surface-variant/70 focus:border-ld-primary focus:outline-none"
          />
          <button
            type="submit"
            disabled
            aria-disabled="true"
            title="Available once Astro AI is connected"
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-ld-primary px-4 text-ld-label-sm text-ld-on-primary opacity-50"
          >
            <Send className="size-4" aria-hidden="true" />
            Send
          </button>
        </form>
      </section>

      <aside className="space-y-4 rounded-3xl bg-ld-surface-container-lowest p-6 shadow-sm">
        <h2 className="font-display text-ld-title-lg text-ld-on-surface">Birth details</h2>
        <p className="text-ld-body-sm text-ld-on-surface-variant">Used for Vedic (Indian) astrology. Time matters most for the Moon sign and houses.</p>
        <div className="space-y-3">
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
            <input value={birthPlace} onChange={(e) => setBirthPlace(e.target.value)} placeholder="City, country" className="h-11 w-full rounded-xl border border-ld-outline-variant bg-ld-surface px-3 text-ld-body-md text-ld-on-surface placeholder:text-ld-on-surface-variant/70 focus:border-ld-primary focus:outline-none" />
          </label>
        </div>
        <p className="flex items-start gap-2 rounded-2xl bg-ld-surface-container p-3 text-ld-caption text-ld-on-surface-variant">
          <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          {detailsReady ? "Ready. These details are kept in this tab only and are saved when Astro AI is connected." : "Fill in all three to personalise your replies."}
        </p>
        <p className="text-ld-caption text-ld-on-surface-variant">Astro AI is for reflection and fun. It is not a substitute for medical, legal or financial advice.</p>
      </aside>
    </div>
  );
}
