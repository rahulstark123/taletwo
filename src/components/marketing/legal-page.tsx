import { PageHeader } from "@/components/shared/page-header";

export interface LegalSection {
  heading: string;
  body: string[];
}

/** Shared layout for legal pages. Content is passed in so it can be replaced by reviewed copy later. */
export function LegalPage({
  title,
  updated,
  notice,
  sections,
}: {
  title: string;
  updated: string;
  notice: string;
  sections: LegalSection[];
}) {
  return (
    <div className="mx-auto max-w-3xl space-y-10 px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
      <PageHeader eyebrow="Legal" title={title} description={updated} />
      <p role="note" className="rounded-md border border-brand-accent/60 bg-brand-accent/15 px-4 py-3 text-sm text-foreground">
        {notice}
      </p>
      <div className="space-y-8">
        {sections.map((section) => (
          <section key={section.heading} aria-labelledby={`legal-${slug(section.heading)}`} className="space-y-3">
            <h2 id={`legal-${slug(section.heading)}`} className="text-card-title text-foreground">
              {section.heading}
            </h2>
            {section.body.map((paragraph) => (
              <p key={paragraph} className="text-base leading-relaxed text-muted-foreground">
                {paragraph}
              </p>
            ))}
          </section>
        ))}
      </div>
    </div>
  );
}

function slug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}
