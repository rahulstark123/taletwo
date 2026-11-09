"use client";

import { useEffect, useMemo, useState } from "react";
import { BookOpen, Check, Heart, Lock, MessageCircle, RefreshCw, Sparkles } from "lucide-react";
import { apiCall } from "@/components/onboarding/api-client";
import { QUESTION_CATEGORIES, QUESTION_CATEGORY_LABEL, type QuestionCategoryValue } from "@/lib/daily-questions";
import { REVEAL_MODE_LABEL, type DailyHistoryPayload, type DailyQuestionView, type RevealModeValue } from "@/lib/daily-question-types";
import { DAILY_ANSWER_MAX } from "@/lib/validations/daily-question";
import { cn } from "@/lib/utils";
import { Pagination, usePagination } from "@/components/shared/pagination";

type Tab = "today" | "history";

const CATEGORY_COVER: Record<QuestionCategoryValue, string> = {
  FUN: "from-ld-tertiary-fixed via-ld-surface-container to-ld-surface",
  MEMORIES: "from-[#f5ead7] via-ld-surface-container to-ld-surface",
  DEEP_CONVERSATIONS: "from-[#ebe3f2] via-ld-surface-container to-ld-surface",
  FUTURE: "from-[#dfe9f3] via-ld-surface-container to-[#f4efe6]",
  ROMANCE: "from-ld-secondary-container via-[#fbe3e6] to-ld-surface-container",
};

const longDate = new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long" });

export function QuestionBoard({ initial }: { initial: DailyQuestionView }) {
  const [view, setView] = useState<DailyQuestionView>(initial);
  const [tab, setTab] = useState<Tab>("today");
  const [draft, setDraft] = useState(initial.mine?.body ?? "");
  const [editing, setEditing] = useState(!initial.mine);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ tone: "info" | "error"; text: string } | null>(null);
  const [history, setHistory] = useState<DailyHistoryPayload | null>(null);
  const [historyCat, setHistoryCat] = useState<QuestionCategoryValue | "ALL">("ALL");
  const [justRevealed, setJustRevealed] = useState(false);

  const partnerName = view.partner.displayName;

  // Refresh when the tab regains focus, so the partner's answer shows without a reload.
  useEffect(() => {
    async function refresh() {
      const res = await apiCall<DailyQuestionView>("/api/daily-question");
      if (res.ok) applyView(res.data);
    }
    const onFocus = () => {
      if (document.visibilityState === "visible") refresh();
    };
    document.addEventListener("visibilitychange", onFocus);
    return () => document.removeEventListener("visibilitychange", onFocus);
  }, []);

  function applyView(next: DailyQuestionView) {
    setView((prev) => {
      if (!prev.partnerStatus.revealed && next.partnerStatus.revealed) setJustRevealed(true);
      return next;
    });
    if (!next.mine) setEditing(true);
  }

  async function save() {
    const body = draft.trim();
    if (!body) return setMessage({ tone: "error", text: "Write a few words to answer today's question." });
    setSaving(true);
    setMessage(null);
    const res = await apiCall<DailyQuestionView>("/api/daily-question/answer", { method: "PUT", body: { body } });
    setSaving(false);
    if (!res.ok) return setMessage({ tone: "error", text: res.error.message });
    applyView(res.data);
    setEditing(false);
    setMessage({ tone: "info", text: res.data.partnerStatus.revealed ? "Revealed. Scroll down to read each other." : `Saved. ${partnerName} will see it once you both have answered.` });
  }

  async function heart() {
    const res = await apiCall<DailyQuestionView>("/api/daily-question/heart", { method: "POST" });
    if (res.ok) applyView(res.data);
    else setMessage({ tone: "error", text: res.error.message });
  }

  async function changeMode(mode: RevealModeValue) {
    const res = await apiCall<DailyQuestionView>("/api/daily-question/settings", { method: "PATCH", body: { revealMode: mode } });
    if (res.ok) applyView(res.data);
    else setMessage({ tone: "error", text: res.error.message });
  }

  useEffect(() => {
    if (tab !== "history") return;
    let cancelled = false;
    (async () => {
      const q = historyCat === "ALL" ? "" : `?category=${historyCat}`;
      const res = await apiCall<DailyHistoryPayload>(`/api/daily-question/history${q}`);
      if (cancelled) return;
      if (res.ok) setHistory(res.data);
      else setMessage({ tone: "error", text: res.error.message });
    })();
    return () => {
      cancelled = true;
    };
  }, [tab, historyCat]);

  const categoryName = QUESTION_CATEGORY_LABEL[view.question.category];
  const answeredCount = useMemo(() => (view.mine ? 1 : 0) + (view.partnerStatus.answered ? 1 : 0), [view]);

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <p className="text-ld-label-sm font-semibold uppercase tracking-widest text-ld-primary">{longDate.format(new Date(`${view.day}T12:00:00Z`))}</p>
          <p className="max-w-xl text-ld-body-md text-ld-on-surface-variant">One question a day. Answer on your own, and read each other&apos;s when you are both ready.</p>
        </div>
        <div role="tablist" aria-label="Daily question sections" className="inline-flex w-fit gap-1 rounded-full bg-ld-surface-container p-1">
          {([["today", "Today", MessageCircle], ["history", "History", BookOpen]] as const).map(([key, label, Icon]) => (
            <button key={key} type="button" role="tab" aria-selected={tab === key} onClick={() => setTab(key)} className={cn("inline-flex h-10 items-center gap-2 rounded-full px-4 text-ld-label-md transition-colors", tab === key ? "bg-ld-surface-container-lowest text-ld-on-surface shadow-sm" : "text-ld-on-surface-variant hover:text-ld-on-surface")}>
              <Icon className="size-4" aria-hidden="true" />
              {label}
            </button>
          ))}
        </div>
      </header>

      {tab === "today" ? (
        <>
          {/* Question */}
          <section aria-labelledby="today-question" className={cn("relative overflow-hidden rounded-3xl bg-gradient-to-br p-7 shadow-sm sm:p-10", CATEGORY_COVER[view.question.category])}>
            <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-16 size-56 rounded-full bg-ld-surface/40 blur-2xl" />
            <div className="relative space-y-5">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-ld-surface/80 px-3 py-1 text-ld-caption font-medium text-ld-on-surface">
                <Sparkles className="size-3.5 text-ld-primary" aria-hidden="true" />
                {categoryName}
              </span>
              <h2 id="today-question" className="font-display text-ld-headline-lg-mobile leading-snug text-ld-on-surface md:text-ld-headline-lg">
                &ldquo;{view.question.text}&rdquo;
              </h2>
              <p className="flex flex-wrap items-center gap-2 text-ld-caption text-ld-on-surface-variant">
                <span className={cn("size-2 rounded-full", view.mine ? "bg-ld-tertiary" : "bg-ld-outline-variant")} aria-hidden="true" />
                {view.mine ? "You have answered" : "You have not answered yet"}
                <span aria-hidden="true">·</span>
                {answeredCount === 2 ? "You are both in" : `${answeredCount} of 2 answered`}
              </p>
            </div>
          </section>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Mine */}
            <section aria-labelledby="my-answer" className="flex flex-col gap-4 rounded-3xl bg-ld-surface-container-lowest p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 id="my-answer" className="font-display text-ld-headline-md text-ld-on-surface">Your answer</h3>
                {view.mine && !editing && view.canEdit && (
                  <button type="button" onClick={() => { setDraft(view.mine?.body ?? ""); setEditing(true); }} className="text-ld-label-sm text-ld-primary hover:underline">Edit</button>
                )}
              </div>

              {!view.canEdit && view.mine ? (
                <p className="whitespace-pre-wrap font-display text-ld-body-lg leading-relaxed text-ld-on-surface">{view.mine.body}</p>
              ) : editing && view.canEdit ? (
                <form noValidate onSubmit={(e) => { e.preventDefault(); save(); }} className="flex flex-col gap-3">
                  <label htmlFor="answer" className="sr-only">Your answer</label>
                  <textarea
                    id="answer"
                    rows={5}
                    maxLength={DAILY_ANSWER_MAX}
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                        e.preventDefault();
                        save();
                      }
                    }}
                    placeholder={`Be honest, be a little soft. ${partnerName} will read it too.`}
                    className="w-full resize-none rounded-2xl border border-ld-outline-variant bg-ld-surface px-4 py-3 font-display text-ld-body-lg leading-relaxed text-ld-on-surface placeholder:text-ld-outline focus:border-ld-primary focus:outline-none focus:ring-2 focus:ring-ld-primary/25"
                  />
                  <div className="flex items-center justify-between gap-3">
                    <span className={cn("text-ld-caption tabular-nums", draft.length > DAILY_ANSWER_MAX * 0.9 ? "text-ld-error" : "text-ld-on-surface-variant")}>{draft.length} / {DAILY_ANSWER_MAX}</span>
                    <div className="flex gap-2">
                      {view.mine && (
                        <button type="button" onClick={() => { setDraft(view.mine?.body ?? ""); setEditing(false); }} className="h-10 rounded-full px-4 text-ld-label-sm text-ld-on-surface-variant hover:bg-ld-on-surface/5">Cancel</button>
                      )}
                      <button type="submit" disabled={saving || !draft.trim()} className="inline-flex h-10 items-center gap-2 rounded-full bg-ld-primary px-5 text-ld-label-sm text-ld-on-primary shadow-[0_8px_20px_rgba(201,126,139,0.28)] transition-colors hover:bg-ld-on-primary-fixed-variant disabled:opacity-50">
                        <Check className="size-4" aria-hidden="true" />
                        {saving ? "Saving…" : view.mine ? "Update" : "Save answer"}
                      </button>
                    </div>
                  </div>
                  <p className="text-[11px] text-ld-outline">Ctrl + Enter to save. You can edit until you both see each other&apos;s answers.</p>
                </form>
              ) : (
                <p className="text-ld-body-sm text-ld-on-surface-variant">Answer in your own words. Nothing is shared until you both have answered, or until midnight, depending on your setting.</p>
              )}
              {message && <p role={message.tone === "error" ? "alert" : "status"} className={cn("rounded-xl px-4 py-2 text-ld-caption", message.tone === "error" ? "bg-ld-error-container text-ld-on-error-container" : "bg-ld-secondary-container/40 text-ld-on-surface")}>{message.text}</p>}
            </section>

            {/* Partner */}
            <section aria-labelledby="partner-answer" className="flex flex-col gap-4 rounded-3xl bg-ld-surface-container p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 id="partner-answer" className="font-display text-ld-headline-md text-ld-on-surface">{partnerName}&apos;s answer</h3>
                {view.partnerStatus.answered && view.partnerStatus.revealed && (
                  <button
                    type="button"
                    onClick={heart}
                    aria-pressed={view.partnerStatus.heartedByMe}
                    className={cn("inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-ld-label-sm transition-colors", view.partnerStatus.heartedByMe ? "bg-ld-primary text-ld-on-primary" : "bg-ld-surface-container-lowest text-ld-on-surface hover:bg-ld-surface")}
                  >
                    <Heart className={cn("size-4", view.partnerStatus.heartedByMe && "fill-current")} aria-hidden="true" />
                    {view.partnerStatus.heartedByMe ? "Loved it" : "Love this"}
                  </button>
                )}
              </div>

              {view.partnerStatus.revealed && view.partnerStatus.body ? (
                <div className={cn("relative rounded-2xl bg-ld-surface-container-lowest p-5", justRevealed && "animate-in fade-in zoom-in-95 duration-700")}>
                  <p className="whitespace-pre-wrap font-display text-ld-body-lg leading-relaxed text-ld-on-surface">{view.partnerStatus.body}</p>
                  {justRevealed && <span className="mt-3 inline-block text-ld-caption text-ld-primary">Just revealed</span>}
                </div>
              ) : view.partnerStatus.answered ? (
                <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-ld-outline-variant px-5 py-10 text-center">
                  <span className="flex size-12 items-center justify-center rounded-full bg-ld-surface-container-lowest text-ld-primary"><Lock className="size-5" aria-hidden="true" /></span>
                  <p className="font-display text-ld-title-lg text-ld-on-surface">{partnerName} has answered.</p>
                  <p className="max-w-xs text-ld-caption text-ld-on-surface-variant">
                    {view.revealMode === "AT_MIDNIGHT" ? "It will appear together with yours at midnight." : "It will appear as soon as you have answered too."}
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-ld-outline-variant px-5 py-10 text-center">
                  <span className="flex gap-1" aria-hidden="true">
                    <span className="size-2 animate-bounce rounded-full bg-ld-primary [animation-delay:-0.3s]" />
                    <span className="size-2 animate-bounce rounded-full bg-ld-primary [animation-delay:-0.15s]" />
                    <span className="size-2 animate-bounce rounded-full bg-ld-primary" />
                  </span>
                  <p className="font-display text-ld-title-lg text-ld-on-surface">{partnerName} is still thinking.</p>
                  <p className="max-w-xs text-ld-caption text-ld-on-surface-variant">Their answer stays hidden until they have written it.</p>
                </div>
              )}
              <div className="mt-auto flex items-center justify-between gap-3 pt-2">
                <button type="button" onClick={async () => { const r = await apiCall<DailyQuestionView>("/api/daily-question"); if (r.ok) applyView(r.data); }} className="inline-flex items-center gap-1.5 text-ld-caption text-ld-on-surface-variant hover:text-ld-on-surface">
                  <RefreshCw className="size-3.5" aria-hidden="true" />
                  <span className="sr-only">Check again</span>
                  Check again
                </button>
              </div>
            </section>
          </div>

          {/* Reveal settings */}
          <section aria-labelledby="reveal-settings" className="rounded-3xl bg-ld-surface-container-lowest p-6 shadow-sm">
            <h3 id="reveal-settings" className="font-display text-ld-title-lg text-ld-on-surface">When should answers show?</h3>
            <p className="mb-4 text-ld-caption text-ld-on-surface-variant">This applies to both of you.</p>
            <div role="radiogroup" className="grid gap-3 md:grid-cols-2">
              {(Object.keys(REVEAL_MODE_LABEL) as RevealModeValue[]).map((mode) => {
                const active = view.revealMode === mode;
                return (
                  <button key={mode} type="button" role="radio" aria-checked={active} onClick={() => changeMode(mode)} className={cn("flex flex-col items-start gap-1 rounded-2xl border p-4 text-left transition-colors", active ? "border-ld-primary bg-ld-secondary-container/40" : "border-ld-outline-variant hover:bg-ld-surface-container-low")}>
                    <span className="text-ld-label-md font-semibold text-ld-on-surface">{REVEAL_MODE_LABEL[mode].title}</span>
                    <span className="text-ld-caption text-ld-on-surface-variant">{REVEAL_MODE_LABEL[mode].hint}</span>
                  </button>
                );
              })}
            </div>
          </section>
        </>
      ) : (
        <History
          history={history}
          category={historyCat}
          onCategory={setHistoryCat}
          partnerName={partnerName}
        />
      )}
    </div>
  );
}

function History({ history, category, onCategory, partnerName }: { history: DailyHistoryPayload | null; category: QuestionCategoryValue | "ALL"; onCategory: (c: QuestionCategoryValue | "ALL") => void; partnerName: string }) {
  const historyPaged = usePagination(history?.items ?? [], category);
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by category">
        <Chip active={category === "ALL"} onClick={() => onCategory("ALL")}>All</Chip>
        {QUESTION_CATEGORIES.map((c) => (
          <Chip key={c} active={category === c} onClick={() => onCategory(c)}>{QUESTION_CATEGORY_LABEL[c]}</Chip>
        ))}
      </div>

      {!history ? (
        <p className="text-ld-caption text-ld-on-surface-variant">Opening your memories…</p>
      ) : history.items.length === 0 ? (
        <div role="status" className="rounded-3xl border border-dashed border-ld-outline-variant px-6 py-14 text-center">
          <p className="font-display text-ld-headline-md text-ld-on-surface">Your story of answers starts tomorrow.</p>
          <p className="mt-2 text-ld-body-sm text-ld-on-surface-variant">Each day you answer, it is kept here for you both.</p>
        </div>
      ) : (
        <>
        <ol className="space-y-5">
          {historyPaged.pageItems.map((item) => (
            <li key={item.day} className="rounded-3xl bg-ld-surface-container-lowest p-6 shadow-sm">
              <p className="text-ld-caption text-ld-on-surface-variant">
                {new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" }).format(new Date(`${item.day}T12:00:00Z`))}
                <span aria-hidden="true"> · </span>
                {QUESTION_CATEGORY_LABEL[item.question.category]}
              </p>
              <h3 className="mt-2 font-display text-ld-title-lg text-ld-on-surface">&ldquo;{item.question.text}&rdquo;</h3>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl bg-ld-secondary-container/30 p-4">
                  <p className="text-ld-label-sm font-semibold text-ld-on-surface">You</p>
                  <p className="mt-1 whitespace-pre-wrap text-ld-body-sm text-ld-on-surface">{item.mine ?? "No answer"}</p>
                </div>
                <div className="rounded-2xl bg-ld-tertiary-fixed/30 p-4">
                  <p className="text-ld-label-sm font-semibold text-ld-on-surface">{partnerName}</p>
                  <p className="mt-1 whitespace-pre-wrap text-ld-body-sm text-ld-on-surface">
                    {item.partner.answered ? item.partner.body : "No answer"}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ol>
        <Pagination
          page={historyPaged.page}
          totalPages={historyPaged.totalPages}
          total={historyPaged.total}
          pageSize={historyPaged.pageSize}
          start={historyPaged.start}
          setPage={historyPaged.setPage}
          label="History pages"
        />
        </>
      )}
    </div>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" aria-pressed={active} onClick={onClick} className={cn("rounded-full px-3 py-1.5 text-ld-caption transition-colors", active ? "bg-ld-on-surface text-ld-surface" : "bg-ld-surface-container text-ld-on-surface-variant hover:bg-ld-surface-container-high")}>
      {children}
    </button>
  );
}
