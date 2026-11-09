import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";

/** Common frame for every game: a way back, a title, and a calm card for the play area. */
export function GameShell({ title, subtitle, score, children }: { title: string; subtitle: string; score?: string; children: ReactNode }) {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link href="/app/games" className="inline-flex items-center gap-2 text-ld-label-sm text-ld-on-surface-variant hover:text-ld-on-surface">
        <ArrowLeft className="size-4" aria-hidden="true" />
        All games
      </Link>
      <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-ld-headline-lg-mobile text-ld-on-surface md:text-ld-headline-lg">{title}</h1>
          <p className="text-ld-body-sm text-ld-on-surface-variant">{subtitle}</p>
        </div>
        {score && <span className="w-fit rounded-full bg-ld-secondary-container/50 px-4 py-1.5 text-ld-label-sm font-semibold text-ld-on-surface">{score}</span>}
      </header>
      <section className="rounded-3xl bg-ld-surface-container-lowest p-6 shadow-sm sm:p-8">{children}</section>
    </div>
  );
}

/** Large, friendly button used across the games. */
export function PlayButton({ onClick, children, variant = "primary", disabled }: { onClick?: () => void; children: ReactNode; variant?: "primary" | "quiet"; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={
        variant === "primary"
          ? "inline-flex h-12 items-center justify-center gap-2 rounded-full bg-ld-primary px-6 text-ld-label-md text-ld-on-primary shadow-[0_8px_20px_rgba(201,126,139,0.28)] transition-colors hover:bg-ld-on-primary-fixed-variant disabled:opacity-50"
          : "inline-flex h-11 items-center justify-center gap-2 rounded-full bg-ld-surface-container px-5 text-ld-label-md text-ld-on-surface transition-colors hover:bg-ld-surface-container-high disabled:opacity-50"
      }
    >
      {children}
    </button>
  );
}
