import { Compass, Map as MapIcon, Mountain, PartyPopper, Sparkles, Utensils, type LucideIcon } from "lucide-react";
import type { BucketCategoryValue, BucketPriorityValue } from "@/lib/validations/bucket";

export const CATEGORY_STYLES: Record<BucketCategoryValue, { label: string; icon: LucideIcon; cover: string; hint: string }> = {
  TRAVEL: { label: "Travel", icon: MapIcon, cover: "from-[#dfe9f3] via-ld-surface-container to-[#f4efe6]", hint: "Places to see together" },
  FOOD: { label: "Food", icon: Utensils, cover: "from-[#fbe3c9] via-ld-surface-container to-ld-surface", hint: "Meals to cook or taste" },
  ADVENTURES: { label: "Adventures", icon: Mountain, cover: "from-ld-tertiary-fixed via-ld-surface-container to-ld-surface", hint: "Stretch a little, side by side" },
  EXPERIENCES: { label: "Experiences", icon: Sparkles, cover: "from-ld-secondary-container via-[#fbe3e6] to-ld-surface-container", hint: "Things worth remembering" },
  LIFE_GOALS: { label: "Life goals", icon: Compass, cover: "from-[#ebe3f2] via-ld-surface-container to-ld-surface", hint: "The bigger plans for your life" },
  FUN_ACTIVITIES: { label: "Fun", icon: PartyPopper, cover: "from-ld-surface-container-high via-ld-secondary-container/40 to-ld-surface", hint: "Silly, joyful, low-effort wins" },
};

export const CATEGORY_ORDER: BucketCategoryValue[] = ["TRAVEL", "FOOD", "ADVENTURES", "EXPERIENCES", "LIFE_GOALS", "FUN_ACTIVITIES"];

export const PRIORITY_STYLES: Record<BucketPriorityValue, { label: string; className: string }> = {
  MUST: { label: "Must do", className: "bg-ld-primary text-ld-on-primary" },
  SOON: { label: "Soon", className: "bg-ld-secondary-container text-ld-on-secondary-container" },
  SOMEDAY: { label: "Someday", className: "bg-ld-surface-container text-ld-on-surface-variant" },
};

