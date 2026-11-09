import { Cake, CalendarHeart, Home, Map as MapIcon, Sparkles, Users, Utensils, type LucideIcon } from "lucide-react";
import type { MemoryCategoryValue } from "@/lib/validations/memories";

export const MEMORY_CATEGORY_STYLES: Record<MemoryCategoryValue, { label: string; icon: LucideIcon; tint: string }> = {
  MILESTONE: { label: "Milestone", icon: CalendarHeart, tint: "bg-ld-secondary-container/60 text-ld-on-secondary-container" },
  TRAVEL: { label: "Travel", icon: MapIcon, tint: "bg-[#dfe9f3] text-[#2f4a63]" },
  FOOD: { label: "Food", icon: Utensils, tint: "bg-[#fbe3c9] text-[#6b4620]" },
  EVERYDAY: { label: "Everyday", icon: Home, tint: "bg-ld-surface-container text-ld-on-surface-variant" },
  CELEBRATION: { label: "Celebration", icon: Cake, tint: "bg-ld-primary-container/30 text-ld-on-primary-container" },
  FAMILY: { label: "Family", icon: Users, tint: "bg-ld-tertiary-fixed text-ld-on-tertiary-fixed-variant" },
  OTHER: { label: "Other", icon: Sparkles, tint: "bg-[#ebe3f2] text-[#4e3a63]" },
};

export const MEMORY_CATEGORY_ORDER: MemoryCategoryValue[] = ["MILESTONE", "TRAVEL", "FOOD", "EVERYDAY", "CELEBRATION", "FAMILY", "OTHER"];

