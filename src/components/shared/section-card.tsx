import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SectionCardProps {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  id?: string;
}

/** Warm, bordered card with a consistent heading row. Used across the private app. */
export function SectionCard({ title, description, action, children, className, id }: SectionCardProps) {
  const headingId = id ? `${id}-heading` : undefined;
  return (
    <section
      aria-labelledby={headingId}
      className={cn("surface-card flex flex-col gap-5 p-5 sm:p-6", className)}
    >
      <header className="flex items-start justify-between gap-4">
        <div className="min-w-0 space-y-1">
          <h2 id={headingId} className="text-card-title text-foreground">
            {title}
          </h2>
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </header>
      {children}
    </section>
  );
}
