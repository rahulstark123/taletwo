import { z } from "zod";

/** Base64 text (salt, sealed content). Checked by shape, not by content, because the server cannot read it. */
const base64 = /^[A-Za-z0-9+/]+={0,2}$/;

export const createConfessionSchema = z.object({
  shared: z.boolean(),
  salt: z.string().min(16).max(64).regex(base64, "The confession could not be saved. Please try again."),
  label: z.string().trim().min(1, "Give the confession a card title.").max(80, "Keep the card title under 80 characters."),
  sealed: z.string().min(1).max(200_000).regex(base64, "The confession could not be saved. Please try again."),
  audioPath: z.string().max(512).optional(),
});

export type CreateConfessionInput = z.infer<typeof createConfessionSchema>;
