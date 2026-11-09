import Link from "next/link";
import {
  BadgeCheck,
  BookOpen,
  CalendarDays,
  Camera,
  Check,
  CircleCheck,
  Compass,
  EyeOff,
  Lightbulb,
  Lock,
  LockKeyhole,
  Mail,
  MailOpen,
  Plane,
  PartyPopper,
  CirclePlus,
  StickyNote,
  Heart,
  ShieldCheck,
  UserPlus,
  Users,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { LandingPhoto } from "@/components/landing/landing-photo";
import { cn } from "@/lib/utils";

/** Shared wrapper for landing sections: consistent max width, gutters and vertical rhythm. */
export function LandingSection({
  id,
  className,
  children,
}: {
  id?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className={cn("w-full scroll-mt-24 py-16 md:py-24", className)}>
      <div className="mx-auto w-full max-w-[1240px] px-5 md:px-6 lg:px-8">{children}</div>
    </section>
  );
}

export function SectionIntro({
  eyebrow,
  title,
  body,
  className,
}: {
  eyebrow: string;
  title: string;
  body?: string;
  className?: string;
}) {
  return (
    <div className={cn("mx-auto flex max-w-2xl flex-col items-center gap-2 text-center", className)}>
      <span className="text-ld-label-sm font-semibold uppercase tracking-widest text-ld-primary">{eyebrow}</span>
      <h2 className="font-display text-ld-headline-xl-mobile text-ld-on-surface md:text-ld-headline-xl">{title}</h2>
      {body && <p className="text-ld-body-md text-ld-on-surface-variant">{body}</p>}
    </div>
  );
}

function IconDot({ icon: Icon, className }: { icon: LucideIcon; className?: string }) {
  return (
    <div className={cn("mb-1 flex size-10 items-center justify-center rounded-full bg-ld-secondary-container/40 text-ld-primary", className)}>
      <Icon className="size-5" aria-hidden="true" />
    </div>
  );
}

/* ---------------- Feature showcase ---------------- */

function FeatureNumber({ n }: { n: string }) {
  return <span className="text-ld-label-sm font-semibold uppercase tracking-wider text-ld-outline">Feature {n}</span>;
}

function FeatureCopy({
  n,
  icon,
  title,
  body,
  children,
  className,
}: {
  n: string;
  icon: LucideIcon;
  title: string;
  body: string;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <IconDot icon={icon} />
      <FeatureNumber n={n} />
      <h3 className="font-display text-ld-headline-lg-mobile text-ld-on-surface md:text-ld-headline-lg">{title}</h3>
      <p className="text-ld-body-md text-ld-on-surface-variant">{body}</p>
      {children}
    </div>
  );
}

export function FeatureShowcase() {
  return (
    <LandingSection id="features" className="py-20 md:py-24">
      <div className="flex flex-col gap-12">
        <SectionIntro
          eyebrow="Crafted With Care"
          title="Everything that makes your story yours."
          body="All the little things that make your relationship special, brought together in one peaceful and bespoke private home."
        />

        <div className="mt-6 flex flex-col gap-10">
          {/* 1. Memories */}
          <article className="grid grid-cols-1 items-center gap-8 rounded-3xl bg-ld-surface-container-lowest p-6 shadow-sm md:p-10 lg:grid-cols-12">
            <FeatureCopy
              n="01"
              icon={Camera}
              title="Our Memories"
              body="Save photographs, candid moments and quiet memories you'll want to revisit forever. Preserve locations, dates and heartfelt captions in an intimate shared archive."
              className="order-2 lg:order-1 lg:col-span-5"
            >
              <div className="flex flex-wrap items-center gap-3 pt-2">
                {["Geo-tagged", "High Resolution", "Milestone Timeline"].map((t) => (
                  <span key={t} className="rounded-full bg-ld-surface-container px-3 py-1 text-ld-caption text-ld-on-surface">
                    {t}
                  </span>
                ))}
              </div>
            </FeatureCopy>
            <div className="order-1 grid grid-cols-2 gap-4 lg:order-2 lg:col-span-7">
              <LandingPhoto photo="memoryKitchen" className="h-72 shadow-sm" />
              <LandingPhoto photo="memoryCoast" className="mt-6 h-72 shadow-sm" />
            </div>
          </article>

          {/* 2. Notes */}
          <article className="grid grid-cols-1 items-center gap-8 rounded-3xl bg-ld-surface-container-low p-6 shadow-sm md:p-10 lg:grid-cols-12 lg:gap-8">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:col-span-7">
              <div className="flex h-56 flex-col justify-between rounded-2xl bg-ld-surface-container-lowest p-5 shadow-sm">
                <div>
                  <div className="mb-2 flex items-center justify-between text-ld-outline">
                    <span className="text-ld-caption font-medium">Shared Grocery &amp; Dinner</span>
                    <CircleCheck className="size-4 text-ld-tertiary" />
                  </div>
                  <h4 className="text-ld-title-md font-semibold text-ld-on-surface">Sunday Brunch Menu</h4>
                  <ul className="mt-2 space-y-1 text-ld-body-sm text-ld-on-surface-variant">
                    <li>• Sourdough &amp; ripe avocado</li>
                    <li>• French vanilla bean extract</li>
                    <li>• Orange blossom honey</li>
                  </ul>
                </div>
                <span className="text-ld-caption text-ld-outline">Updated 2h ago by Simran</span>
              </div>
              <div className="flex h-56 flex-col justify-between rounded-2xl bg-ld-surface-container-high p-5 shadow-sm">
                <div>
                  <div className="mb-2 flex items-center justify-between text-ld-outline">
                    <span className="text-ld-caption font-medium">Idea Pad</span>
                    <Lightbulb className="size-4 text-ld-primary" />
                  </div>
                  <h4 className="text-ld-title-md font-semibold text-ld-on-surface">Balcony Garden Plant Ideas</h4>
                  <p className="mt-2 text-ld-body-sm italic text-ld-on-surface-variant">
                    “Let&apos;s hang jasmine along the rail so it smells sweet in the evenings.”
                  </p>
                </div>
                <span className="text-ld-caption text-ld-outline">Pinned by Raj</span>
              </div>
            </div>
            <FeatureCopy
              n="02"
              icon={StickyNote}
              title="Our Notes"
              body="Keep collaborative thoughts, grocery inspirations, movie recommendations and gentle reminders together in an effortlessly organized digital notebook."
              className="lg:col-span-5"
            />
          </article>

          {/* 3. Love letters */}
          <article className="grid grid-cols-1 items-center gap-8 rounded-3xl bg-ld-surface-container-lowest p-6 shadow-sm md:p-10 lg:grid-cols-12">
            <FeatureCopy
              n="03"
              icon={Mail}
              title="Love Letters"
              body="Write letters for today, scheduled for tomorrow, or create sealed “Open When...” letters for milestone moments when your partner needs to feel your embrace most."
              className="order-2 lg:order-1 lg:col-span-5"
            >
              <div className="flex items-center gap-2 pt-2 text-ld-tertiary">
                <BadgeCheck className="size-[18px]" />
                <span className="text-ld-caption font-medium">Delivered with virtual wax seals &amp; opening animations</span>
              </div>
            </FeatureCopy>
            <div className="order-1 flex flex-col gap-4 sm:flex-row lg:order-2 lg:col-span-7">
              <div className="flex flex-1 flex-col items-center justify-between gap-4 rounded-2xl bg-ld-surface-container p-6 text-center shadow-sm">
                <div className="flex size-12 items-center justify-center rounded-full bg-ld-primary text-ld-on-primary shadow-md">
                  <MailOpen className="size-[22px]" />
                </div>
                <div>
                  <span className="text-ld-label-sm font-semibold uppercase tracking-wider text-ld-primary">Open When</span>
                  <h4 className="mt-1 font-display text-ld-headline-md text-ld-on-surface">You Miss Me</h4>
                  <p className="mt-1 text-ld-caption text-ld-on-surface-variant">Written before the long trip. Unlocked anytime.</p>
                </div>
                <button
                  type="button"
                  className="rounded-full bg-ld-surface-container-lowest px-4 py-2 text-ld-label-sm font-semibold text-ld-on-surface transition-colors hover:bg-ld-primary-container hover:text-ld-on-primary"
                >
                  Read Letter
                </button>
              </div>
              <div className="flex flex-1 flex-col items-center justify-between gap-4 rounded-2xl bg-ld-surface-container-low p-6 text-center opacity-90 shadow-sm">
                <div className="flex size-12 items-center justify-center rounded-full bg-ld-surface-container-highest text-ld-outline">
                  <LockKeyhole className="size-[22px]" />
                </div>
                <div>
                  <span className="text-ld-label-sm font-semibold uppercase tracking-wider text-ld-outline">Scheduled Surprise</span>
                  <h4 className="mt-1 font-display text-ld-headline-md text-ld-on-surface">Our 2nd Year</h4>
                  <p className="mt-1 text-ld-caption text-ld-on-surface-variant">Locked until November 18, 00:00 AM</p>
                </div>
                <span className="rounded-full bg-ld-surface-container px-4 py-1.5 text-ld-caption font-medium text-ld-outline">
                  Opens in 42 days
                </span>
              </div>
            </div>
          </article>

          {/* 4. Plans */}
          <article className="grid grid-cols-1 items-center gap-8 rounded-3xl bg-ld-surface-container-low p-6 shadow-sm md:p-10 lg:grid-cols-12">
            <div className="flex flex-col gap-4 rounded-2xl bg-ld-surface-container-lowest p-6 shadow-sm lg:col-span-7">
              <div className="flex items-center justify-between pb-2">
                <div className="flex items-center gap-2">
                  <CalendarDays className="size-5 text-ld-primary" />
                  <h4 className="text-ld-title-lg font-semibold text-ld-on-surface">Upcoming Itineraries</h4>
                </div>
                <span className="text-ld-caption font-medium text-ld-primary">Next 30 Days</span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-ld-surface-container-low p-3.5">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 flex-col items-center justify-center rounded-lg bg-ld-surface-container-highest text-ld-on-surface">
                    <span className="text-[10px] font-bold uppercase text-ld-primary">Oct</span>
                    <span className="text-[15px] font-bold leading-none">24</span>
                  </div>
                  <div>
                    <p className="text-[15px] font-semibold text-ld-on-surface">Stargazing &amp; Cabin Weekend</p>
                    <p className="text-ld-caption text-ld-on-surface-variant">Blue Ridge Mountains • 2 nights booked</p>
                  </div>
                </div>
                <span className="rounded-full bg-ld-tertiary-fixed/40 px-3 py-1 text-[12px] font-medium text-ld-tertiary">Confirmed</span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-ld-surface-container-low p-3.5">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 flex-col items-center justify-center rounded-lg bg-ld-surface-container-highest text-ld-on-surface">
                    <span className="text-[10px] font-bold uppercase text-ld-primary">Nov</span>
                    <span className="text-[15px] font-bold leading-none">04</span>
                  </div>
                  <div>
                    <p className="text-[15px] font-semibold text-ld-on-surface">Pottery Workshop Date</p>
                    <p className="text-ld-caption text-ld-on-surface-variant">Clay Studio • 6:30 PM reservation</p>
                  </div>
                </div>
                <span className="rounded-full bg-ld-secondary-container/50 px-3 py-1 text-[12px] font-medium text-ld-primary">Date Night</span>
              </div>
            </div>
            <FeatureCopy
              n="04"
              icon={Plane}
              title="Our Plans"
              body="Plan date nights, weekend getaways and grand voyages ahead. Keep reservation codes, packing checklists, and flight timings unified in one shared itinerary."
              className="lg:col-span-5"
            />
          </article>

          {/* 5. Bucket list */}
          <article className="grid grid-cols-1 items-center gap-8 rounded-3xl bg-ld-surface-container-lowest p-6 shadow-sm md:p-10 lg:grid-cols-12">
            <FeatureCopy
              n="05"
              icon={Compass}
              title="Bucket List"
              body="Turn your shared dreams into memories waiting to happen. Add aspirations, track your progress together, and check them off side-by-side."
              className="order-2 lg:order-1 lg:col-span-5"
            >
              <div className="mt-2 flex flex-col gap-2 rounded-xl bg-ld-surface-container-low p-3.5">
                <div className="flex items-center justify-between text-ld-label-sm font-semibold">
                  <span className="text-ld-on-surface">Dream Progress</span>
                  <span className="font-bold text-ld-primary">12 / 30 Accomplished (40%)</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-ld-surface-container">
                  <div className="h-full w-[40%] rounded-full bg-ld-primary" />
                </div>
              </div>
            </FeatureCopy>
            <div className="order-1 flex flex-col gap-3 lg:order-2 lg:col-span-7">
              <div className="flex items-center justify-between rounded-xl bg-ld-surface-container-low p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <span className="flex size-6 items-center justify-center rounded-full bg-ld-tertiary text-ld-on-tertiary">
                    <Check className="size-4" />
                  </span>
                  <span className="text-ld-body-md font-medium text-ld-on-surface line-through opacity-70">
                    See the Northern Lights in Tromsø
                  </span>
                </div>
                <span className="text-ld-caption font-semibold text-ld-tertiary">Completed 2024</span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-ld-surface-container-lowest p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <span className="size-6 rounded-full bg-ld-surface-container" />
                  <span className="text-ld-body-md font-medium text-ld-on-surface">Adopt a golden retriever pup</span>
                </div>
                <span className="rounded-full bg-ld-secondary-container/40 px-2.5 py-0.5 text-ld-caption text-ld-primary">Someday soon</span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-ld-surface-container-lowest p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <span className="size-6 rounded-full bg-ld-surface-container" />
                  <span className="text-ld-body-md font-medium text-ld-on-surface">Ride bicycles across Amsterdam canals</span>
                </div>
                <span className="rounded-full bg-ld-tertiary-fixed/30 px-2.5 py-0.5 text-ld-caption text-ld-tertiary">Target Spring</span>
              </div>
            </div>
          </article>

          {/* 6. Special days */}
          <article className="grid grid-cols-1 items-center gap-8 rounded-3xl bg-ld-surface-container-low p-6 shadow-sm md:p-10 lg:grid-cols-12">
            <div className="flex flex-col items-center justify-center gap-4 rounded-2xl bg-ld-surface-container-lowest p-6 text-center shadow-sm lg:col-span-7">
              <span className="text-ld-label-sm font-semibold uppercase tracking-widest text-ld-primary">Milestone In Sight</span>
              <h4 className="font-display text-ld-headline-lg text-ld-on-surface">2nd Anniversary Countdown</h4>
              <div className="my-2 flex items-center gap-4 sm:gap-6">
                {[
                  { v: "42", l: "Days" },
                  { v: "14", l: "Hours" },
                  { v: "28", l: "Minutes" },
                ].map((unit, i) => (
                  <div key={unit.l} className="contents">
                    {i > 0 && <span className="font-display text-ld-headline-lg font-light text-ld-outline-variant">:</span>}
                    <div className="flex flex-col items-center">
                      <span className="font-display text-[36px] font-semibold leading-none text-ld-primary sm:text-[44px]">{unit.v}</span>
                      <span className="mt-1 text-ld-caption uppercase tracking-wider text-ld-on-surface-variant">{unit.l}</span>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-ld-body-sm italic text-ld-on-surface-variant">
                “Two full years of laughing at the same silly things.”
              </p>
            </div>
            <FeatureCopy
              n="06"
              icon={PartyPopper}
              title="Special Days"
              body="Never lose track of anniversaries, first encounters, birthdays and meaningful quiet milestones. TaleTwo counts the days you've shared and the celebrations on the horizon."
              className="lg:col-span-5"
            />
          </article>
        </div>
      </div>
    </LandingSection>
  );
}

/* ---------------- Emotional brand moment ---------------- */

export function BrandMoment() {
  return (
    <section className="relative w-full overflow-hidden bg-ld-surface-container py-20 md:py-24">
      <div className="relative z-10 mx-auto max-w-[1240px] px-5 md:px-6 lg:px-8">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-4 text-center">
          <div className="flex size-14 items-center justify-center rounded-full bg-ld-surface-container-lowest text-ld-primary shadow-sm">
            <Heart className="size-7 fill-ld-primary" aria-hidden="true" />
          </div>
          <h2 className="font-display text-ld-headline-xl-mobile text-ld-on-surface md:text-ld-headline-xl">
            Some moments are too special to get lost.
          </h2>
          <p className="max-w-xl text-ld-body-lg text-ld-on-surface-variant">
            From your very first conversation to your everyday morning routines, TaleTwo gives your shared story a
            private, dedicated place to live, breathe and flourish.
          </p>
          <div className="mt-2 h-0.5 w-24 bg-ld-secondary-container" />
        </div>
        <LandingPhoto photo="momentBanner" className="mt-12 aspect-[16/7] w-full shadow-sm" sizes="100vw" />
      </div>
    </section>
  );
}

/* ---------------- How it works ---------------- */

const STEPS: { icon: LucideIcon; title: string; body: string }[] = [
  {
    icon: CirclePlus,
    title: "Create Your Space",
    body: "Start your own private space on TaleTwo. Choose your pair name and begin your shared journal.",
  },
  {
    icon: UserPlus,
    title: "Invite Your Person",
    body: "Connect with your partner using a secure 6-digit invite code or direct private link.",
  },
  {
    icon: BookOpen,
    title: "Build Your Story",
    body: "Save memories, exchange letters, check off adventures and answer daily prompts together.",
  },
];

export function HowItWorksLanding() {
  return (
    <LandingSection id="how-it-works" className="py-20 md:py-24">
      <div className="flex flex-col gap-12">
        <SectionIntro
          eyebrow="Simplicity For Two"
          title="Your story starts with two."
          body="Setting up your shared sanctuary takes less than two minutes."
        />
        <div className="mt-2 grid grid-cols-1 gap-8 md:grid-cols-3">
          {STEPS.map((step, i) => (
            <div
              key={step.title}
              className="group relative flex flex-col gap-4 rounded-3xl bg-ld-surface-container-low p-8 shadow-sm transition-colors duration-300 hover:bg-ld-surface-container-lowest"
            >
              <div className="flex items-center justify-between">
                <span className="font-display text-ld-headline-lg font-light text-ld-primary/40">0{i + 1}</span>
                <div className="flex size-10 items-center justify-center rounded-full bg-ld-surface-container text-ld-primary">
                  <step.icon className="size-5" aria-hidden="true" />
                </div>
              </div>
              <h3 className="text-ld-title-lg font-semibold text-ld-on-surface">{step.title}</h3>
              <p className="text-ld-body-sm text-ld-on-surface-variant">{step.body}</p>
            </div>
          ))}
        </div>
      </div>
    </LandingSection>
  );
}

/* ---------------- Privacy ---------------- */

const PRIVACY_POINTS: { icon: LucideIcon; title: string; body: string }[] = [
  {
    icon: Lock,
    title: "Private shared space.",
    body: "Every space is isolated and inaccessible to anyone outside your shared link.",
  },
  {
    icon: Users,
    title: "Only the people you invite can see your shared content.",
    body: "One private space, shared only with your partner and any family you choose. Nothing is public or searchable.",
  },
  {
    icon: EyeOff,
    title: "Your memories are not public social posts.",
    body: "No algorithms, no likes, no view counters and no ads analyzing your personal correspondence.",
  },
];

export function PrivacyGuarantee() {
  return (
    <LandingSection className="py-20 md:py-24">
      <div className="grid grid-cols-1 items-center gap-10 rounded-3xl bg-ld-surface-container-lowest p-8 shadow-sm md:p-14 lg:grid-cols-12 lg:gap-8">
        <div className="flex flex-col gap-3 lg:col-span-5">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-ld-tertiary-fixed/40 text-ld-tertiary">
            <ShieldCheck className="size-6" />
          </div>
          <span className="text-ld-label-sm font-semibold uppercase tracking-wider text-ld-tertiary">Strict Confidentiality</span>
          <h2 className="font-display text-ld-headline-lg-mobile text-ld-on-surface md:text-ld-headline-lg">
            Your story belongs to the two of you.
          </h2>
          <p className="text-ld-body-md text-ld-on-surface-variant">
            Your memories, intimate notes and letters deserve a truly private place. TaleTwo is purpose-built as an
            invite-only sanctuary strictly for two connected people.
          </p>
        </div>
        <div className="flex flex-col gap-4 lg:col-span-7">
          {PRIVACY_POINTS.map((point) => (
            <div key={point.title} className="flex items-start gap-4 rounded-2xl bg-ld-surface-container-low p-4">
              <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-ld-surface-container-highest text-ld-tertiary">
                <point.icon className="size-[18px]" aria-hidden="true" />
              </span>
              <div>
                <h3 className="text-ld-title-md font-semibold text-ld-on-surface">{point.title}</h3>
                <p className="mt-0.5 text-ld-body-sm text-ld-on-surface-variant">{point.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </LandingSection>
  );
}

/* ---------------- Final CTA ---------------- */

export function FinalCta() {
  return (
    <section className="relative w-full overflow-hidden bg-ld-surface-container py-20 md:py-24">
      <div className="relative z-10 mx-auto max-w-[1240px] px-5 md:px-6 lg:px-8">
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-6 rounded-3xl bg-ld-surface-container-lowest p-8 text-center shadow-sm md:p-16">
          <div className="flex size-12 items-center justify-center rounded-full bg-ld-secondary-container/40 text-ld-primary">
            <Heart className="size-6 fill-ld-primary" aria-hidden="true" />
          </div>
          <h2 className="font-display text-ld-headline-xl-mobile text-ld-on-surface md:text-ld-headline-xl">
            Every love story has little moments worth keeping.
          </h2>
          <p className="max-w-lg text-ld-body-lg text-ld-on-surface-variant">
            Create your private space and start building your story together today.
          </p>
          <div className="flex flex-col items-center gap-4 pt-2 sm:flex-row">
            <Button
              size="lg"
              render={<Link href="/signup" />}
              className="h-auto w-full rounded-full bg-ld-primary px-8 py-3.5 text-ld-label-md text-ld-on-primary shadow-[0_6px_20px_rgba(201,126,139,0.25)] hover:bg-ld-on-primary-fixed-variant sm:w-auto"
            >
              Create Your Space
              <span aria-hidden="true">→</span>
            </Button>
          </div>
          <p className="pt-2 text-ld-caption text-ld-outline">Your little world is waiting.</p>
        </div>
      </div>
    </section>
  );
}


/* ---------------- Family and loved ones ---------------- */

const FAMILY_POINTS: { icon: LucideIcon; title: string; body: string }[] = [
  {
    icon: Heart,
    title: "Two partners, always",
    body: "Your space starts as a private place for you and your partner. That is the heart of TaleTwo.",
  },
  {
    icon: Users,
    title: "Room for family, if you want it",
    body: "Invite the family members you trust to share parts of your space, such as photos or a family album.",
  },
  {
    icon: ShieldCheck,
    title: "You decide who is in",
    body: "Nobody joins unless you invite them, and you can remove someone at any time.",
  },
];

export function FamilySection() {
  return (
    <LandingSection id="family" className="py-20 md:py-24">
      <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-12">
        <div className="flex flex-col gap-4 lg:col-span-5">
          <span className="text-ld-label-sm font-semibold uppercase tracking-widest text-ld-primary">Family &amp; loved ones</span>
          <h2 className="font-display text-ld-headline-xl-mobile text-ld-on-surface md:text-ld-headline-lg">
            Built for two, open to the people you love.
          </h2>
          <p className="text-ld-body-md text-ld-on-surface-variant">
            TaleTwo is first a private space for a couple. When you are ready, you can also make room for family.
          </p>
          <LandingPhoto photo="familyTable" className="mt-2 aspect-[4/3] w-full shadow-sm" />

        </div>
        <ul className="flex flex-col gap-4 lg:col-span-7">
          {FAMILY_POINTS.map((point) => (
            <li key={point.title} className="flex items-start gap-4 rounded-2xl bg-ld-surface-container-lowest p-5 shadow-sm">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-ld-secondary-container/40 text-ld-primary">
                <point.icon className="size-5" aria-hidden="true" />
              </span>
              <div>
                <h3 className="text-ld-title-md font-semibold text-ld-on-surface">{point.title}</h3>
                <p className="mt-1 text-ld-body-sm text-ld-on-surface-variant">{point.body}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </LandingSection>
  );
}
