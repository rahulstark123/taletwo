import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

/** Previous and next links for the games list. Keeps the chosen style in the address. */
export function GamesPager({ style, page, totalPages, total, from, to }: { style: string; page: number; totalPages: number; total: number; from: number; to: number }) {
  if (total <= 10) return null;
  const href = (p: number) => `/app/games?${new URLSearchParams({ ...(style !== "all" ? { style } : {}), page: String(p) }).toString()}`;
  const btn = "inline-flex h-10 items-center gap-1 rounded-full bg-ld-surface-container-lowest px-4 text-ld-label-sm text-ld-on-surface ring-1 ring-ld-outline-variant/50 transition-colors hover:bg-ld-surface";
  return (
    <nav aria-label="Games pages" className="flex flex-col items-center justify-between gap-3 sm:flex-row">
      <p className="text-ld-caption text-ld-on-surface-variant">
        Showing {from}–{to} of {total}
      </p>
      <div className="flex items-center gap-2">
        {page > 1 ? (
          <Link href={href(page - 1)} className={btn} rel="prev">
            <ChevronLeft className="size-4" aria-hidden="true" />
            Previous
          </Link>
        ) : (
          <span className={`${btn} opacity-40`} aria-disabled="true">
            <ChevronLeft className="size-4" aria-hidden="true" />
            Previous
          </span>
        )}
        <span className="min-w-[88px] text-center text-ld-label-sm text-ld-on-surface-variant">Page {page} of {totalPages}</span>
        {page < totalPages ? (
          <Link href={href(page + 1)} className={btn} rel="next">
            Next
            <ChevronRight className="size-4" aria-hidden="true" />
          </Link>
        ) : (
          <span className={`${btn} opacity-40`} aria-disabled="true">
            Next
            <ChevronRight className="size-4" aria-hidden="true" />
          </span>
        )}
      </div>
    </nav>
  );
}
