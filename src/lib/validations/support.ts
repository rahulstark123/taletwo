import { z } from "zod";
import {
  SUPPORT_CATEGORIES,
  SUPPORT_MESSAGE_MAX,
  SUPPORT_PRIORITIES,
  SUPPORT_SUBJECT_MAX,
  SUPPORT_TYPES,
} from "@/lib/support-types";

export const createSupportSchema = z.object({
  type: z.enum(SUPPORT_TYPES, { message: "Choose a ticket or a suggestion." }),
  category: z.enum(SUPPORT_CATEGORIES, { message: "Please choose a category." }),
  priority: z.enum(SUPPORT_PRIORITIES).default("NORMAL"),
  subject: z
    .string()
    .trim()
    .min(4, "Please write a short subject, at least 4 characters.")
    .max(SUPPORT_SUBJECT_MAX, `Keep the subject under ${SUPPORT_SUBJECT_MAX} characters.`),
  message: z
    .string()
    .trim()
    .min(10, "Please describe it in a little more detail, at least 10 characters.")
    .max(SUPPORT_MESSAGE_MAX, `Keep the message under ${SUPPORT_MESSAGE_MAX} characters.`),
});

export type CreateSupportInput = z.infer<typeof createSupportSchema>;
