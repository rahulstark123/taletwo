"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarClock, Inbox, Lock, Mail, MailOpen, NotebookPen, Pencil, Plus, Send, Sparkles } from "lucide-react";
import { apiCall } from "@/components/onboarding/api-client";
import { LetterPaper, PAPER_STYLES, WaxSeal } from "@/components/letters/letter-paper";
import { WriteLetterModal, type LetterDraftInput } from "@/components/letters/write-letter-modal";
import { Pagination, usePagination } from "@/components/shared/pagination";
import type { LetterDTO, LetterKind, LettersPayload } from "@/lib/letters-types";
import { cn } from "@/lib/utils";

type Tab = LetterKind;

const TABS: { key: Tab; label: string; icon: typeof Inbox; hint: string }[] = [
  { key: "received", label: "Inbox", icon: Inbox, hint: "Letters from your partner" },
  { key: "sent", label: "Sent", icon: Send, hint: "Letters you have sent" },
  { key: "scheduled", label: "Scheduled", icon: CalendarClock, hint: "Waiting for their day" },
  { key: "draft", label: "Drafts", icon: Pencil, hint: "Private until you send them" },
];

const dateFmt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric" });
const shortFmt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short" });

/** "Opens in 12 days", "Opens tomorrow", "Opens today" */
function countdown(opensAt: string, now: number) {
  const diff = new Date(opensAt).getTime() - now;
  if (diff <= 0) return "Ready to open";
  const days = Math.ceil(diff / 86_400_000);
  if (days === 1) return "Opens tomorrow";
  return `Opens in ${days} days`;
}

/** Still sealed for the current time. The server never sends a partner's sealed text, so this is only for display. */
function isSealed(letter: LetterDTO, now: number) {
  return letter.opensAt !== null && new Date(letter.opensAt).getTime() > now;
}

/** Hidden from the viewer: a partner's letter that has not opened yet. Your own scheduled letters stay readable to you. */
function isHidden(letter: LetterDTO, now: number) {
  return !letter.isMine && isSealed(letter, now);
}

export function LettersBoard({ initial }: { initial: LettersPayload }) {
  const { partnerName, canSchedule, monthlyLimit } = initial;
  const [letters, setLetters] = useState<LetterDTO[]>(initial.letters);
  const [sentThisMonth, setSentThisMonth] = useState(initial.sentThisMonth);
  const [tab, setTab] = useState<Tab>("received");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [opening, setOpening] = useState<string | null>(null);
  const [writing, setWriting] = useState<{ open: boolean; draft: LetterDTO | null }>({ open: false, draft: null });
  const [notice, setNotice] = useState<string | null>(null);
  const [writeSeq, setWriteSeq] = useState(0);
  const [now, setNow] = useState(0);

  useEffect(() => {
    const first = setTimeout(() => setNow(Date.now()), 0);
    const timer = setInterval(() => setNow(Date.now()), 60_000);
    return () => {
      clearTimeout(first);
      clearInterval(timer);
    };
  }, []);

  const listFor = useMemo(() => {
    return (key: Tab) => letters.filter((l) => l.kind === key).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [letters]);

  const visible = listFor(tab);
  const paged = usePagination(visible, tab);
  const selected = letters.find((l) => l.id === selectedId) ?? visible[0] ?? null;
  const unread = letters.filter((l) => l.kind === "received" && !l.read).length;
  const lettersLeft = monthlyLimit === null ? null : Math.max(0, monthlyLimit - sentThisMonth);

  function openWriter(draft: LetterDTO | null) {
    setWriteSeq((s) => s + 1);
    setWriting({ open: true, draft });
  }

  function pick(letter: LetterDTO) {
    setSelectedId(letter.id);
    if (letter.kind === "received" && !letter.read && !isSealed(letter, now)) {
      // Opening animation: the seal breaks, then the server marks the letter as read and returns it.
      setOpening(letter.id);
      setTimeout(async () => {
        const res = await apiCall<{ letter: LetterDTO }>(`/api/letters/${letter.id}/read`, { method: "POST" });
        if (res.ok) setLetters((prev) => prev.map((l) => (l.id === letter.id ? res.data.letter : l)));
        setOpening(null);
      }, 900);
    }
  }

  async function saveLetter(input: LetterDraftInput): Promise<string | null> {
    const editingId = writing.draft?.id ?? null;
    const res = editingId
      ? await apiCall<{ letter: LetterDTO }>(`/api/letters/${editingId}`, { method: "PATCH", body: input })
      : await apiCall<{ letter: LetterDTO }>("/api/letters", { method: "POST", body: input });
    if (!res.ok) return res.error.message;

    const saved = res.data.letter;
    setLetters((prev) => [saved, ...prev.filter((l) => l.id !== saved.id)]);
    if (!editingId && input.delivery !== "draft") setSentThisMonth((n) => n + 1);
    setTab(saved.kind);
    setSelectedId(saved.id);
    setWriting({ open: false, draft: null });
    setNotice(
      input.delivery === "draft"
        ? "Draft kept. It stays private to you."
        : input.delivery === "schedule"
          ? "Letter scheduled. It will stay sealed until its day."
          : "Letter sent with love."
    );
    setTimeout(() => setNotice(null), 4000);
    return null;
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-xl space-y-1">
          <p className="text-ld-body-md text-ld-on-surface-variant">
            Write it now, or seal it for later. Some letters wait for the right moment.
          </p>
          {lettersLeft !== null && (
            <p className="text-ld-caption text-ld-on-surface-variant">
              {lettersLeft} of {monthlyLimit} letters left this month on your plan.
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={() => openWriter(null)}
          className="hidden h-12 items-center gap-2 rounded-full bg-ld-primary px-6 text-ld-label-md text-ld-on-primary shadow-[0_8px_20px_rgba(201,126,139,0.28)] transition-colors hover:bg-ld-on-primary-fixed-variant lg:inline-flex"
        >
          <Plus className="size-5" aria-hidden="true" />
          Write a letter
        </button>
      </header>

      {notice && (
        <p role="status" className="inline-flex items-center gap-2 rounded-full bg-ld-tertiary-fixed/50 px-4 py-2 text-ld-caption text-ld-on-tertiary-fixed-variant animate-in fade-in duration-300">
          <Sparkles className="size-4" aria-hidden="true" />
          {notice}
        </p>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)]">
        {/* Mailbox */}
        <section aria-label="Letters" className="flex flex-col gap-4 rounded-3xl bg-ld-surface-container-lowest p-4 shadow-sm">
          <div role="tablist" aria-label="Letter folders" className="grid grid-cols-4 gap-1 rounded-2xl bg-ld-surface-container p-1">
            {TABS.map((t) => {
              const active = tab === t.key;
              const count = listFor(t.key).length;
              return (
                <button
                  key={t.key}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  aria-label={`${t.label}, ${count} letters${t.key === "received" && unread ? `, ${unread} unread` : ""}`}
                  title={t.hint}
                  onClick={() => {
                    setTab(t.key);
                    setSelectedId(null);
                  }}
                  className={cn(
                    "relative flex flex-col items-center gap-0.5 rounded-xl py-2 text-[11px] font-medium transition-colors",
                    active ? "bg-ld-surface-container-lowest text-ld-on-surface shadow-sm" : "text-ld-on-surface-variant hover:text-ld-on-surface"
                  )}
                >
                  <t.icon className="size-4" aria-hidden="true" />
                  {t.label}
                  {t.key === "received" && unread > 0 && (
                    <span className="absolute right-1.5 top-1 size-2 rounded-full bg-ld-primary" aria-hidden="true" />
                  )}
                </button>
              );
            })}
          </div>

          {visible.length === 0 ? (
            <EmptyFolder tab={tab} onWrite={() => openWriter(null)} />
          ) : (
            <>
              <ul className="flex flex-col gap-2" aria-label={TABS.find((t) => t.key === tab)?.label}>
                {paged.pageItems.map((letter) => {
                  const hidden = isHidden(letter, now);
                  const active = selected?.id === letter.id;
                  const unreadItem = letter.kind === "received" && !letter.read;
                  return (
                    <li key={letter.id}>
                      <button
                        type="button"
                        onClick={() => pick(letter)}
                        aria-current={active ? "true" : undefined}
                        className={cn(
                          "group flex w-full items-center gap-3 rounded-2xl p-3 text-left transition-all",
                          active ? "bg-ld-secondary-container/50 shadow-sm" : "hover:bg-ld-surface-container-low"
                        )}
                      >
                        <span className={cn("flex size-11 shrink-0 items-center justify-center rounded-xl", PAPER_STYLES[letter.paper].sheet, "ring-1 ring-ld-on-surface/10")}>
                          {hidden ? (
                            <Lock className="size-4 text-ld-on-surface-variant" aria-hidden="true" />
                          ) : unreadItem ? (
                            <Mail className="size-4 text-ld-primary" aria-hidden="true" />
                          ) : (
                            <MailOpen className="size-4 text-ld-on-surface-variant" aria-hidden="true" />
                          )}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className={cn("block truncate text-ld-body-sm text-ld-on-surface", unreadItem ? "font-semibold" : "font-medium")}>
                            {hidden ? "A sealed letter" : letter.title || "Untitled letter"}
                          </span>
                          <span className="block truncate text-ld-caption text-ld-on-surface-variant">
                            {letter.kind === "received" ? `From ${letter.from}` : letter.kind === "draft" ? "Draft" : `To ${letter.to}`}
                            {letter.kind === "draft"
                              ? ` · ${shortFmt.format(new Date(letter.createdAt))}`
                              : letter.opensAt
                                ? ` · ${isSealed(letter, now) ? countdown(letter.opensAt, now) : "Ready to open"}`
                                : ` · ${shortFmt.format(new Date(letter.createdAt))}`}
                          </span>
                        </span>
                        {unreadItem && <span className="size-2 shrink-0 rounded-full bg-ld-primary" aria-label="Unread" />}
                      </button>
                    </li>
                  );
                })}
              </ul>
              <Pagination
                page={paged.page}
                totalPages={paged.totalPages}
                total={paged.total}
                pageSize={paged.pageSize}
                start={paged.start}
                setPage={paged.setPage}
                label="Letters pages"
              />
            </>
          )}
        </section>

        {/* Reading pane */}
        <section aria-live="polite" className="min-h-[28rem] rounded-3xl bg-ld-surface-container p-4 sm:p-8">
          {selected ? (
            <Reader
              letter={selected}
              now={now}
              opening={opening === selected.id}
              onEdit={() => openWriter(selected)}
            />
          ) : (
            <div className="flex h-full min-h-[24rem] flex-col items-center justify-center gap-3 text-center">
              <NotebookPen className="size-8 text-ld-primary" aria-hidden="true" />
              <p className="font-display text-ld-headline-md text-ld-on-surface">Pick a letter to read.</p>
              <p className="text-ld-body-sm text-ld-on-surface-variant">Sealed letters open on their day.</p>
            </div>
          )}
        </section>
      </div>

      {/* Mobile floating button */}
      <button
        type="button"
        onClick={() => openWriter(null)}
        aria-label="Write a letter"
        className="fixed bottom-24 right-5 z-40 inline-flex size-14 items-center justify-center rounded-full bg-ld-primary text-ld-on-primary shadow-[0_12px_30px_-8px_rgba(201,126,139,0.7)] transition-transform active:scale-95 lg:hidden"
      >
        <Plus className="size-6" aria-hidden="true" />
      </button>

      <WriteLetterModal
        key={writeSeq}
        initial={writing.draft}
        open={writing.open}
        partnerName={partnerName}
        canSchedule={canSchedule}
        onClose={() => setWriting({ open: false, draft: null })}
        onSave={saveLetter}
      />
    </div>
  );
}

function Reader({ letter, now, opening, onEdit }: { letter: LetterDTO; now: number; opening: boolean; onEdit: () => void }) {
  const hidden = isHidden(letter, now);
  const editable = letter.kind === "draft" || letter.kind === "scheduled";

  if (hidden) {
    return (
      <div className="flex flex-col items-center gap-6 py-10 text-center">
        <div className="paper-ink relative w-full max-w-md rounded-[10px] bg-[#f6e9dd] p-8 shadow-[0_20px_50px_-24px_rgba(64,56,50,0.5)]">
          <div className="absolute inset-x-0 top-0 h-1/2 origin-top rounded-t-[10px] bg-[#efdccb]" style={{ clipPath: "polygon(0 0, 100% 0, 50% 100%)" }} />
          <div className="relative flex flex-col items-center gap-4 pt-6">
            <WaxSeal paper={letter.paper} locked />
            <p className="font-display text-ld-headline-md text-ld-on-surface">{letter.occasion}</p>
            <p className="text-ld-body-sm text-ld-on-surface-variant">From {letter.from}, sealed until</p>
            <p className="font-display text-ld-title-lg text-ld-primary">{dateFmt.format(new Date(letter.opensAt!))}</p>
            <p className="rounded-full bg-ld-surface px-4 py-1.5 text-ld-caption text-ld-on-surface-variant">{countdown(letter.opensAt!, now)}</p>
          </div>
        </div>
        <p className="max-w-sm text-ld-caption text-ld-on-surface-variant">
          Sealed letters stay closed until their day, even if you are curious. The surprise is part of it.
        </p>
      </div>
    );
  }

  const dateLabel = dateFmt.format(new Date(letter.createdAt));
  const caption =
    letter.kind === "received"
      ? `From ${letter.from}`
      : letter.kind === "draft"
        ? "Draft · only you can see this"
        : letter.kind === "scheduled"
          ? `Scheduled for ${dateFmt.format(new Date(letter.opensAt!))} · to ${letter.to}`
          : `To ${letter.to}`;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-ld-caption text-ld-on-surface-variant">{caption}</p>
        {editable && (
          <button
            type="button"
            onClick={onEdit}
            className="inline-flex h-9 items-center gap-2 rounded-full bg-ld-surface-container-lowest px-4 text-ld-label-sm text-ld-on-surface shadow-sm hover:bg-ld-surface-container-high"
          >
            <Pencil className="size-3.5" aria-hidden="true" />
            {letter.kind === "draft" ? "Continue writing" : "Edit letter"}
          </button>
        )}
      </div>

      {opening ? (
        <div className="flex flex-col items-center gap-4 py-16">
          <WaxSeal paper={letter.paper} className="animate-[pulse_0.9s_ease-in-out]" />
          <p className="text-ld-caption text-ld-on-surface-variant">Opening your letter…</p>
        </div>
      ) : (
        <LetterPaper
          body={letter.body}
          title={letter.title}
          from={letter.from}
          dateLabel={dateLabel}
          paper={letter.paper}
          occasion={letter.occasion}
          className="animate-in fade-in slide-in-from-bottom-2 duration-500"
        />
      )}
    </div>
  );
}

function EmptyFolder({ tab, onWrite }: { tab: Tab; onWrite: () => void }) {
  const copy: Record<Tab, { title: string; body: string }> = {
    received: { title: "No letters yet", body: "When your partner writes to you, it will arrive here." },
    sent: { title: "Nothing sent yet", body: "Your sent letters will rest here, safe and close." },
    scheduled: { title: "Nothing scheduled", body: "Schedule a letter for a birthday or an anniversary." },
    draft: { title: "No drafts", body: "Half-written thoughts can wait here until they are ready." },
  };
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-ld-outline-variant px-5 py-10 text-center">
      <p className="font-display text-ld-title-lg text-ld-on-surface">{copy[tab].title}</p>
      <p className="text-ld-caption text-ld-on-surface-variant">{copy[tab].body}</p>
      <button type="button" onClick={onWrite} className="mt-2 inline-flex h-9 items-center gap-2 rounded-full bg-ld-primary px-4 text-ld-label-sm text-ld-on-primary">
        <Plus className="size-4" aria-hidden="true" />
        Write one
      </button>
    </div>
  );
}
