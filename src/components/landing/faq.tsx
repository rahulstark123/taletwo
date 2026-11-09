"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { LandingSection, SectionIntro } from "@/components/landing/sections";
import { cn } from "@/lib/utils";

const FAQS = [
  {
    q: "What is TaleTwo?",
    a: "TaleTwo is an intimate digital sanctuary designed for couples, with room for the family they choose. It combines a private photo journal, collaborative notes, timed love letters, bucket lists, and milestone countdowns into one shared haven.",
  },
  {
    q: "Is TaleTwo only for couples?",
    a: "No. TaleTwo is built first for two partners, and you can also invite family members to your space if you want to. There are no public followers or public feeds.",
  },
  {
    q: "Can we add family members?",
    a: "Yes. You can invite family members you trust. Nobody joins unless you invite them, and you can remove someone at any time. How family members are added and priced will be confirmed before launch.",
  },
  {
    q: "Can my partner and I use the same private space?",
    a: "Absolutely. Every account gets a 6-character space code when it is created. Enter your partner's code and you are both in one private space, with a limit of two people.",
  },
  {
    q: "Can we save photos and memories?",
    a: "Yes. Save photos with places, dates and captions. The Free plan keeps up to 30 photos, Pro keeps up to 2,000, and Max has unlimited photos with fair use.",
  },
  {
    q: "Is TaleTwo free to use?",
    a: "Yes. The Free plan costs nothing and needs no payment details. When you want more room, Pro and Max are one-time payments for a month or a year, with no automatic renewal.",
  },
  {
    q: "Does one subscription cover both partners?",
    a: "Yes. One payment covers the whole couple space, so both of you get the plan's features and limits.",
  },
  {
    q: "What are AI credits?",
    a: "Astro AI uses credits. Every new account starts with 20. Pro adds 100 each month and Max adds 250. Each reading costs a few credits, and the cost is shown before you use it.",
  },
  {
    q: "Can we use TaleTwo on mobile?",
    a: "Yes, TaleTwo works fluidly on mobile browsers and installable progressive web apps, allowing you to quickly write notes or check anniversaries on the go.",
  },
];

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
