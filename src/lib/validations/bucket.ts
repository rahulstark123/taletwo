import { z } from "zod";

export const BUCKET_CATEGORIES = ["TRAVEL", "FOOD", "ADVENTURES", "EXPERIENCES", "LIFE_GOALS", "FUN_ACTIVITIES"] as const;
export const BUCKET_PRIORITIES = ["SOMEDAY", "SOON", "MUST"] as const;

export type BucketCategoryValue = (typeof BUCKET_CATEGORIES)[number];
export type BucketPriorityValue = (typeof BUCKET_PRIORITIES)[number];

const dateOnly = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Please use the date format YYYY-MM-DD.")
  .refine((v) => !Number.isNaN(Date.parse(`${v}T00:00:00Z`)), "Please enter a real date.");

const fields = {
  title: z.string().trim().min(2, "Give this dream a short title.").max(120, "Keep the title under 120 characters."),
  description: z.string().max(2000, "Keep the description under 2000 characters."),
  category: z.enum(BUCKET_CATEGORIES, { message: "Choose a category." }),
  priority: z.enum(BUCKET_PRIORITIES, { message: "Choose a priority." }),
  targetDate: dateOnly.nullable(),
};

export const createBucketSchema = z.object({
  title: fields.title,
  description: fields.description.default(""),
  category: fields.category.default("EXPERIENCES"),
  priority: fields.priority.default("SOMEDAY"),
  targetDate: fields.targetDate.default(null),
});

export const updateBucketSchema = z
  .object({
    title: fields.title.optional(),
    description: fields.description.optional(),
    category: fields.category.optional(),
    priority: fields.priority.optional(),
    targetDate: fields.targetDate.optional(),
  })
  .refine((v) => Object.keys(v).length > 0, { message: "Nothing to update." });

/** Marking a dream done records the day it happened and how it went. Undoing clears both. */
export const completeBucketSchema = z.discriminatedUnion("completed", [
  z.object({
    completed: z.literal(true),
    completedOn: dateOnly,
    completionMemory: z.string().trim().max(2000, "Keep the memory under 2000 characters.").default(""),
  }),
  z.object({ completed: z.literal(false) }),
]);

export const bucketFilterSchema = z.object({
  status: z.enum(["PENDING", "COMPLETED"]).optional(),
  category: z.enum(BUCKET_CATEGORIES).optional(),
});

export type CreateBucketInput = z.infer<typeof createBucketSchema>;
export type UpdateBucketInput = z.infer<typeof updateBucketSchema>;
export type CompleteBucketInput = z.infer<typeof completeBucketSchema>;
export type BucketFilter = z.infer<typeof bucketFilterSchema>;
