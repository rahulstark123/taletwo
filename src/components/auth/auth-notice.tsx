import { AlertCircle, Info } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Inline message for forms. `error` is for problems the user must fix, `info` is for neutral updates.
 * Errors use `role="alert"` so screen readers announce them immediately.
 */
export function AuthNotice({ children, tone = "info" }: { children: ReactNode; tone?: "info" | "error" }) {
  const isError = tone === "error";
  const Icon = isError ? AlertCircle : Info;
  return (
    <div
      role={isError ? "alert" : "status"}
      className={cn(
        "flex gap-3 rounded-xl px-4 py-3 text-ld-caption",
        isError ? "bg-ld-error-container text-ld-on-error-container" : "bg-ld-secondary-container/40 text-ld-on-surface"
      )}
    >
      <Icon className={cn("mt-0.5 size-4 shrink-0", isError ? "text-ld-error" : "text-ld-primary")} aria-hidden="true" />
      <p>{children}</p>
    </div>
  );
}
