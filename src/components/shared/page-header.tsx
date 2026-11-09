import type { ReactNode } from "react";

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}

/** Editorial page heading used on public and private pages. */
export function PageHeader({ eyebrow, title, description, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-2xl space-y-3">
        {eyebrow && <p className="text-eyebrow">{eyebrow}</p>}
        <h1 className="text-page-title text-foreground">{title}</h1>
        {description && <p className="text-base leading-relaxed text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
    </div>
  );
}
