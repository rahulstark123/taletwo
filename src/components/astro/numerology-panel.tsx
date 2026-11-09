"use client";

import { useState } from "react";
import { lifePathNumber, LIFE_PATH_MEANINGS } from "@/lib/numerology";

/** Life Path calculator. Runs entirely in the browser; the date is not sent anywhere. */
export function NumerologyPanel() {
  const [date, setDate] = useState("");
  const number = date ? lifePathNumber(date) : null;
  const meaning = number ? LIFE_PATH_MEANINGS[number] : null;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
      <section className="space-y-4 rounded-3xl bg-ld-surface-container-lowest p-6 shadow-sm">
        <h2 className="font-display text-ld-title-lg text-ld-on-surface">Your Life Path</h2>
        <p className="text-ld-body-sm text-ld-on-surface-variant">Enter a date of birth to see your Life Path number. Nothing you type here is saved.</p>
        <label className="block space-y-1.5">
          <span className="text-ld-label-sm text-ld-on-surface-variant">Date of birth</span>
          <input
            type="date"
            value={date}
            max={new Date().toISOString().slice(0, 10)}
            onChange={(e) => setDate(e.target.value)}
            className="h-11 w-full rounded-xl border border-ld-outline-variant bg-ld-surface px-3 text-ld-body-md text-ld-on-surface focus:border-ld-primary focus:outline-none"
          />
        </label>
      </section>

      <section aria-live="polite" className="flex flex-col items-center justify-center rounded-3xl bg-ld-surface-container-lowest p-8 text-center shadow-sm">
        {meaning && number ? (
          <>
            <span className="font-display text-[4.5rem] leading-none text-ld-primary">{number}</span>
            <h3 className="mt-4 font-display text-ld-title-lg text-ld-on-surface">{meaning.title}</h3>
            <p className="mt-2 max-w-sm text-ld-body-sm text-ld-on-surface-variant">{meaning.text}</p>
          </>
        ) : (
          <p className="text-ld-body-sm text-ld-on-surface-variant">Your number and its meaning will appear here.</p>
        )}
      </section>
    </div>
  );
}
