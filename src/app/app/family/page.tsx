import type { Metadata } from "next";
import { CalendarHeart, Images, ShieldCheck, Sparkles, Users } from "lucide-react";

export const metadata: Metadata = {
  title: "Family",
  robots: { index: false, follow: false },
};

const COMING = [
  { icon: Users, title: "Invite family you trust", body: "Add parents, siblings or close friends. Nobody joins unless you invite them." },
  { icon: CalendarHeart, title: "Plan things together", body: "Family dinners, birthdays and gatherings, with an RSVP for everyone." },
  { icon: Images, title: "A shared family album", body: "Keep a few family moments in one place, shared only with the people you choose." },
  { icon: ShieldCheck, title: "You stay in control", body: "Change roles or remove someone at any time. Your private notes never leave your couple space." },
];

/** Family is planned but not released yet, so this page shows what is coming instead of unfinished forms. */
export default function FamilyPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-10">
      <section aria-labelledby="family-soon" className="relative overflow-hidden rounded-3xl bg-ld-surface-container-lowest px-6 py-14 text-center shadow-sm sm:px-12">
        <div aria-hidden="true" className="pointer-events-none absolute -left-16 -top-16 size-64 rounded-full bg-ld-secondary-container/40 blur-3xl" />
        <div aria-hidden="true" className="pointer-events-none absolute -bottom-20 -right-10 size-64 rounded-full bg-ld-tertiary-fixed/50 blur-3xl" />
        <div className="relative flex flex-col items-center gap-5">
          <span className="inline-flex items-center gap-2 rounded-full bg-ld-tertiary-fixed/60 px-4 py-1.5 text-ld-label-sm font-semibold text-ld-on-tertiary-fixed-variant">
            <Sparkles className="size-4" aria-hidden="true" />
            Coming soon
          </span>
          <span className="flex size-16 items-center justify-center rounded-full bg-ld-secondary-container/50 text-ld-primary">
            <Users className="size-7" aria-hidden="true" />
          </span>
          <div className="space-y-3">
            <h1 id="family-soon" className="font-display text-ld-headline-xl-mobile text-ld-on-surface md:text-ld-headline-lg">
              Your family circle is on its way.
            </h1>
            <p className="mx-auto max-w-xl text-ld-body-md text-ld-on-surface-variant">
              TaleTwo starts with the two of you. Family is the next step, so the people who matter most can share in the little moments too.
            </p>
          </div>
        </div>
      </section>

      <section aria-labelledby="family-what" className="space-y-5">
        <h2 id="family-what" className="font-display text-ld-headline-md text-ld-on-surface">What is coming</h2>
        <ul className="grid gap-4 sm:grid-cols-2">
          {COMING.map((item) => (
            <li key={item.title} className="flex gap-4 rounded-3xl bg-ld-surface-container-lowest p-6 shadow-sm">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-ld-secondary-container/40 text-ld-primary">
                <item.icon className="size-5" aria-hidden="true" />
              </span>
              <div className="space-y-1">
                <h3 className="text-ld-title-md font-semibold text-ld-on-surface">{item.title}</h3>
                <p className="text-ld-body-sm text-ld-on-surface-variant">{item.body}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
