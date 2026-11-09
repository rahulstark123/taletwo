"use server";

import "server-only";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getAppUrl } from "@/config/site";
import { normalizeSpaceCode } from "@/lib/space-code";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { loginSchema, signupSchema, PASSWORD_MIN_LENGTH, PASSWORD_MAX_LENGTH } from "@/lib/validations/auth";
import { recordAuditEvent } from "@/server/services/audit";
import { ensureUserProfile } from "@/server/services/profile";

/** Result shape for forms. Success navigates away, so only errors come back. */
export type AuthActionResult = { error: string } | undefined;

/** Logs the Supabase error code and status only. Never logs the email, password or tokens. */
function logAuthError(action: string, error: { code?: string; status?: number }) {
  console.error(`[auth]  failed`, { code: error.code ?? "unknown", status: error.status ?? null });
}

/** Friendly, specific messages for the Supabase errors a user can act on. */
function signupErrorMessage(code: string | undefined): string {
  switch (code) {
    case "weak_password":
      return "That password is too easy to guess. Try a longer one.";
    case "email_address_invalid":
      return "Please enter an email address that can receive mail.";
    case "over_email_send_rate_limit":
    case "over_request_rate_limit":
      return "Too many sign-up attempts right now. Please wait a few minutes and try again.";
    case "unexpected_failure":
      return "We could not send your confirmation email right now. Please try again in a few minutes.";
    case "email_provider_disabled":
      return "Sign-up by email is not available right now. Please try again later.";
    case "signup_disabled":
      return "New sign-ups are paused at the moment. Please try again later.";
    default:
      return GENERIC_ERROR;
  }
}

const GENERIC_ERROR = "Something went wrong. Please try again in a moment.";
const BAD_CREDENTIALS = "That email and password don't match. Please check and try again.";

const forgotSchema = z.object({
  email: z.email("Please enter a valid email address.").max(254),
});

const resetSchema = z
  .object({
    password: z
      .string()
      .min(PASSWORD_MIN_LENGTH, `Use at least ${PASSWORD_MIN_LENGTH} characters.`)
      .max(PASSWORD_MAX_LENGTH, `Use no more than ${PASSWORD_MAX_LENGTH} characters.`)
      .refine((v) => /[A-Za-z]/.test(v) && /\d/.test(v), "Include at least one letter and one number."),
    confirmPassword: z.string().min(1, "Please confirm your password."),
  })
  .refine((d) => d.password === d.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match.",
  });

export async function signUpAction(input: unknown): Promise<AuthActionResult> {
  const parsed = signupSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? GENERIC_ERROR };
  const { fullName, email, password } = parsed.data;
  // A partner's code entered at sign-up. Kept in account metadata, and used on the connect step after verification.
  const spaceCode = parsed.data.spaceCode ? normalizeSpaceCode(parsed.data.spaceCode) : "";

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName, ...(spaceCode ? { space_code: spaceCode } : {}) },
      emailRedirectTo: `${getAppUrl()}/auth/callback?next=/app`,
    },
  });

  if (error) {
    logAuthError("signup", error);
    return { error: signupErrorMessage(error.code) };
  }

  // Supabase returns an obfuscated user for an email that already exists, with no identities.
  // We send the same response either way, so the form never reveals whether an account exists.
  if (data.user && data.user.identities?.length) {
    await ensureUserProfile(data.user);
    await recordAuditEvent("auth.signup_requested", data.user.id);
  }

  // With email confirmation on, Supabase returns no session yet, so the user must verify first.
  // If confirmation is turned off, a session comes back and the user goes straight to onboarding.
  if (data.session) redirect("/onboarding/profile");
  redirect("/verify-email");
}

export async function logInAction(input: unknown): Promise<AuthActionResult> {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? GENERIC_ERROR };

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    logAuthError("login", error);
    await recordAuditEvent("auth.login_failed");
    if (error.code === "email_not_confirmed") redirect("/verify-email");
    return { error: BAD_CREDENTIALS };
  }

  if (data.user) {
    await ensureUserProfile(data.user);
    await recordAuditEvent("auth.login_succeeded", data.user.id);
  }
  redirect("/app");
}

export async function logOutAction() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  await supabase.auth.signOut();
  await recordAuditEvent("auth.logout", data.user?.id ?? null);
  redirect("/login");
}

/** Always returns the same confirmation, so it cannot be used to discover registered emails. */
export async function requestPasswordResetAction(input: unknown): Promise<{ error?: string; sent?: boolean }> {
  const parsed = forgotSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? GENERIC_ERROR };

  const supabase = await createSupabaseServerClient();
  await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${getAppUrl()}/auth/callback?next=/reset-password`,
  });
  await recordAuditEvent("auth.password_reset_requested");
  return { sent: true };
}

export async function updatePasswordAction(input: unknown): Promise<AuthActionResult> {
  const parsed = resetSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? GENERIC_ERROR };

  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return { error: "This reset link has expired. Please request a new one." };

  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) return { error: GENERIC_ERROR };

  await recordAuditEvent("auth.password_changed", userData.user.id);
  redirect("/app");
}
