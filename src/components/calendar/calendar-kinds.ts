import { CalendarDays, Cake, Gift, Heart, Plane, Sparkles, Target, Users, Utensils, type LucideIcon } from "lucide-react";

/** One colour family per kind of thing on the calendar. Colours come from the brand palette. */
export const COLOR_CLASS = {
  rose: "bg-ld-secondary-container/70 text-ld-on-secondary-container",
  sage: "bg-ld-tertiary-fixed/80 text-ld-on-tertiary-fixed-variant",
  lavender: "bg-[#ebe3f2] text-[#4e3a63]",
  sky: "bg-[#dfe9f3] text-[#2f4a63]",
  peach: "bg-[#fbe3c9] text-[#6b4620]",
  cream: "bg-ld-surface-container-high text-ld-on-surface",
  stone: "bg-ld-surface-container text-ld-on-surface-variant",
} as const;

export type ColorKey = keyof typeof COLOR_CLASS;

export const KIND_LOOK: Record<string, { label: string; color: ColorKey; icon: LucideIcon }> = {
  // Custom calendar events
  DATE_NIGHT: { label: "Date night", color: "rose", icon: Heart },
  FAMILY: { label: "Family", color: "sage", icon: Users },
  REMINDER: { label: "Reminder", color: "lavender", icon: CalendarDays },
  OTHER: { label: "Event", color: "stone", icon: Sparkles },
  // Plans
  TRIP: { label: "Trip", color: "sky", icon: Plane },
  WEEKEND: { label: "Weekend", color: "sage", icon: CalendarDays },
  EXPERIENCE: { label: "Experience", color: "lavender", icon: Sparkles },
  FAMILY_GATHERING: { label: "Family gathering", color: "sage", icon: Users },
  // Special days
  RELATIONSHIP_ANNIVERSARY: { label: "Anniversary", color: "rose", icon: Heart },
  WEDDING_ANNIVERSARY: { label: "Wedding anniversary", color: "rose", icon: Heart },
  BIRTHDAY: { label: "Birthday", color: "peach", icon: Cake },
  FIRST_MEETING: { label: "First meeting", color: "sky", icon: Gift },
  FIRST_DATE: { label: "First date", color: "lavender", icon: Heart },
  CUSTOM: { label: "Special day", color: "cream", icon: Gift },
  // Bucket list
  BUCKET: { label: "Dream target", color: "peach", icon: Target },
};

export const SOURCE_LABEL: Record<string, string> = {
  EVENT: "Event",
  PLAN: "Plan",
  SPECIAL_DAY: "Special day",
  BUCKET: "Dream",
};

export function lookFor(kind: string) {
  return KIND_LOOK[kind] ?? { label: "Event", color: "stone" as ColorKey, icon: CalendarDays };
}

export { Utensils };
