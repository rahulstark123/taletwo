import { z } from "zod";

export const NOTE_COLORS = ["ROSE", "SAND", "SAGE", "LAVENDER", "CREAM"] as const;
export type NoteColorValue = (typeof NOTE_COLORS)[number];

export const NOTE_TITLE_MAX = 120;
export const NOTE_BODY_MAX = 5000;

const noteFields = {
  title: z
    .string()
    .trim()
    .max(NOTE_TITLE_MAX, `Keep the title under ${NOTE_TITLE_MAX} characters.`),
  body: z
    .string()
    .max(NOTE_BODY_MAX, `Keep the note under ${NOTE_BODY_MAX} characters.`),
  color: z.enum(NOTE_COLORS, { message: "Please choose a colour." }),
  pinned: z.boolean(),
};

/** A note needs a title or some text. Both can be blank only when the note is empty. */
export const createNoteSchema = z
  .object({
    title: noteFields.title.default(""),
    body: noteFields.body.default(""),
    color: noteFields.color.default("ROSE"),
    pinned: noteFields.pinned.default(false),
  })
  .refine((n) => n.title.length > 0 || n.body.trim().length > 0, {
    message: "Write a title or a few words to save this note.",
    path: ["body"],
  });

export const updateNoteSchema = z
  .object({
    title: noteFields.title.optional(),
    body: noteFields.body.optional(),
    color: noteFields.color.optional(),
    pinned: noteFields.pinned.optional(),
  })
  .refine((n) => Object.keys(n).length > 0, { message: "Nothing to update." });

export type CreateNoteInput = z.infer<typeof createNoteSchema>;
export type UpdateNoteInput = z.infer<typeof updateNoteSchema>;
