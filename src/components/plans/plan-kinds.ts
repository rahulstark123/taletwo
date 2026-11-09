import { Plane, Sparkles, Tent, Ticket, Users, Wine, type LucideIcon } from "lucide-react";
import type { PlanKindValue, PlanAudienceValue, PlanStatusValue } from "@/lib/validations/plans";

export const KIND_STYLES: Record<PlanKindValue, { label: string; short: string; icon: LucideIcon; cover: string; hint: string }> = {
  DATE_NIGHT: { label: "Date night", short: "Date night", icon: Wine, cover: "from-ld-secondary-container via-[#fbe3e6] to-ld-surface-container", hint: "An evening just for the two of you" },
  TRIP: { label: "Trip", short: "Trip", icon: Plane, cover: "from-[#dfe9f3] via-ld-surface-container to-[#f4efe6]", hint: "Somewhere new, together" },
  WEEKEND: { label: "Weekend", short: "Weekend", icon: Tent, cover: "from-ld-tertiary-fixed via-ld-surface-container to-ld-surface", hint: "Two days to slow down" },
  EXPERIENCE: { label: "Experience", short: "Experience", icon: Ticket, cover: "from-[#ebe3f2] via-ld-surface-container to-ld-surface", hint: "A class, a show, something to remember" },
  FAMILY_GATHERING: { label: "Family gathering", short: "Family", icon: Users, cover: "from-ld-secondary-container/70 via-ld-tertiary-fixed/50 to-ld-surface-container", hint: "Dinner, a birthday, a celebration with everyone" },
  OTHER: { label: "Something else", short: "Other", icon: Sparkles, cover: "from-ld-surface-container-high via-ld-surface-container to-ld-surface", hint: "Anything you dream up" },
};

export const KIND_ORDER: PlanKindValue[] = ["DATE_NIGHT", "TRIP", "WEEKEND", "EXPERIENCE", "FAMILY_GATHERING", "OTHER"];

export const AUDIENCE_LABEL: Record<PlanAudienceValue, string> = {
  COUPLE: "Just us",
  FAMILY: "Family circle",
};

export const STATUS_LABEL: Record<PlanStatusValue, string> = {
  IDEA: "Idea",
  PLANNED: "Planned",
  DONE: "Done",
};

