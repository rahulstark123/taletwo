import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = ["Your profile", "Your workspace", "Ready"] as const;

/** Three-step progress indicator for onboarding. `current` is 1, 2 or 3. */
export function StepIndicator({ current }: { current: 1 | 2 | 3 }) {
  return (
    <nav aria-label="Onboarding progress" className="mx-auto w-full max-w-md">
      <ol className="flex items-center justify-between gap-2">
        {STEPS.map((label, i) => {
          const step = i + 1;
          const done = step < current;
          const active = step === current;
          return (
            <li key={label} className="flex flex-1 flex-col items-center gap-2" aria-current={active ? "step" : undefined}>
              <span
                className={cn(
                  "flex size-9 items-center justify-center rounded-full text-ld-label-md font-semibold transition-colors",
                  done && "bg-ld-tertiary text-ld-on-tertiary",
                  active && "bg-ld-primary text-ld-on-primary",
                  !done && !active && "bg-ld-surface-container text-ld-on-surface-variant"
                )}
              >
                {done ? <Check className="size-4" aria-hidden="true" /> : step}
              </span>
              <span className={cn("text-center text-ld-caption", active ? "text-ld-on-surface" : "text-ld-on-surface-variant")}>
                <span className="sr-only">Step {step} of 3: </span>
                {label}
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
