import type { ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export const inputClass =
  "h-12 w-full rounded-xl border border-ld-outline-variant bg-ld-surface px-4 text-ld-body-md text-ld-on-surface placeholder:text-ld-outline transition-colors focus:border-ld-primary focus:outline-none focus:ring-2 focus:ring-ld-primary/25 aria-[invalid=true]:border-ld-error aria-[invalid=true]:ring-ld-error/20";

/** Label, control and accessible error message for one form field. */
export function FormField({
  id,
  label,
  error,
  hint,
  children,
  className,
}: {
  id: string;
  label: string;
  error?: string;
  hint?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={id} className="text-ld-label-md font-medium text-ld-on-surface">
        {label}
      </label>
      {children}
      {error ? (
        <p id={errorId} role="alert" className="text-ld-caption text-ld-error">
          {error}
        </p>
      ) : hint ? (
        <div id={hintId} className="text-ld-caption text-ld-on-surface-variant">
          {hint}
        </div>
      ) : null}
    </div>
  );
}

/** Attributes that link a control to its message. Spread onto the input. */
export function describedBy(id: string, error?: string, hint?: unknown) {
  if (error) return `${id}-error`;
  if (hint) return `${id}-hint`;
  return undefined;
}

/** Select styling: native arrow hidden, replaced by a consistent chevron with room on the right. */
export const selectClass = `${inputClass} block appearance-none cursor-pointer pr-11`;

/** Place inside a `relative` wrapper, next to a select. */
export function SelectChevron() {
  return (
    <ChevronDown
      className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-ld-on-surface-variant"
      aria-hidden="true"
    />
  );
}
