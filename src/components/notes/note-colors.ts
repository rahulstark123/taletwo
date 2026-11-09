import type { NoteColorValue } from "@/lib/validations/notes";

/** Soft, couple-friendly colours for note cards. Each colour has a card fill and a swatch for pickers. */
export const NOTE_COLOR_STYLES: Record<NoteColorValue, { label: string; card: string; swatch: string }> = {
  ROSE: { label: "Rose", card: "bg-ld-secondary-container/55", swatch: "bg-ld-secondary-container" },
  SAND: { label: "Sand", card: "bg-ld-surface-container-high", swatch: "bg-ld-surface-container-highest" },
  SAGE: { label: "Sage", card: "bg-ld-tertiary-fixed/60", swatch: "bg-ld-tertiary-fixed" },
  LAVENDER: { label: "Lavender", card: "bg-[#ebe3f2]", swatch: "bg-[#ebe3f2]" },
  CREAM: { label: "Cream", card: "bg-ld-surface-container-lowest", swatch: "bg-ld-surface-container-lowest" },
};

export const NOTE_COLOR_ORDER: NoteColorValue[] = ["ROSE", "SAND", "SAGE", "LAVENDER", "CREAM"];
