import type { Metadata } from "next";
import { Mail, Phone } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { SITE } from "@/config/site";

export const metadata: Metadata = {
  title: "Contact TaleTwo support",
  description: "Get in touch with the TaleTwo team.",
  alternates: { canonical: "/contact" },
  openGraph: { title: "Contact TaleTwo", url: "/contact" },
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-10 px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
      <PageHeader
        eyebrow="Contact"
        title="We are happy to hear from you."
        description="Questions about your account, privacy or billing are always welcome. We reply as soon as we can."
      />
      <a
        href={`mailto:${SITE.supportEmail}`}
        className="surface-card flex items-center gap-4 p-6 transition-shadow hover:shadow-card"
      >
        <span className="flex size-11 items-center justify-center rounded-full bg-brand-accent/25 text-brand-primary">
          <Mail className="size-5" aria-hidden="true" />
        </span>
        <span className="space-y-1">
          <span className="block text-card-title text-foreground">Email our team</span>
          <span className="block text-sm text-muted-foreground">{SITE.supportEmail}</span>
        </span>
      </a>
      <a
        href={`tel:${SITE.supportPhone}`}
        className="surface-card flex items-center gap-4 p-6 transition-shadow hover:shadow-card"
      >
        <span className="flex size-11 items-center justify-center rounded-full bg-brand-accent/25 text-brand-primary">
          <Phone className="size-5" aria-hidden="true" />
        </span>
        <span className="space-y-1">
          <span className="block text-card-title text-foreground">Call or message</span>
          <span className="block text-sm text-muted-foreground">{SITE.supportPhone}</span>
        </span>
      </a>
    </div>
  );
}
