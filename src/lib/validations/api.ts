import { z } from "zod";
import { COUNTRIES, CURRENCIES } from "@/lib/locale";

const TIMEZONES = (() => {
  try {
    return new Set(Intl.supportedValuesOf("timeZone"));
  } catch {
    return new Set<string>(["UTC"]);
  }
})();

export const updateMeSchema = z.object({
  avatarPath: z
    .string()
    .regex(/^[0-9a-f-]{36}\/[\w.-]+\.(webp|jpe?g|png)$/i, "That photo path is not valid.")
    .nullable()
    .optional(),
  displayName: z
    .string()
    .trim()
    .min(2, "Please enter at least 2 characters for your name.")
    .max(60, "Please keep your name under 60 characters."),
  relationshipStartDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Please use the date format YYYY-MM-DD.")
    .refine((v) => !Number.isNaN(Date.parse(`${v}T00:00:00Z`)), "Please enter a real date.")
    .refine((v) => v <= new Date().toISOString().slice(0, 10), "The start date cannot be in the future.")
    .nullable(),
  country: z.enum(COUNTRIES.map((c) => c.code) as [string, ...string[]]).nullable().optional(),
  currency: z.enum(CURRENCIES.map((c) => c.code) as [string, ...string[]]).nullable().optional(),
  timezone: z
    .string()
    .refine((v) => v === "UTC" || TIMEZONES.has(v), "Please choose a valid timezone.")
    .default("UTC"),
  theme: z.enum(["LIGHT", "DARK", "SYSTEM"]).default("SYSTEM"),
});

export const acceptInviteSchema = z.object({
  code: z
    .string()
    .trim()
    .min(1, "Please enter your invite code.")
    .max(20, "That invite code is not valid. Please check it."),
});
