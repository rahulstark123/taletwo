import { CalendarHeart, Gift, HeartHandshake, Plane, Smile, Sparkles, type LucideIcon } from "lucide-react";
import type { ReminderValue, SpecialDayKindValue } from "@/lib/special-days-types";

export const KIND_STYLES: Record<SpecialDayKindValue, { label: string; short: string; icon: LucideIcon; cover: string; hint: string }> = {
  RELATIONSHIP_ANNIVERSARY: { label: "Relationship anniversary", short: "Anniversary", icon: CalendarHeart, cover: "from-ld-secondary-container via-[#fbe3e6] to-ld-surface-container", hint: "The day your story began" },
  WEDDING_ANNIVERSARY: { label: "Wedding anniversary", short: "Wedding", icon: HeartHandshake, cover: "from-[#f5ead7] via-ld-surface-container to-ld-surface", hint: "The day you said yes" },
  BIRTHDAY: { label: "Birthday", short: "Birthday", icon: Gift, cover: "from-ld-tertiary-fixed via-ld-surface-container to-ld-surface", hint: "Someone worth celebrating" },
  FIRST_MEETING: { label: "First meeting", short: "First meeting", icon: Smile, cover: "from-[#dfe9f3] via-ld-surface-container to-[#f4efe6]", hint: "Where it all started" },
  FIRST_DATE: { label: "First date", short: "First date", icon: Plane, cover: "from-[#ebe3f2] via-ld-surface-container to-ld-surface", hint: "The nervous, lovely beginning" },
  CUSTOM: { label: "Something else", short: "Custom", icon: Sparkles, cover: "from-ld-surface-container-high via-ld-surface-container to-ld-surface", hint: "A day only you two understand" },
};

export const KIND_ORDER: SpecialDayKindValue[] = ["RELATIONSHIP_ANNIVERSARY", "WEDDING_ANNIVERSARY", "BIRTHDAY", "FIRST_MEETING", "FIRST_DATE", "CUSTOM"];

export const REMINDER_LABEL: Record<ReminderValue, string> = {
  NONE: "No reminder",
  ON_DAY: "On the day",
  DAY_BEFORE: "The day before",
  WEEK_BEFORE: "A week before",
};
