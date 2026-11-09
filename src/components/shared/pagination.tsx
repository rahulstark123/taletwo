"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

/** How many items a list shows on one page. */
export const PAGE_SIZE = 10;

/**
 * Pages through a list 10 at a time. Going back to page 1 happens automatically when the filter
 * changes: pass a `resetKey` that changes with the filters (for example a joined string of them).
 */
export function usePagination<T>(items: T[], resetKey = "", pageSize = PAGE_SIZE) {
  const [state, setState] = useState<{ key: string; page: number }>({ key: resetKey, page: 1 });
  const requested = state.key === resetKey ? state.page : 1;
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const page = Math.min(requested, totalPages);
  const start = (page - 1) * pageSize;

  return {
    pageItems: items.slice(start, start + pageSize),
    page,
    totalPages,
    total: items.length,
    pageSize,
    start,
    setPage: (next: number) => setState({ key: resetKey, page: Math.min(Math.max(1, next), totalPages) }),
  };
}

/** Previous, next and a "showing x–y of z" line. Renders nothing when everything fits on one page. */
export function Pagination({
  page,
  totalPages,
  total,
  pageSize,
  start,
  setPage,
  label = "Pages",
}: {
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
  start: number;
  setPage: (page: number) => void;
  label?: string;
}) {
  if (total <= pageSize) return null;
  const from = start + 1;
  const to = Math.min(start + pageSize, total);

  return (
    <nav aria-label={label} className="flex flex-col items-center justify-between gap-3 pt-2 sm:flex-row">
      <p className="text-ld-caption text-ld-on-surface-variant">
        Showing {from}–{to} of {total}
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setPage(page - 1)}
          disabled={page <= 1}
          className="inline-flex h-10 items-center gap-1 rounded-full bg-ld-surface-container-lowest px-4 text-ld-label-sm text-ld-on-surface ring-1 ring-ld-outline-variant/50 transition-colors hover:bg-ld-surface disabled:opacity-40"
        >
          <ChevronLeft className="size-4" aria-hidden="true" />
          Previous
        </button>
        <span className="min-w-[88px] text-center text-ld-label-sm text-ld-on-surface-variant" aria-live="polite">
          Page {page} of {totalPages}
        </span>
        <button
          type="button"
          onClick={() => setPage(page + 1)}
          disabled={page >= totalPages}
          className="inline-flex h-10 items-center gap-1 rounded-full bg-ld-surface-container-lowest px-4 text-ld-label-sm text-ld-on-surface ring-1 ring-ld-outline-variant/50 transition-colors hover:bg-ld-surface disabled:opacity-40"
        >
          Next
          <ChevronRight className="size-4" aria-hidden="true" />
        </button>
      </div>
    </nav>
  );
}
