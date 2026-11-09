"use client";

import { LoadingModal } from "@/components/shared/loading-modal";

import Link from "next/link";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight } from "lucide-react";
import { AuthNotice } from "@/components/auth/auth-notice";
import { FormField, describedBy, inputClass } from "@/components/auth/form-field";
import { PasswordField } from "@/components/auth/password-field";
import { PasswordStrength } from "@/components/auth/password-strength";
import { SocialSoonButton } from "@/components/auth/social-soon";
import { signupSchema, type SignupInput } from "@/lib/validations/auth";
import { signUpAction } from "@/server/actions/auth";

export function SignupForm() {
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    mode: "onTouched",
    defaultValues: { fullName: "", email: "", password: "", confirmPassword: "", acceptTerms: false, spaceCode: "" },
  });

  const password = useWatch({ control, name: "password" }) ?? "";
  const joining = (useWatch({ control, name: "spaceCode" }) ?? "").trim() !== "";

  const onValid = async (values: SignupInput) => {
    setServerError(null);
    const result = await signUpAction(values);
    if (result?.error) setServerError(result.error);
  };

  return (
    <div className="space-y-6">
      <form method="post" noValidate onSubmit={handleSubmit(onValid)} className="space-y-5" aria-label="Create your account">
        <FormField id="signup-name" label="Full name" error={errors.fullName?.message}>
          <input
            id="signup-name"
            type="text"
            autoComplete="name"
            placeholder="Your name"
            aria-invalid={!!errors.fullName}
            aria-describedby={describedBy("signup-name", errors.fullName?.message)}
            className={inputClass}
            {...register("fullName")}
          />
        </FormField>

        <FormField id="signup-email" label="Email" error={errors.email?.message}>
          <input
            id="signup-email"
            type="email"
            autoComplete="email"
            inputMode="email"
            placeholder="you@example.com"
            aria-invalid={!!errors.email}
            aria-describedby={describedBy("signup-email", errors.email?.message)}
            className={inputClass}
            {...register("email")}
          />
        </FormField>

        <FormField id="signup-code" label="Partner's space code (optional)" error={errors.spaceCode?.message} hint="Have a 6-character code from your partner? Enter it to join their space.">
          <input
            id="signup-code"
            type="text"
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
            placeholder="e.g. 7KQ2MA"
            maxLength={8}
            aria-invalid={!!errors.spaceCode}
            aria-describedby={describedBy("signup-code", errors.spaceCode?.message)}
            className={`${inputClass} font-mono uppercase tracking-[0.15em] placeholder:font-sans placeholder:normal-case placeholder:tracking-normal`}
            {...register("spaceCode")}
          />
        </FormField>

        <FormField
          id="signup-password"
          label="Password"
          error={errors.password?.message}
          hint={<PasswordStrength value={password} id="signup-password" />}
        >
          <PasswordField
            id="signup-password"
            autoComplete="new-password"
            aria-invalid={!!errors.password}
            aria-describedby={describedBy("signup-password", errors.password?.message, true)}
            {...register("password")}
          />
        </FormField>

        <FormField id="signup-confirm" label="Confirm password" error={errors.confirmPassword?.message}>
          <PasswordField
            id="signup-confirm"
            autoComplete="new-password"
            aria-invalid={!!errors.confirmPassword}
            aria-describedby={describedBy("signup-confirm", errors.confirmPassword?.message)}
            {...register("confirmPassword")}
          />
        </FormField>

        <div className="space-y-1.5">
          <label className="flex items-start gap-2.5 text-ld-body-sm text-ld-on-surface-variant">
            <input
              type="checkbox"
              aria-invalid={!!errors.acceptTerms}
              aria-describedby={errors.acceptTerms ? "signup-terms-error" : undefined}
              className="mt-1 size-4 accent-ld-primary"
              {...register("acceptTerms")}
            />
            <span>
              I agree to the{" "}
              <Link href="/terms" className="font-medium text-ld-primary hover:underline">
                Terms
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="font-medium text-ld-primary hover:underline">
                Privacy Policy
              </Link>
              .
            </span>
          </label>
          {errors.acceptTerms && (
            <p id="signup-terms-error" role="alert" className="text-ld-caption text-ld-error">
              {errors.acceptTerms.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-ld-primary text-ld-label-md text-ld-on-primary shadow-[0_8px_20px_rgba(201,126,139,0.28)] transition-colors hover:bg-ld-on-primary-fixed-variant disabled:opacity-60"
        >
          {joining ? "Join your space" : "Create your space"}
          <ArrowRight className="size-4" aria-hidden="true" />
        </button>

        <LoadingModal open={isSubmitting} label={joining ? "Joining your space" : "Creating your space"} />

        {serverError && <AuthNotice tone="error">{serverError}</AuthNotice>}
      </form>

      <SocialSoonButton label="Sign up with Google" />
    </div>
  );
}
