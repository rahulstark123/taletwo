"use client";

import { LoadingModal } from "@/components/shared/loading-modal";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowRight, MailCheck } from "lucide-react";
import { AuthNotice } from "@/components/auth/auth-notice";
import { FormField, describedBy, inputClass } from "@/components/auth/form-field";
import { requestPasswordResetAction } from "@/server/actions/auth";

const schema = z.object({ email: z.email("Please enter a valid email address.") });
type Values = z.infer<typeof schema>;

export function ForgotPasswordForm() {
  const [sent, setSent] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Values>({ resolver: zodResolver(schema), mode: "onTouched", defaultValues: { email: "" } });

  if (sent) {
    return (
      <div role="status" className="flex flex-col items-center gap-3 text-center">
        <span className="flex size-12 items-center justify-center rounded-full bg-ld-tertiary-fixed/40 text-ld-tertiary">
          <MailCheck className="size-5" aria-hidden="true" />
        </span>
        <p className="text-ld-body-md text-ld-on-surface">
          If an account exists for that email, we have sent a link to reset the password. It may take a minute to arrive.
        </p>
        <p className="text-ld-caption text-ld-on-surface-variant">Check your spam folder if you do not see it.</p>
      </div>
    );
  }

  return (
    <form method="post"
      noValidate
      aria-label="Reset your password"
      className="space-y-5"
      onSubmit={handleSubmit(async (values) => {
        setServerError(null);
        const result = await requestPasswordResetAction(values);
        if (result.error) setServerError(result.error);
        else setSent(true);
      })}
    >
      <FormField id="reset-email" label="Email" error={errors.email?.message}>
        <input
          id="reset-email"
          type="email"
          autoComplete="email"
          inputMode="email"
          placeholder="you@example.com"
          aria-invalid={!!errors.email}
          aria-describedby={describedBy("reset-email", errors.email?.message)}
          className={inputClass}
          {...register("email")}
        />
      </FormField>

      <button
        type="submit"
        disabled={isSubmitting}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-ld-primary text-ld-label-md text-ld-on-primary shadow-[0_8px_20px_rgba(201,126,139,0.28)] transition-colors hover:bg-ld-on-primary-fixed-variant disabled:opacity-60"
      >
        {isSubmitting ? "Sending…" : "Send reset link"}
        <ArrowRight className="size-4" aria-hidden="true" />
      </button>

      <LoadingModal open={isSubmitting} label="Sending your link" />

      {serverError && <AuthNotice tone="error">{serverError}</AuthNotice>}
    </form>
  );
}
