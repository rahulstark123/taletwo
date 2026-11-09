import type { Metadata } from "next";
import { Clapperboard, Film, MessageCircleHeart, Sparkles, Tv, Users } from "lucide-react";

export const metadata: Metadata = {
  title: "Party Room",
  robots: { index: false, follow: false },
};

const COMING = [
  { icon: Tv, title: "Watch together", body: "Open a YouTube video and play it in sync for both of you, so you press play and pause together." },
  { icon: Film, title: "Movie nights, long distance", body: "Watch a film side by side even when you are in different cities or countries." },
  { icon: MessageCircleHeart, title: "Chat as you watch", body: "Send quick reactions and short messages while the video plays, without leaving the room." },
  { icon: Users, title: "Private, for two", body: "Only the two partners in your space can join a room. Nobody else can see or enter it." },
];

/** The Party Room is planned but not released yet, so this page explains what is coming. */
export default function PartyRoomPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-10">
      <section aria-labelledby="party-soon" className="relative overflow-hidden rounded-3xl bg-ld-surface-container-lowest px-6 py-14 text-center shadow-sm sm:px-12">
        <div aria-hidden="true" className="pointer-events-none absolute -left-16 -top-16 size-64 rounded-full bg-ld-secondary-container/40 blur-3xl" />
        <div aria-hidden="true" className="pointer-events-none absolute -bottom-20 -right-10 size-64 rounded-full bg-ld-tertiary-fixed/50 blur-3xl" />
        <div className="relative flex flex-col items-center gap-5">
          <span className="inline-flex items-center gap-2 rounded-full bg-ld-tertiary-fixed/60 px-4 py-1.5 text-ld-label-sm font-semibold text-ld-on-tertiary-fixed-variant">
            <Sparkles className="size-4" aria-hidden="true" />
            Coming soon
          </span>
          <span className="flex size-16 items-center justify-center rounded-full bg-ld-secondary-container/50 text-ld-primary">
            <Clapperboard className="size-7" aria-hidden="true" />
          </span>
          <div className="space-y-3">
            <h1 id="party-soon" className="font-display text-ld-headline-xl-mobile text-ld-on-surface md:text-ld-headline-lg">
              Your Party Room is on its way.
            </h1>
            <p className="mx-auto max-w-xl text-ld-body-md text-ld-on-surface-variant">
              Watch a film or a video together, even when you are far apart. Press play at the same moment and talk through the scenes as they happen.
            </p>
          </div>
        </div>
      </section>

      <section aria-labelledby="party-what" className="space-y-5">
        <h2 id="party-what" className="font-display text-ld-headline-md text-ld-on-surface">What is coming</h2>
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
