"use client";

import { LoadingModal } from "@/components/shared/loading-modal";

import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowRight } from "lucide-react";
import { AuthNotice } from "@/components/auth/auth-notice";
import { FormField, describedBy } from "@/components/auth/form-field";
import { PasswordField } from "@/components/auth/password-field";
import { PasswordStrength } from "@/components/auth/password-strength";
import { signupSchema } from "@/lib/validations/auth";
import { updatePasswordAction } from "@/server/actions/auth";

const schema = z
  .object({
    password: signupSchema.shape.password,
    confirmPassword: z.string().min(1, "Please confirm your password."),
  })
  .refine((d) => d.password === d.confirmPassword, { path: ["confirmPassword"], message: "Passwords do not match." });
type Values = z.infer<typeof schema>;

export function ResetPasswordForm() {
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    mode: "onTouched",
    defaultValues: { password: "", confirmPassword: "" },
  });
  const password = useWatch({ control, name: "password" }) ?? "";

  return (
    <form method="post"
      noValidate
      aria-label="Choose a new password"
      className="space-y-5"
      onSubmit={handleSubmit(async (values) => {
        setServerError(null);
        const result = await updatePasswordAction(values);
        if (result?.error) setServerError(result.error);
      })}
    >
      <FormField
        id="new-password"
        label="New password"
        error={errors.password?.message}
        hint={<PasswordStrength value={password} id="new-password" />}
      >
        <PasswordField
          id="new-password"
          autoComplete="new-password"
          aria-invalid={!!errors.password}
          aria-describedby={describedBy("new-password", errors.password?.message, true)}
          {...register("password")}
        />
      </FormField>

      <FormField id="new-password-confirm" label="Confirm new password" error={errors.confirmPassword?.message}>
        <PasswordField
          id="new-password-confirm"
          autoComplete="new-password"
          aria-invalid={!!errors.confirmPassword}
          aria-describedby={describedBy("new-password-confirm", errors.confirmPassword?.message)}
          {...register("confirmPassword")}
        />
      </FormField>

      <button
        type="submit"
        disabled={isSubmitting}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-ld-primary text-ld-label-md text-ld-on-primary shadow-[0_8px_20px_rgba(201,126,139,0.28)] transition-colors hover:bg-ld-on-primary-fixed-variant disabled:opacity-60"
      >
        {isSubmitting ? "Saving…" : "Save new password"}
        <ArrowRight className="size-4" aria-hidden="true" />
      </button>

      <LoadingModal open={isSubmitting} label="Saving your password" />

      {serverError && <AuthNotice tone="error">{serverError}</AuthNotice>}
    </form>
  );
}
