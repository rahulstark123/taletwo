import { z } from "zod";

export const PLAN_KINDS = ["DATE_NIGHT", "TRIP", "WEEKEND", "EXPERIENCE", "FAMILY_GATHERING", "OTHER"] as const;
export const PLAN_AUDIENCES = ["COUPLE", "FAMILY"] as const;
export const PLAN_STATUSES = ["IDEA", "PLANNED", "DONE"] as const;

export type PlanKindValue = (typeof PLAN_KINDS)[number];
export type PlanAudienceValue = (typeof PLAN_AUDIENCES)[number];
export type PlanStatusValue = (typeof PLAN_STATUSES)[number];

/** Budget is entered in rupees and stored in paise. Up to ₹1,00,00,000. */
const MAX_BUDGET_RUPEES = 10_000_000;

export const checklistItemSchema = z.object({
  id: z.string().min(1).max(64),
  text: z.string().trim().min(1, "Checklist items cannot be empty.").max(120, "Keep checklist items under 120 characters."),
  done: z.boolean(),
});

const planFields = {
  title: z.string().trim().min(2, "Give the plan a short title.").max(120, "Keep the title under 120 characters."),
  description: z.string().max(2000, "Keep the description under 2000 characters.").default(""),
  kind: z.enum(PLAN_KINDS, { message: "Choose what kind of plan this is." }),
  audience: z.enum(PLAN_AUDIENCES, { message: "Choose who this plan is for." }),
  status: z.enum(PLAN_STATUSES, { message: "Choose a status." }),
  startsAt: z
    .string()
    .datetime({ offset: true, message: "Please choose a valid date and time." })
    .nullable(),
  location: z.string().trim().max(120, "Keep the place under 120 characters.").default(""),
  budgetRupees: z
    .number({ message: "Budget must be a number." })
    .int("Budget must be a whole number of rupees.")
    .min(0, "Budget cannot be negative.")
    .max(MAX_BUDGET_RUPEES, "That budget is larger than we can track.")
    .nullable(),
  checklist: z.array(checklistItemSchema).max(30, "Keep checklists to 30 items or fewer.").default([]),
};

export const createPlanSchema = z.object({
  title: planFields.title,
  description: planFields.description,
  kind: planFields.kind,
  audience: planFields.audience.default("COUPLE"),
  status: planFields.status.default("PLANNED"),
  startsAt: planFields.startsAt.default(null),
  location: planFields.location,
  budgetRupees: planFields.budgetRupees.default(null),
  checklist: planFields.checklist,
});

export const updatePlanSchema = z
  .object({
    title: planFields.title.optional(),
    description: planFields.description.optional(),
    kind: planFields.kind.optional(),
    audience: planFields.audience.optional(),
    status: planFields.status.optional(),
    startsAt: planFields.startsAt.optional(),
    location: planFields.location.optional(),
    budgetRupees: planFields.budgetRupees.optional(),
    checklist: planFields.checklist.optional(),
  })
  .refine((p) => Object.keys(p).length > 0, { message: "Nothing to update." });

export const planFilterSchema = z.object({
  status: z.enum(PLAN_STATUSES).optional(),
  kind: z.enum(PLAN_KINDS).optional(),
  audience: z.enum(PLAN_AUDIENCES).optional(),
});

export type CreatePlanInput = z.infer<typeof createPlanSchema>;
export type UpdatePlanInput = z.infer<typeof updatePlanSchema>;
export type PlanFilter = z.infer<typeof planFilterSchema>;
