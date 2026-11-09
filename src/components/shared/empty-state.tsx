import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
}

/** Calm, centred empty state. Always offers a next step when one exists. */
export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-[14px] border border-dashed border-border bg-surface-muted/50 px-6 py-10 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-surface text-brand-primary shadow-soft">
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <div className="space-y-1">
        <p className="text-card-title text-foreground">{title}</p>
        <p className="mx-auto max-w-sm text-sm text-muted-foreground">{description}</p>
      </div>
      {action && <div className="pt-1">{action}</div>}
    </div>
  );
}
