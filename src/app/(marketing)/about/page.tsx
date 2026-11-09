import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { SITE } from "@/config/site";

export const metadata: Metadata = {
  title: "About TaleTwo: a private app for couples",
  description: "Why TaleTwo exists: a calm, private place for two people to keep their memories and plan their future.",
  alternates: { canonical: "/about" },
  openGraph: { title: "About TaleTwo", url: "/about" },
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-12 px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
      <PageHeader
        eyebrow="About"
        title="A little world, made for two."
        description={SITE.description}
      />
      <div className="space-y-6 text-base leading-relaxed text-muted-foreground">
        <p>
          Most of the things couples care about most are scattered: photos in one app, plans in a chat, dreams in a
          notebook that never gets opened. TaleTwo gathers them into one private space that belongs to two people and
          to nobody else.
        </p>
        <p>
          We are building for couples wherever they are: newly married, engaged, long-distance, or simply planning a
          future together. Our products are designed to work for people in any country, in their own time zone and in
          their own currency.
        </p>
        <p>
          Privacy is the foundation of the product. Your photographs, notes and letters are never public, and we are
          designing every feature so that only the two partners in a space can see what is shared there.
        </p>
      </div>
      <section aria-labelledby="founder-note" className="space-y-5 border-l-2 border-brand-accent pl-6">
        <h2 id="founder-note" className="font-display text-2xl text-foreground">A note from the founder</h2>
        <div className="space-y-4 text-base leading-relaxed text-muted-foreground">
          <p>Hi, I&apos;m Rahul Raj, from Muzaffarpur, Bihar, India.</p>
          <p>
            If you have any doubts or ideas on how TaleTwo could get better, please reach out to me at{" "}
            <a href={`mailto:${SITE.supportEmail}`} className="text-brand-primary underline underline-offset-4">{SITE.supportEmail}</a>
            {" "}or call <a href={`tel:${SITE.supportPhone}`} className="text-brand-primary underline underline-offset-4">{SITE.supportPhone}</a>. I read every message myself.
          </p>
          <p>
            I built TaleTwo because I know how much small things matter in a relationship: a message that arrives at the
            right moment, a photo from a trip we almost forgot, a plan we both promised to keep. I wanted one calm place
            where those things could live, safe and just for two.
          </p>
          <p>
            I am in love, and I feel that love closely every day. It is the reason this exists. Every feature here is
            meant to help two people hold on to what they feel for each other, so that love never gets lost in the noise
            of ordinary life.
          </p>
          <p>
            If TaleTwo helps you remember one more good day together, it has done its job. Thank you for being here.
          </p>
        </div>
      </section>
      <div className="surface-card flex flex-col gap-4 p-7 sm:flex-row sm:items-center sm:justify-between">
        <p className="font-display text-xl text-foreground">{SITE.brandMessage}</p>
        <Button render={<Link href="/signup" />}>Create Your Space</Button>
      </div>
    </div>
  );
}
