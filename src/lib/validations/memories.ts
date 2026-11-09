import { z } from "zod";

export const MEMORY_CATEGORIES = ["MILESTONE", "TRAVEL", "FOOD", "EVERYDAY", "CELEBRATION", "FAMILY", "OTHER"] as const;
export type MemoryCategoryValue = (typeof MEMORY_CATEGORIES)[number];

export const MEMORY_MAX_PHOTOS = 10;
// Stored photos are compressed in the browser to about 0.5 MB; 3 MB is the hard ceiling after compression.
export const MEMORY_MAX_BYTES = 3 * 1024 * 1024;
// Largest original a user can pick before compression (camera files are often 5-12 MB).
export const MEMORY_ORIGINAL_MAX_BYTES = 25 * 1024 * 1024;
export const MEMORY_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
export const MEMORY_MAX_TAGS = 8;

const uuid = z.string().uuid("This memory id is not valid.");
const dateOnly = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Please use the date format YYYY-MM-DD.")
  .refine((v) => !Number.isNaN(Date.parse(`${v}T00:00:00Z`)), "Please enter a real date.")
  .refine((v) => v <= new Date().toISOString().slice(0, 10), "A memory cannot be dated in the future.");

/** A photo already uploaded to private storage by the browser. The server checks the path belongs to this workspace and memory. */
export const uploadedMediaSchema = z.object({
  path: z
    .string()
    .regex(/^\d+\/[0-9a-f-]{36}\/[0-9a-f-]{36}\.(jpg|jpeg|png|webp)$/i, "That photo path is not valid."),
  mimeType: z.enum(MEMORY_MIME_TYPES),
  sizeBytes: z.number().int().positive().max(MEMORY_MAX_BYTES, "Each photo must be 3 MB or smaller after compression."),
});

const fields = {
  title: z.string().trim().min(2, "Give this memory a short title.").max(120, "Keep the title under 120 characters."),
  caption: z.string().max(2000, "Keep the story under 2000 characters."),
  memoryDate: dateOnly,
  location: z.string().trim().max(120, "Keep the place under 120 characters."),
  category: z.enum(MEMORY_CATEGORIES, { message: "Choose a category." }),
  tags: z
    .array(z.string().trim().min(1).max(24, "Keep each tag under 24 characters."))
    .max(MEMORY_MAX_TAGS, `Use up to ${MEMORY_MAX_TAGS} tags.`),
  favourite: z.boolean(),
};

export const createMemorySchema = z.object({
  id: uuid,
  title: fields.title,
  caption: fields.caption.default(""),
  memoryDate: fields.memoryDate,
  location: fields.location.default(""),
  category: fields.category.default("EVERYDAY"),
  tags: fields.tags.default([]),
  favourite: fields.favourite.default(false),
  media: z.array(uploadedMediaSchema).min(1, "Add at least one photo.").max(MEMORY_MAX_PHOTOS, `Add up to ${MEMORY_MAX_PHOTOS} photos.`),
});

export const updateMemorySchema = z
  .object({
    title: fields.title.optional(),
    caption: fields.caption.optional(),
    memoryDate: fields.memoryDate.optional(),
    location: fields.location.optional(),
    category: fields.category.optional(),
    tags: fields.tags.optional(),
    favourite: fields.favourite.optional(),
    addMedia: z.array(uploadedMediaSchema).max(MEMORY_MAX_PHOTOS).optional(),
    removeMediaIds: z.array(uuid).max(MEMORY_MAX_PHOTOS).optional(),
  })
  .refine((v) => Object.keys(v).length > 0, { message: "Nothing to update." });

export const memoryFilterSchema = z.object({
  category: z.enum(MEMORY_CATEGORIES).optional(),
  favourite: z.enum(["true"]).optional(),
  year: z.string().regex(/^\d{4}$/).optional(),
  q: z.string().max(80).optional(),
});

export type CreateMemoryInput = z.infer<typeof createMemorySchema>;
export type UpdateMemoryInput = z.infer<typeof updateMemorySchema>;
export type MemoryFilter = z.infer<typeof memoryFilterSchema>;
export type UploadedMedia = z.infer<typeof uploadedMediaSchema>;
