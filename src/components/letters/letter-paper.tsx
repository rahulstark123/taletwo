import { Heart, LockKeyhole } from "lucide-react";
import type { LetterPaperStyle as PaperStyle } from "@/lib/letters-types";
import { cn } from "@/lib/utils";

/** Paper colour and tone for each style. Kept soft so text stays readable. */
export const PAPER_STYLES: Record<PaperStyle, { label: string; sheet: string; line: string; seal: string; swatch: string }> = {
  CREAM: {
    label: "Cream",
    sheet: "bg-[#fffaf3]",
    line: "rgba(201,126,139,0.14)",
    seal: "bg-ld-primary text-ld-on-primary",
    swatch: "bg-[#f1dfc0]",
  },
  ROSE: {
    label: "Rose",
    sheet: "bg-[#fdeef0]",
    line: "rgba(140,75,87,0.12)",
    seal: "bg-ld-primary text-ld-on-primary",
    swatch: "bg-[#efb4bf]",
  },
  SAGE: {
    label: "Sage",
    sheet: "bg-[#eef4ee]",
    line: "rgba(76,100,82,0.13)",
    seal: "bg-ld-tertiary text-ld-on-tertiary",
    swatch: "bg-[#b3d9b8]",
  },
  LAVENDER: {
    label: "Lavender",
    sheet: "bg-[#f1ecf7]",
    line: "rgba(111,85,140,0.12)",
    seal: "bg-[#6f558c] text-white",
    swatch: "bg-[#c6b3e6]",
  },
};

interface LetterPaperProps {
  body: string;
  title: string;
  from: string;
  dateLabel: string;
  paper: PaperStyle;
  occasion?: string;
  placeholder?: string;
  className?: string;
}

/** A sheet of letter paper: ruled lines, a folded corner, a soft shadow and a signature. */
export function LetterPaper({ body, title, from, dateLabel, paper, occasion, placeholder, className }: LetterPaperProps) {
  const style = PAPER_STYLES[paper];
  return (
    <article
      className={cn(
        "relative mx-auto w-full max-w-2xl overflow-hidden rounded-[6px] px-7 pb-12 pt-10 shadow-[0_24px_60px_-28px_rgba(64,56,50,0.45)] sm:px-12 sm:pt-14",
        style.sheet,
        "paper-ink",
        className
      )}
    >
      {/* Folded corner */}
      <span
        aria-hidden="true"
        className="absolute right-0 top-0 size-10 bg-gradient-to-bl from-black/10 via-black/5 to-transparent"
        style={{ clipPath: "polygon(0 0, 100% 100%, 0 100%)" }}
      />
      {/* Ruled lines */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 top-24"
        style={{
          backgroundImage: `repeating-linear-gradient(to bottom, transparent 0, transparent 2.1rem, ${style.line} 2.1rem, ${style.line} calc(2.1rem + 1px))`,
        }}
      />

      <header className="relative space-y-1 border-b border-ld-on-surface/10 pb-4">
        {occasion && <p className="text-ld-label-sm font-semibold uppercase tracking-[0.18em] text-ld-primary">{occasion}</p>}
        {title && <h2 className="font-display text-[1.6rem] leading-snug text-ld-on-surface sm:text-[1.9rem]">{title}</h2>}
        <p className="font-display text-ld-body-sm italic text-ld-on-surface-variant">{dateLabel}</p>
      </header>

      <div className="relative mt-6 min-h-[12rem]">
        {body ? (
          <p className="whitespace-pre-wrap font-display text-[1.08rem] leading-[2.1rem] text-ld-on-surface sm:text-[1.15rem]">{body}</p>
        ) : (
          <p className="font-display text-[1.08rem] italic leading-[2.1rem] text-ld-outline">{placeholder ?? "Your words will appear here…"}</p>
        )}
      </div>

      <footer className="relative mt-10 flex items-end justify-between gap-6">
        <p className="font-display text-[1.1rem] italic text-ld-on-surface">
          With love,
          <br />
          <span className="not-italic">{from}</span>
        </p>
        <Heart className="size-5 fill-ld-primary/70 text-ld-primary/70" aria-hidden="true" />
      </footer>
    </article>
  );
}

/** Wax seal used on envelopes and sealed letters. */
export function WaxSeal({ paper, locked = false, className }: { paper: PaperStyle; locked?: boolean; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-flex size-12 items-center justify-center rounded-full shadow-[inset_0_-3px_6px_rgba(0,0,0,0.25),0_6px_14px_-4px_rgba(0,0,0,0.35)]",
        PAPER_STYLES[paper].seal,
        className
      )}
    >
      {locked ? <LockKeyhole className="size-5" /> : <Heart className="size-5 fill-current" />}
    </span>
  );
}
