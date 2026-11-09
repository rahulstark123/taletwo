"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Info, RotateCcw, Send } from "lucide-react";
import { apiCall } from "@/components/onboarding/api-client";
import { AI_FEATURE_COSTS } from "@/config/ai-credits";
import { ASTRO_CHAT_QUESTIONS_PER_SESSION } from "@/lib/validations/astro";
import { cn } from "@/lib/utils";
import { PlaceInput } from "@/components/astro/place-input";

interface Turn {
  role: "user" | "assistant";
  content: string;
}

interface ReplyPayload {
  reply: string;
  charged: boolean;
  cost: number;
}

/**
 * Chat with Astro AI. Each session keeps up to ten questions. The first question of a session costs
 * credits; follow-ups in the same session are included. Birth details are sent with each question so the
 * reply can use them, and they are not stored on the server.
 */
export function AstroChat({ samples }: { samples: string[] }) {
  const router = useRouter();
  const [birthDate, setBirthDate] = useState("");
  const [birthTime, setBirthTime] = useState("");
  const [birthPlace, setBirthPlace] = useState("");
  const [question, setQuestion] = useState("");
  const [turns, setTurns] = useState<Turn[]>([]);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Keep the newest message in view as replies arrive.
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [turns, sending, error]);

  const userQuestions = turns.filter((t) => t.role === "user").length;
  const sessionFull = userQuestions >= ASTRO_CHAT_QUESTIONS_PER_SESSION;
  const detailsReady = birthDate !== "" && birthTime !== "" && birthPlace.trim() !== "";

  async function send() {
    const content = question.trim();
    if (!content || sending || sessionFull) return;

    const next: Turn[] = [...turns, { role: "user", content }];
    setTurns(next);
    setQuestion("");
    setError(null);
    setSending(true);

    const birth = {
      ...(birthDate ? { date: birthDate } : {}),
      ...(birthTime ? { time: birthTime } : {}),
      ...(birthPlace.trim() ? { place: birthPlace.trim() } : {}),
    };
    const res = await apiCall<ReplyPayload>("/api/astro/reply", {
      method: "POST",
      body: { topic: "chat", messages: next, birth },
    });
    setSending(false);

    if (!res.ok) {
      // Keep the question so the person can try again, and take the failed turn back out.
      setTurns(turns);
      setQuestion(content);
      setError(res.error.message);
      return;
    }
    setTurns([...next, { role: "assistant", content: res.data.reply }]);
    if (res.data.charged) router.refresh();
  }

  function newSession() {
    setTurns([]);
    setError(null);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
      <section className="flex h-[640px] max-h-[75vh] min-h-[460px] flex-col overflow-hidden rounded-3xl bg-ld-surface-container-lowest shadow-sm">
        <div className="flex items-center justify-between gap-3 border-b border-ld-outline-variant/40 px-6 py-3">
          <p className="text-ld-caption text-ld-on-surface-variant" aria-live="polite">
            {turns.length === 0 ? `New session. The first question costs ${AI_FEATURE_COSTS.chat.credits} credits.` : `${userQuestions} of ${ASTRO_CHAT_QUESTIONS_PER_SESSION} questions in this session`}
          </p>
          {turns.length > 0 && (
            <button type="button" onClick={newSession} className="inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-ld-label-sm text-ld-primary hover:bg-ld-surface-container">
              <RotateCcw className="size-3.5" aria-hidden="true" />
              New session
            </button>
          )}
        </div>

        <div ref={scrollRef} className="min-h-0 flex-1 space-y-4 overflow-y-auto p-6">
          <p className="flex items-start gap-2 rounded-xl bg-ld-surface-container p-3 text-ld-caption text-ld-on-surface-variant">
            <AlertTriangle className="mt-px size-3.5 shrink-0 text-ld-primary" aria-hidden="true" />
            AI replies can be wrong. Use them for reflection, not as advice.
          </p>

          {turns.length === 0 && (
            <>
              <div className="max-w-md rounded-2xl rounded-tl-sm bg-ld-surface-container p-4 text-ld-body-sm text-ld-on-surface">
                Namaste. I am Astro AI. Add your birth details, then ask me anything about love, money, career or your day.
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
            </>
          )}

          {turns.map((t, i) => (
            <div
              key={i}
              className={cn(
                "max-w-md whitespace-pre-wrap rounded-2xl p-4 text-ld-body-sm",
                t.role === "user" ? "ml-auto rounded-tr-sm bg-ld-primary text-ld-on-primary" : "rounded-tl-sm bg-ld-surface-container text-ld-on-surface"
              )}
            >
              {t.content}
            </div>
          ))}

          {sending && <p className="text-ld-caption text-ld-on-surface-variant">Astro AI is thinking…</p>}
          {error && (
            <p role="alert" className="rounded-xl bg-ld-error-container px-4 py-2 text-ld-caption text-ld-on-error-container">
              {error}
            </p>
          )}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            void send();
          }}
          className="flex items-center gap-2 border-t border-ld-outline-variant/40 p-4"
        >
          <label className="sr-only" htmlFor="astro-question">Your question</label>
          <input
            id="astro-question"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            maxLength={1000}
            disabled={sessionFull || sending}
            placeholder={sessionFull ? "This session is full. Start a new one." : "Ask Astro AI a question"}
            className="h-11 flex-1 rounded-xl border border-ld-outline-variant bg-ld-surface px-4 text-ld-body-md text-ld-on-surface placeholder:text-ld-on-surface-variant/70 focus:border-ld-primary focus:outline-none disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={sessionFull || sending || question.trim() === ""}
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-ld-primary px-4 text-ld-label-sm text-ld-on-primary transition-opacity disabled:opacity-50"
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
            <PlaceInput value={birthPlace} onChange={setBirthPlace} />
          </label>
        </div>
        <p className="flex items-start gap-2 rounded-2xl bg-ld-surface-container p-3 text-ld-caption text-ld-on-surface-variant">
          <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          {detailsReady
            ? "Ready. Your replies will use these details. They are sent with each question and not stored."
            : "Fill in all three to personalise your replies. They are sent with each question and not stored."}
        </p>
        <p className="text-ld-caption text-ld-on-surface-variant">Astro AI is for reflection and fun. It is not a substitute for medical, legal or financial advice.</p>
      </aside>
    </div>
  );
}
