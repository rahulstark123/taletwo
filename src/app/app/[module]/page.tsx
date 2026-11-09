import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Construction } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { APP_MODULE_STATUS } from "@/config/navigation";

type Params = Promise<{ module: string }>;

/**
 * Placeholder for modules not yet built. Each real module gets its own static
 * route (e.g. app/memories/page.tsx); a static route takes precedence over this
 * dynamic one, so the placeholder disappears automatically when a module ships.
 */
export default async function ModulePlaceholderPage({ params }: { params: Params }) {
  const { module } = await params;
  const status = APP_MODULE_STATUS[`/app/${module}`];
  if (!status) notFound();

  return (
    <div className="space-y-8">
      <PageHeader eyebrow={status.milestone} title={status.title} description={status.blurb} />
      <EmptyState
        icon={Construction}
        title={`${status.title} arrives in ${status.milestone}`}
        description="This section is part of the roadmap and is not connected to data yet. Nothing here is saved."
        action={
          <Button variant="outline" render={<Link href="/app" />}>
            Back to home
          </Button>
        }
      />
    </div>
  );
}

export function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  return params.then(({ module }) => ({
    title: APP_MODULE_STATUS[`/app/${module}`]?.title ?? "Your space",
    robots: { index: false, follow: false },
  }));
}
