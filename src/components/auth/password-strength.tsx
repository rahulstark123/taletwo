import { getPasswordStrength } from "@/lib/validations/auth";
import { cn } from "@/lib/utils";

const BAR_COLOR = ["bg-ld-surface-container-highest", "bg-ld-error", "bg-ld-secondary", "bg-ld-tertiary-container", "bg-ld-tertiary"];

/** Visual strength meter plus short, specific hints. Purely guidance. */
export function PasswordStrength({ value, id }: { value: string; id: string }) {
  if (!value) {
    return (
      <p id={`${id}-hint`} className="text-ld-caption text-ld-on-surface-variant">
        Use at least 8 characters, with a letter and a number.
      </p>
    );
  }
  const { score, label, hints } = getPasswordStrength(value);
  return (
    <div id={`${id}-hint`} className="space-y-1.5" aria-live="polite">
      <div className="flex gap-1" aria-hidden="true">
        {[1, 2, 3, 4].map((step) => (
          <span
            key={step}
            className={cn("h-1.5 flex-1 rounded-full", score >= step ? BAR_COLOR[score] : "bg-ld-surface-container-highest")}
          />
        ))}
      </div>
      <p className="text-ld-caption text-ld-on-surface-variant">
        Password strength: <span className="font-semibold text-ld-on-surface">{label}</span>
        {hints.length > 0 && <span> · {hints.join(" · ")}</span>}
      </p>
    </div>
  );
}
