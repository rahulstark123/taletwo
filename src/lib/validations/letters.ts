import { z } from "zod";
import { LETTER_BODY_MAX, LETTER_OCCASIONS, LETTER_PAPERS, LETTER_TITLE_MAX } from "@/lib/letters-types";

/** A scheduled letter must open at least five minutes from now and within two years. */
const MIN_LEAD_MS = 5 * 60_000;
const MAX_LEAD_MS = 2 * 365 * 24 * 60 * 60_000;

const letterFields = {
  title: z.string().trim().max(LETTER_TITLE_MAX, `Keep the title under ${LETTER_TITLE_MAX} characters.`),
  body: z.string().max(LETTER_BODY_MAX, `Keep the letter under ${LETTER_BODY_MAX} characters.`),
  occasion: z.enum(LETTER_OCCASIONS, { message: "Please choose an occasion." }),
  paper: z.enum(LETTER_PAPERS, { message: "Please choose a paper." }),
  delivery: z.enum(["now", "schedule", "draft"], { message: "Please choose how to deliver it." }),
  opensAt: z.string().datetime({ offset: true }).nullable(),
};

function checkLetter(
  value: { title: string; body: string; delivery: "now" | "schedule" | "draft"; opensAt: string | null },
  ctx: z.RefinementCtx
) {
  if (value.delivery !== "draft" && value.body.trim().length === 0) {
    ctx.addIssue({ code: "custom", message: "Write a few words before sending. Drafts can stay empty.", path: ["body"] });
  }
  if (value.delivery === "schedule") {
    const at = value.opensAt ? new Date(value.opensAt).getTime() : NaN;
    const now = Date.now();
    if (!Number.isFinite(at) || at < now + MIN_LEAD_MS) {
      ctx.addIssue({ code: "custom", message: "Pick a time at least five minutes from now.", path: ["opensAt"] });
    } else if (at > now + MAX_LEAD_MS) {
      ctx.addIssue({ code: "custom", message: "Scheduled letters can open up to two years from now.", path: ["opensAt"] });
    }
  }
}

export const createLetterSchema = z
  .object({
    ...letterFields,
    title: letterFields.title.default(""),
    body: letterFields.body.default(""),
    occasion: letterFields.occasion.default("Just because"),
    paper: letterFields.paper.default("CREAM"),
    delivery: letterFields.delivery.default("now"),
    opensAt: letterFields.opensAt.default(null),
  })
  .superRefine(checkLetter);

/** Editing a draft or a scheduled letter. Every field is optional, but the result must still make sense. */
export const updateLetterSchema = z
  .object({
    title: letterFields.title.optional(),
    body: letterFields.body.optional(),
    occasion: letterFields.occasion.optional(),
    paper: letterFields.paper.optional(),
    delivery: letterFields.delivery.optional(),
    opensAt: letterFields.opensAt.optional(),
  })
  .refine((v) => Object.keys(v).length > 0, { message: "Nothing to update." });

export type CreateLetterInput = z.infer<typeof createLetterSchema>;
export type UpdateLetterInput = z.infer<typeof updateLetterSchema>;
