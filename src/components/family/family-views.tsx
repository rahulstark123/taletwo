import { CalendarHeart, Images, MapPin, ShieldCheck, Users } from "lucide-react";
import { HomeCard } from "@/components/home/home-cards";
import { devCouple } from "@/fixtures/dev-dashboard";
import { devFamilyAlbum, devFamilyMembers, devFamilyPlans } from "@/fixtures/dev-family";
import { FAMILY_ROLES } from "@/lib/validations/family";
import { formatDate } from "@/lib/dates";
import { cn } from "@/lib/utils";

const TIMEZONE = devCouple.timezone;

export function FamilyMembersCard() {
  return (
    <HomeCard id="family-members" title="Your circle" eyebrow="Core couple and family" className="bg-ld-surface-container">
      <ul className="flex flex-col gap-3">
        <li className="flex items-center gap-3 rounded-2xl bg-ld-surface-container-lowest p-3.5">
          <span className="flex size-10 items-center justify-center rounded-full bg-ld-secondary-container text-ld-label-md font-semibold text-ld-on-secondary-container">
            {devCouple.me.initials}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-ld-body-sm font-semibold text-ld-on-surface">{devCouple.me.displayName}</p>
            <p className="text-ld-caption text-ld-on-surface-variant">Partner · full access</p>
          </div>
        </li>
        <li className="flex items-center gap-3 rounded-2xl bg-ld-surface-container-lowest p-3.5">
          <span className="flex size-10 items-center justify-center rounded-full bg-ld-tertiary-fixed text-ld-label-md font-semibold text-ld-on-tertiary-fixed-variant">
            {devCouple.partner.initials}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-ld-body-sm font-semibold text-ld-on-surface">{devCouple.partner.displayName}</p>
            <p className="text-ld-caption text-ld-on-surface-variant">Partner · full access</p>
          </div>
        </li>
        {devFamilyMembers.map((m) => (
          <li key={m.id} className="flex items-center gap-3 rounded-2xl bg-ld-surface-container-lowest p-3.5">
            <span className="flex size-10 items-center justify-center rounded-full bg-ld-surface-container text-ld-label-md font-semibold text-ld-on-surface">
              {m.name.charAt(0)}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-ld-body-sm font-semibold text-ld-on-surface">
                {m.name} <span className="font-normal text-ld-on-surface-variant">· {m.relationship}</span>
              </p>
              <p className="text-ld-caption text-ld-on-surface-variant">{FAMILY_ROLES[m.role]}</p>
            </div>
            <span
              className={cn(
                "shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-medium",
                m.status === "Joined" ? "bg-ld-tertiary-fixed/40 text-ld-tertiary" : "bg-ld-secondary-container/50 text-ld-primary"
              )}
            >
              {m.status}
            </span>
          </li>
        ))}
      </ul>
    </HomeCard>
  );
}

export function FamilyPrivacyCard() {
  const points = [
    "Couple-only by default. Notes, letters and daily answers never reach family.",
    "Family sees only the items a partner marks as shared with family.",
    "Partners can change roles or remove a family member at any time.",
  ];
  return (
    <HomeCard
      id="family-privacy"
      title="What family can see"
      eyebrow="Your rules"
      action={<ShieldCheck className="size-5 text-ld-tertiary" aria-hidden="true" />}
    >
      <ul className="flex flex-col gap-3">
        {points.map((p) => (
          <li key={p} className="flex gap-3 text-ld-body-sm text-ld-on-surface-variant">
            <span className="mt-2 size-1.5 shrink-0 rounded-full bg-ld-primary" aria-hidden="true" />
            {p}
          </li>
        ))}
      </ul>
    </HomeCard>
  );
}

export function FamilyPlansCard() {
  return (
    <HomeCard
      id="family-plans"
      title="Family plans"
      eyebrow="Together, with everyone"
      action={<Users className="size-5 text-ld-primary" aria-hidden="true" />}
    >
      <ul className="flex flex-col gap-3">
        {devFamilyPlans.map((p) => (
          <li
            key={p.id}
            className="flex flex-col gap-3 rounded-2xl bg-ld-surface-container-low p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="min-w-0 space-y-1">
              <p className="text-ld-body-md font-semibold text-ld-on-surface">{p.title}</p>
              <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-ld-caption text-ld-on-surface-variant">
                <CalendarHeart className="size-3.5" aria-hidden="true" />
                {formatDate(
                  new Date(p.when),
                  { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" },
                  TIMEZONE
                )}
                {p.place && (
                  <>
                    <span aria-hidden="true">·</span>
                    <MapPin className="size-3.5" aria-hidden="true" />
                    {p.place}
                  </>
                )}
              </p>
              <p className="text-ld-caption text-ld-on-surface-variant">
                {p.going} of {p.invited} going
              </p>
            </div>
            <span
              className={cn(
                "shrink-0 self-start rounded-full px-3 py-1 text-ld-caption font-medium sm:self-center",
                p.yourRsvp === "Going"
                  ? "bg-ld-tertiary-fixed/40 text-ld-tertiary"
                  : "bg-ld-surface-container text-ld-on-surface-variant"
              )}
            >
              You: {p.yourRsvp}
            </span>
          </li>
        ))}
      </ul>
    </HomeCard>
  );
}

const TILE = {
  rose: "from-ld-secondary-container to-ld-surface-container",
  sage: "from-ld-tertiary-fixed to-ld-surface-container",
} as const;

export function FamilyAlbumCard() {
  return (
    <HomeCard
      id="family-album"
      title="Family album"
      eyebrow="Shared with family"
      action={<Images className="size-5 text-ld-primary" aria-hidden="true" />}
    >
      <ul className="grid gap-4 sm:grid-cols-2">
        {devFamilyAlbum.map((a) => (
          <li key={a.id} className="space-y-3">
            <div className={cn("relative aspect-[4/3] overflow-hidden rounded-2xl bg-gradient-to-br", TILE[a.tone])}>
              <span className="absolute bottom-2 left-2 rounded-full bg-ld-surface/90 px-2.5 py-1 text-[11px] text-ld-on-surface">
                {a.photos} photos
              </span>
            </div>
            <div>
              <p className="text-ld-body-sm font-semibold text-ld-on-surface">{a.title}</p>
              <p className="text-ld-caption text-ld-on-surface-variant">
                {formatDate(new Date(a.date), { day: "numeric", month: "short", year: "numeric" }, "UTC")}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </HomeCard>
  );
}
