import { z } from "zod";
import { REMINDER_OPTIONS, SPECIAL_DAY_KINDS } from "@/lib/special-days-types";

const dateOnly = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Please use the date format YYYY-MM-DD.")
  .refine((v) => !Number.isNaN(Date.parse(`${v}T00:00:00Z`)), "Please enter a real date.")
  .refine((v) => v >= "1900-01-01" && v <= "2100-12-31", "Please choose a date between 1900 and 2100.");

const fields = {
  title: z.string().trim().min(2, "Give this day a short name.").max(120, "Keep the name under 120 characters."),
  kind: z.enum(SPECIAL_DAY_KINDS, { message: "Choose what kind of day this is." }),
  eventDate: dateOnly,
  repeatsYearly: z.boolean(),
  reminder: z.enum(REMINDER_OPTIONS, { message: "Choose a reminder." }),
  notes: z.string().max(1000, "Keep the notes under 1000 characters."),
};

export const createSpecialDaySchema = z.object({
  title: fields.title,
  kind: fields.kind.default("CUSTOM"),
  eventDate: fields.eventDate,
  repeatsYearly: fields.repeatsYearly.default(true),
  reminder: fields.reminder.default("WEEK_BEFORE"),
  notes: fields.notes.default(""),
});

export const updateSpecialDaySchema = z
  .object({
    title: fields.title.optional(),
    kind: fields.kind.optional(),
    eventDate: fields.eventDate.optional(),
    repeatsYearly: fields.repeatsYearly.optional(),
    reminder: fields.reminder.optional(),
    notes: fields.notes.optional(),
  })
  .refine((v) => Object.keys(v).length > 0, { message: "Nothing to update." });

export type CreateSpecialDayInput = z.infer<typeof createSpecialDaySchema>;
export type UpdateSpecialDayInput = z.infer<typeof updateSpecialDaySchema>;
