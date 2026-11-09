import Link from "next/link";
import { ArrowDown, CalendarDays, Heart, Lock, NotebookPen } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Landing hero. Kept deliberately light: one headline, one promise, two actions
 * and a single calm preview, so the first screen is not crowded.
 */
export function LandingHero() {
  return (
    <section className="relative mx-auto w-full overflow-hidden max-w-[1240px] px-5 pb-20 pt-10 md:px-6 lg:px-8 lg:pt-20">
      <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
        <div className="z-10 flex flex-col items-start gap-5 lg:col-span-6">
          <span className="rounded-full bg-ld-secondary-container/40 px-3.5 py-1 text-ld-label-sm font-semibold uppercase tracking-widest text-ld-primary">
            Your own private space
          </span>

          <h1 className="font-display text-ld-hero-mobile tracking-tight text-ld-on-surface leading-[1.08] lg:text-ld-hero">
            Your little world,{" "}
            <span className="font-normal italic text-ld-primary">made for two</span> &amp; your loved ones.
          </h1>

          <p className="max-w-xl text-ld-body-lg text-ld-on-surface-variant">
            Keep your favourite memories, shared dreams and little love notes in one private place. Built for you and
            your partner, and open to the family you choose to include.
          </p>

          <div className="flex w-full flex-col gap-3 pt-1 sm:w-auto sm:flex-row sm:items-center">
            <Button
              size="lg"
              render={<Link href="/signup" />}
              className="h-auto w-full rounded-full bg-ld-primary px-8 py-3.5 text-ld-label-md text-ld-on-primary shadow-[0_8px_20px_rgba(201,126,139,0.28)] hover:bg-ld-on-primary-fixed-variant sm:w-auto"
            >
              Create Your Space
              <Heart className="size-[18px]" aria-hidden="true" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              render={<Link href="#features" />}
              className="h-auto w-full rounded-full border-transparent bg-ld-surface-container-low px-7 py-3.5 text-ld-label-md text-ld-on-surface hover:bg-ld-surface-container-highest sm:w-auto"
            >
              Explore Features
              <ArrowDown className="size-[18px]" aria-hidden="true" />
            </Button>
          </div>

          <p className="flex items-center gap-2.5 pt-2 text-ld-caption tracking-wide text-ld-on-surface-variant/80">
            <Lock className="size-[16px] text-ld-tertiary" aria-hidden="true" />
            Private by design. Shared only with the people you invite.
          </p>
        </div>

        <div className="relative lg:col-span-6">
          <div aria-hidden="true" className="pointer-events-none absolute -right-10 -top-12 -z-10 size-72 rounded-full bg-ld-secondary-container/30 blur-3xl" />

          <div            className="flex w-full flex-col gap-4 rounded-3xl bg-ld-surface-container-lowest p-5 shadow-[0_20px_50px_-10px_rgba(64,56,50,0.12)] md:p-7"
            aria-hidden="true"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center -space-x-2.5">
                <span className="flex size-11 items-center justify-center rounded-full bg-ld-secondary-container text-ld-label-md font-semibold text-ld-on-secondary-container ring-2 ring-ld-surface-container-lowest">
                  R
                </span>
                <span className="flex size-11 items-center justify-center rounded-full bg-ld-tertiary-fixed text-ld-label-md font-semibold text-ld-on-tertiary-fixed-variant ring-2 ring-ld-surface-container-lowest">
                  S
                </span>
              </div>
              <span className="font-display text-ld-headline-md text-ld-on-surface">Day 630</span>
            </div>

            <div className="flex flex-col gap-3 rounded-2xl bg-ld-surface-container-low p-4">
              <div className="flex items-center justify-between text-ld-label-sm font-semibold text-ld-on-surface">
                <span className="flex items-center gap-2">
                  <CalendarDays className="size-4 text-ld-primary" />
                  Our 2nd anniversary
                </span>
                <span className="text-ld-caption font-normal text-ld-on-surface-variant">42 days</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-ld-surface-container">
                <div className="h-full w-[78%] rounded-full bg-ld-primary-container" />
              </div>
            </div>

            <div className="relative rounded-2xl bg-ld-surface-container-high p-5">
              <div className="mb-2 flex items-center gap-1.5 text-ld-primary">
                <NotebookPen className="size-[15px]" />
                <span className="text-[11px] font-semibold uppercase tracking-wider">Morning note</span>
              </div>
              <p className="text-[15px] italic leading-snug text-ld-on-surface">
                “Left freshly ground cinnamon latte beans in the cabinet for you. Have the best day!”
              </p>
              <p className="mt-3 text-[11px] text-ld-on-surface-variant">8:12 AM · Raj</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
