"use client";

import { useState } from "react";
import { CheckCircle2, Lightbulb, LifeBuoy, Send, Ticket } from "lucide-react";
import { apiCall } from "@/components/onboarding/api-client";
import { Pagination, usePagination } from "@/components/shared/pagination";
import { SelectChevron, selectClass } from "@/components/auth/form-field";
import {
  SUPPORT_CATEGORY_LABEL,
  SUPPORT_MESSAGE_MAX,
  SUPPORT_STATUS_LABEL,
  SUPPORT_SUBJECT_MAX,
  type SupportCategoryValue,
  type SupportPriorityValue,
  type SupportRequestDTO,
  type SupportTypeValue,
} from "@/lib/support-types";

const PRIORITY_LABEL: Record<SupportPriorityValue, string> = { LOW: "Low", NORMAL: "Normal", HIGH: "Urgent" };

const TAB_COPY: Record<SupportTypeValue, { heading: string; hint: string; submit: string; subjectHint: string; categories: SupportCategoryValue[] }> = {
  TICKET: {
    heading: "Raise a ticket",
    hint: "Something not working, or a question about your account? Tell us what happened and what you expected.",
    submit: "Send ticket",
    subjectHint: "For example: Photos do not upload on my phone",
    categories: ["BUG", "ACCOUNT", "PRIVACY", "OTHER"],
  },
  SUGGESTION: {
    heading: "Suggest an improvement",
    hint: "An idea that would make TaleTwo better for you as a couple? Share it, even if it is small.",
    submit: "Send suggestion",
    subjectHint: "For example: Let us pin a favourite memory to the top",
    categories: ["FEATURE", "DESIGN", "OTHER"],
  },
};

const inputClass =
  "w-full rounded-xl border border-ld-outline-variant bg-ld-surface px-4 py-2.5 text-ld-body-md text-ld-on-surface placeholder:text-ld-on-surface-variant/70 focus:border-ld-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-ld-primary/30";

function formatWhen(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
}

export function SupportBoard({ initial }: { initial: SupportRequestDTO[] }) {
  const [tab, setTab] = useState<SupportTypeValue>("TICKET");
  const [requests, setRequests] = useState<SupportRequestDTO[]>(initial);
  const paged = usePagination(requests, "");
  const [category, setCategory] = useState<SupportCategoryValue>("BUG");
  const [priority, setPriority] = useState<SupportPriorityValue>("NORMAL");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const copy = TAB_COPY[tab];
  const categoryValue = copy.categories.includes(category) ? category : copy.categories[0];

  function switchTab(next: SupportTypeValue) {
    setTab(next);
    setCategory(TAB_COPY[next].categories[0]);
    setError(null);
    setSuccess(null);
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return;
    setError(null);
    setSuccess(null);
    setSubmitting(true);
    const res = await apiCall<{ request: SupportRequestDTO }>("/api/support", {
      method: "POST",
      body: {
        type: tab,
        category: categoryValue,
        priority: tab === "TICKET" ? priority : "NORMAL",
        subject,
        message,
      },
    });
    setSubmitting(false);
    if (!res.ok) {
      setError(res.error.message);
      return;
    }
    setRequests((prev) => [res.data.request, ...prev]);
    setSubject("");
    setMessage("");
    setPriority("NORMAL");
    setSuccess(tab === "TICKET" ? "Thanks. Your ticket is with us and you can track it below." : "Thanks for the idea. We read every suggestion.");
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
      <section className="space-y-5 rounded-3xl bg-ld-surface-container-lowest p-6 shadow-sm sm:p-8">
        <div role="tablist" aria-label="What would you like to send?" className="grid grid-cols-2 gap-1 rounded-full bg-ld-surface-container p-1">
          {(["TICKET", "SUGGESTION"] as const).map((t) => {
            const active = tab === t;
            const Icon = t === "TICKET" ? Ticket : Lightbulb;
            return (
              <button
                key={t}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => switchTab(t)}
                className={`inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-ld-label-sm transition-colors ${active ? "bg-ld-surface-container-lowest text-ld-on-surface shadow-sm" : "text-ld-on-surface-variant hover:text-ld-on-surface"}`}
              >
                <Icon className="size-4" aria-hidden="true" />
                {t === "TICKET" ? "Raise a ticket" : "Suggest an improvement"}
              </button>
            );
          })}
        </div>

        <div className="space-y-1">
          <h2 className="font-display text-ld-title-lg text-ld-on-surface">{copy.heading}</h2>
          <p className="text-ld-body-sm text-ld-on-surface-variant">{copy.hint}</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block space-y-1.5">
              <span className="text-ld-label-sm text-ld-on-surface-variant">Category</span>
              <div className="relative">
                <select value={categoryValue} onChange={(e) => setCategory(e.target.value as SupportCategoryValue)} className={selectClass}>
                  {copy.categories.map((c) => (
                    <option key={c} value={c}>
                      {SUPPORT_CATEGORY_LABEL[c]}
                    </option>
                  ))}
                </select>
                <SelectChevron />
              </div>
            </label>

            {tab === "TICKET" && (
              <fieldset className="space-y-1.5">
                <legend className="text-ld-label-sm text-ld-on-surface-variant">How urgent is it?</legend>
                <div className="flex gap-2">
                  {(["LOW", "NORMAL", "HIGH"] as const).map((p) => (
                    <label key={p} className={`flex-1 cursor-pointer rounded-xl border px-3 py-2.5 text-center text-ld-label-sm transition-colors ${priority === p ? "border-ld-primary bg-ld-surface-container text-ld-primary" : "border-ld-outline-variant text-ld-on-surface-variant hover:border-ld-primary/60"}`}>
                      <input type="radio" name="priority" value={p} checked={priority === p} onChange={() => setPriority(p)} className="sr-only" />
                      {PRIORITY_LABEL[p]}
                    </label>
                  ))}
                </div>
              </fieldset>
            )}
          </div>

          <label className="block space-y-1.5">
            <span className="flex items-center justify-between text-ld-label-sm text-ld-on-surface-variant">
              <span>Subject</span>
              <span className="text-ld-caption">{subject.length}/{SUPPORT_SUBJECT_MAX}</span>
            </span>
            <input value={subject} onChange={(e) => setSubject(e.target.value)} maxLength={SUPPORT_SUBJECT_MAX} placeholder={copy.subjectHint} className={inputClass} />
          </label>

          <label className="block space-y-1.5">
            <span className="flex items-center justify-between text-ld-label-sm text-ld-on-surface-variant">
              <span>{tab === "TICKET" ? "What happened?" : "Your idea"}</span>
              <span className="text-ld-caption">{message.length}/{SUPPORT_MESSAGE_MAX}</span>
            </span>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={SUPPORT_MESSAGE_MAX}
              rows={6}
              placeholder={tab === "TICKET" ? "Steps you took, what you expected, and what happened instead." : "What would you like, and how would it help the two of you?"}
              className={`${inputClass} resize-y`}
            />
          </label>

          {error && (
            <p role="alert" className="rounded-xl bg-ld-error-container px-4 py-3 text-ld-body-sm text-ld-on-error-container">
              {error}
            </p>
          )}
          {success && (
            <p role="status" className="flex items-center gap-2 rounded-xl bg-ld-tertiary-fixed/60 px-4 py-3 text-ld-body-sm text-ld-on-tertiary-fixed-variant">
              <CheckCircle2 className="size-4 shrink-0" aria-hidden="true" />
              {success}
            </p>
          )}

          <div className="flex items-center justify-between gap-3 pt-1">
            <p className="text-ld-caption text-ld-on-surface-variant">Please do not share passwords or card details here.</p>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex h-11 shrink-0 items-center gap-2 rounded-xl bg-ld-primary px-5 text-ld-label-sm text-ld-on-primary transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              <Send className="size-4" aria-hidden="true" />
              {submitting ? "Sending..." : copy.submit}
            </button>
          </div>
        </form>
      </section>

      <section aria-labelledby="my-requests" className="space-y-4">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-2xl bg-ld-surface-container text-ld-primary">
            <LifeBuoy className="size-5" aria-hidden="true" />
          </span>
          <div>
            <h2 id="my-requests" className="font-display text-ld-title-lg text-ld-on-surface">Your requests</h2>
            <p className="text-ld-body-sm text-ld-on-surface-variant">Only you can see these.</p>
          </div>
        </div>

        {requests.length === 0 ? (
          <div className="rounded-3xl bg-ld-surface-container-lowest p-8 text-center shadow-sm">
            <p className="text-ld-body-sm text-ld-on-surface-variant">Nothing sent yet. Tickets and suggestions you send will appear here.</p>
          </div>
        ) : (
          <>
          <ul className="space-y-3">
            {paged.pageItems.map((r) => (
              <li key={r.id} className="rounded-2xl bg-ld-surface-container-lowest p-5 shadow-sm">
                <div className="flex flex-wrap items-center gap-2 text-ld-caption text-ld-on-surface-variant">
                  <span className="rounded-full bg-ld-surface-container px-2.5 py-0.5 font-medium">{r.type === "TICKET" ? "Ticket" : "Suggestion"}</span>
                  <span>{SUPPORT_CATEGORY_LABEL[r.category]}</span>
                  <span aria-hidden="true">·</span>
                  <span>{formatWhen(r.createdAt)}</span>
                  <span className="ml-auto rounded-full bg-ld-tertiary-fixed/60 px-2.5 py-0.5 font-medium text-ld-on-tertiary-fixed-variant">
                    {SUPPORT_STATUS_LABEL[r.status]}
                  </span>
                </div>
                <h3 className="mt-2 text-ld-title-lg text-ld-on-surface">{r.subject}</h3>
                <p className="mt-1 line-clamp-3 whitespace-pre-line text-ld-body-sm text-ld-on-surface-variant">{r.message}</p>
              </li>
            ))}
          </ul>
          <Pagination
            page={paged.page}
            totalPages={paged.totalPages}
            total={paged.total}
            pageSize={paged.pageSize}
            start={paged.start}
            setPage={paged.setPage}
            label="Request pages"
          />
          </>
        )}
      </section>
    </div>
  );
}
