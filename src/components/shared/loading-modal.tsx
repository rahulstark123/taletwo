"use client";

import { useEffect, useState } from "react";

const MESSAGES = [
  "Opening your little world…",
  "Gathering your memories…",
  "Making room for two…",
  "Almost there…",
];

/** Shown while the person signs out. Calm, and different from the sign-in messages. */
export const LOGOUT_MESSAGES = [
  "Closing your little world…",
  "Keeping your memories safe…",
  "Tucking everything in…",
  "See you soon…",
];

/**
 * Full-screen loading modal. It blocks duplicate clicks while a request runs and keeps the wait
 * feeling active with a gentle animation and rotating messages. Focus stays on the modal and
 * screen readers hear the status once.
 */
export function LoadingModal({
  open,
  label = "Please wait",
  messages = MESSAGES,
}: {
  open: boolean;
  label?: string;
  messages?: readonly string[];
}) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!open) return;
    const timer = setInterval(() => setIndex((i) => (i + 1) % messages.length), 1800);
    return () => clearInterval(timer);
  }, [open, messages.length]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-live="polite"
      aria-label={label}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-ld-surface/80 px-6 backdrop-blur-sm"
    >
      <div className="tt-motion flex w-full max-w-xs flex-col items-center gap-6 rounded-3xl bg-ld-surface-container-lowest px-8 py-10 text-center shadow-[0_24px_64px_-24px_rgba(64,56,50,0.35)]">
        <div className="relative h-16 w-24" aria-hidden="true">
          <span
            className="absolute left-0 top-0 size-16 rounded-full border-[3px] border-ld-primary"
            style={{ animation: "tt-drift-left 1.6s ease-in-out infinite, tt-breathe 2.4s ease-in-out infinite" }}
          />
          <span
            className="absolute right-0 top-0 size-16 rounded-full bg-ld-primary-container/80"
            style={{ animation: "tt-drift-right 1.6s ease-in-out infinite, tt-breathe 2.4s ease-in-out infinite 0.4s" }}
          />
        </div>
        <p key={index} className="min-h-[1.5em] font-display text-ld-title-lg text-ld-on-surface animate-in fade-in duration-500">
          {messages[index % messages.length]}
        </p>
        <span className="sr-only">{label}</span>
      </div>
    </div>
  );
}
