"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { LandingSection, SectionIntro } from "@/components/landing/sections";
import { cn } from "@/lib/utils";
import { LANDING_FAQS } from "@/config/faq";

const FAQS = LANDING_FAQS;

/** Single-open accordion. Keyboard accessible: each question is a real button with aria-expanded. */
export function LandingFaq() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <LandingSection id="faq" className="py-20 md:py-24">
      <div className="mx-auto flex max-w-[840px] flex-col gap-12">
        <SectionIntro eyebrow="Everything Explained" title="Little questions, clear answers." />
        <div className="flex flex-col gap-3.5">
          {FAQS.map((item, i) => {
            const isOpen = open === i;
            const panelId = `faq-panel-${i}`;
            return (
              <div key={item.q} className="overflow-hidden rounded-2xl bg-ld-surface-container-low transition-all duration-300">
                <button
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="flex w-full items-center justify-between gap-4 p-5 text-left focus:outline-hidden"
                >
                  <span className="text-ld-title-md font-medium text-ld-on-surface">{item.q}</span>
                  <ChevronDown
                    aria-hidden="true"
                    className={cn("size-5 shrink-0 text-ld-outline transition-transform duration-300", isOpen && "rotate-180")}
                  />
                </button>
                {isOpen && (
                  <div id={panelId} className="px-5 pb-5 text-ld-body-md text-ld-on-surface-variant">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </LandingSection>
  );
}
