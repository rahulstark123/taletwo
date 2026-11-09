import { z } from "zod";
import { CALENDAR_EVENT_KINDS } from "@/lib/calendar-types";
import { REMINDER_OPTIONS } from "@/lib/special-days-types";

const day = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Please use the date format YYYY-MM-DD.");

export const calendarRangeSchema = z
  .object({ from: day, to: day })
  .refine((r) => r.from <= r.to, { message: "The end date must be after the start date." })
  .refine((r) => Date.parse(`${r.to}T00:00:00Z`) - Date.parse(`${r.from}T00:00:00Z`) <= 400 * 86_400_000, {
    message: "Please look at up to about a year at a time.",
  });

const eventFields = {
  title: z.string().trim().min(2, "Give this event a short title.").max(120, "Keep the title under 120 characters."),
  description: z.string().max(2000, "Keep the description under 2000 characters."),
  kind: z.enum(CALENDAR_EVENT_KINDS, { message: "Choose what kind of event this is." }),
  startsAt: z.string().datetime({ offset: true, message: "Please choose a valid date and time." }),
  endsAt: z.string().datetime({ offset: true, message: "Please choose a valid end time." }).nullable(),
  allDay: z.boolean(),
  location: z.string().trim().max(120, "Keep the place under 120 characters."),
  reminder: z.enum(REMINDER_OPTIONS, { message: "Choose a reminder." }),
};

export const createCalendarEventSchema = z
  .object({
    title: eventFields.title,
    description: eventFields.description.default(""),
    kind: eventFields.kind.default("OTHER"),
    startsAt: eventFields.startsAt,
    endsAt: eventFields.endsAt.default(null),
    allDay: eventFields.allDay.default(false),
    location: eventFields.location.default(""),
    reminder: eventFields.reminder.default("NONE"),
  })
  .refine((e) => !e.endsAt || Date.parse(e.endsAt) >= Date.parse(e.startsAt), {
    message: "The end time must be after the start time.",
    path: ["endsAt"],
  });

export const updateCalendarEventSchema = z
  .object({
    title: eventFields.title.optional(),
    description: eventFields.description.optional(),
    kind: eventFields.kind.optional(),
    startsAt: eventFields.startsAt.optional(),
    endsAt: eventFields.endsAt.optional(),
    allDay: eventFields.allDay.optional(),
    location: eventFields.location.optional(),
    reminder: eventFields.reminder.optional(),
  })
  .refine((v) => Object.keys(v).length > 0, { message: "Nothing to update." });

export type CreateCalendarEventInput = z.infer<typeof createCalendarEventSchema>;
export type UpdateCalendarEventInput = z.infer<typeof updateCalendarEventSchema>;
