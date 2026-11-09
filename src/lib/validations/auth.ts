import { z } from "zod";
import { isSpaceCodeShape, normalizeSpaceCode } from "@/lib/space-code";

/** Shared password rules. Server-side checks are repeated in Milestone 2. */
export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 72;

const email = z
  .string()
  .trim()
  .min(1, "Please enter your email address.")
  .max(254, "This email address is too long.")
  .email("Please enter a valid email address.");

const password = z
  .string()
  .min(PASSWORD_MIN_LENGTH, `Use at least ${PASSWORD_MIN_LENGTH} characters.`)
  .max(PASSWORD_MAX_LENGTH, `Use no more than ${PASSWORD_MAX_LENGTH} characters.`)
  .refine((v) => /[A-Za-z]/.test(v) && /\d/.test(v), "Include at least one letter and one number.");

export const loginSchema = z.object({
  email,
  password: z.string().min(1, "Please enter your password."),
});

export const signupSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(2, "Please enter your full name.")
      .max(80, "Please keep your name under 80 characters."),
    email,
    password,
    confirmPassword: z.string().min(1, "Please confirm your password."),
    acceptTerms: z.boolean().refine((v) => v === true, {
      message: "Please accept the Terms and Privacy Policy to continue.",
    }),
    /** Optional: a partner's 6-character space code, to join their space after sign-up. */
    spaceCode: z
      .string()
      .trim()
      .refine((v) => v === "" || isSpaceCodeShape(normalizeSpaceCode(v)), "Space codes are 6 characters, like 7KQ2MA.")
      .optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match.",
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;

export type PasswordStrength = {
  score: 0 | 1 | 2 | 3 | 4;
  label: "Too short" | "Weak" | "Fair" | "Good" | "Strong";
  hints: string[];
};

/** Lightweight guidance only. It never blocks submission beyond the schema rules. */
export function getPasswordStrength(value: string): PasswordStrength {
  const hints: string[] = [];
  let points = 0;
  if (value.length >= PASSWORD_MIN_LENGTH) points += 1;
  else hints.push(`At least ${PASSWORD_MIN_LENGTH} characters`);
  if (value.length >= 12) points += 1;
  if (/[a-z]/.test(value) && /[A-Z]/.test(value)) points += 1;
  else hints.push("Mix upper and lower case");
  if (/\d/.test(value) && /[^A-Za-z0-9]/.test(value)) points += 1;
  else hints.push("Add a number and a symbol");

  const score = Math.min(points, 4) as PasswordStrength["score"];
  const labels: PasswordStrength["label"][] = ["Too short", "Weak", "Fair", "Good", "Strong"];
  const label = value.length === 0 ? "Too short" : labels[score];
  return { score, label, hints };
}
