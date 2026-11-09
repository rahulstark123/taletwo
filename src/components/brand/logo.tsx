import Link from "next/link";
import { cn } from "@/lib/utils";

/** Two overlapping circles: two people, one shared space. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 32"
      aria-hidden="true"
      focusable="false"
      className={cn("h-6 w-9 shrink-0", className)}
    >
      <circle cx="16" cy="16" r="12" fill="none" stroke="var(--tt-primary)" strokeWidth="3" />
      <circle cx="32" cy="16" r="12" fill="var(--tt-accent)" fillOpacity="0.85" />
    </svg>
  );
}

interface WordmarkProps {
  href?: string;
  className?: string;
  /** Hides the mark on very small headers. */
  compact?: boolean;
}

/** TaleTwo wordmark, optionally linked. */
export function Wordmark({ href = "/", className, compact = false }: WordmarkProps) {
  const content = (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      {!compact && <LogoMark />}
      <span className="font-display text-[22px] leading-none tracking-tight text-foreground">
        Tale<span className="italic text-brand-primary">Two</span>
      </span>
    </span>
  );

  if (!href) return content;

  return (
    <Link href={href} aria-label="TaleTwo home" className="rounded-md outline-none">
      {content}
    </Link>
  );
}
