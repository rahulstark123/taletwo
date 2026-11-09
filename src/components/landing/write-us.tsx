import { Mail } from "lucide-react";
import { LandingSection, SectionIntro } from "@/components/landing/sections";
import { SITE } from "@/config/site";

/** Feedback and suggestions. Sits under the FAQ and points to the official mailbox. */
export function WriteUsSection() {
  return (
    <LandingSection id="write-us" className="pb-20 md:pb-24">
      <div className="mx-auto flex max-w-[840px] flex-col items-center gap-8 rounded-[2rem] bg-ld-surface-container-low px-6 py-12 text-center md:px-12 md:py-16">
        <SectionIntro
          eyebrow="Write to us"
          title="Your feedback and ideas are welcome."
          body="Tell us what you love, what feels missing or what would make TaleTwo feel more like home. Every message is read by the team."
        />
        <a
          href={`mailto:${SITE.supportEmail}?subject=${encodeURIComponent("TaleTwo feedback")}`}
          className="inline-flex h-12 items-center gap-2 rounded-full bg-ld-primary px-7 text-ld-label-md text-ld-on-primary shadow-[0_8px_20px_rgba(201,126,139,0.28)] transition-colors hover:bg-ld-on-primary-fixed-variant"
        >
          <Mail className="size-5" aria-hidden="true" />
          {SITE.supportEmail}
        </a>
        <p className="text-ld-caption text-ld-on-surface-variant">Feedback, suggestions, questions and bug reports all go to the same inbox.</p>
      </div>
    </LandingSection>
  );
}
