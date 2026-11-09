import { z } from "zod";

/** Who a family member is to the couple. Used for labels only; it grants no access by itself. */
export const FAMILY_RELATIONSHIPS = [
  "Parent",
  "Sibling",
  "Grandparent",
  "Child",
  "Aunt or uncle",
  "Cousin",
  "Close friend",
  "Other",
] as const;

/**
 * What an invited family member can do. Product rule: family members never see
 * couple-only content (notes, letters, daily answers). They only see items a
 * partner explicitly marks "Family".
 */
export const FAMILY_ROLES = {
  viewer: "View shared items",
  contributor: "View and add to family plans",
} as const;

export const inviteFamilySchema = z.object({
  name: z.string().trim().min(2, "Please enter their name.").max(60, "Please keep the name under 60 characters."),
  email: z
    .string()
    .trim()
    .max(254, "This email address is too long.")
    .refine((v) => v === "" || z.email().safeParse(v).success, "Please enter a valid email address or leave it blank."),
  relationship: z.enum(FAMILY_RELATIONSHIPS, { message: "Please choose how they are related to you." }),
  role: z.enum(["viewer", "contributor"], { message: "Please choose what they can do." }),
});

export const familyPlanSchema = z.object({
  title: z.string().trim().min(3, "Give the plan a short title.").max(80, "Please keep the title under 80 characters."),
  when: z
    .string()
    .min(1, "Please choose a date and time.")
    .refine((v) => !Number.isNaN(Date.parse(v)), "Please choose a valid date and time."),
  place: z.string().trim().max(80, "Please keep the place under 80 characters.").optional().default(""),
  notes: z.string().trim().max(500, "Please keep the notes under 500 characters.").optional().default(""),
});

export type InviteFamilyInput = z.infer<typeof inviteFamilySchema>;
export type FamilyPlanInput = z.input<typeof familyPlanSchema>;
