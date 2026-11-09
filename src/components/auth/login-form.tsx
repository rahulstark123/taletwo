"use client";

import { LoadingModal } from "@/components/shared/loading-modal";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight } from "lucide-react";
import { AuthNotice } from "@/components/auth/auth-notice";
import { FormField, describedBy, inputClass } from "@/components/auth/form-field";
import { PasswordField } from "@/components/auth/password-field";
import { SocialSoonButton } from "@/components/auth/social-soon";
import { logInAction } from "@/server/actions/auth";
import { loginSchema, type LoginInput } from "@/lib/validations/auth";

export function LoginForm({ linkError = false }: { linkError?: boolean }) {
  const [serverError, setServerError] = useState<string | null>(linkError ? "That link has expired or was already used. Please log in or request a new one." : null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    mode: "onTouched",
    defaultValues: { email: "", password: "" },
  });

  return (
    <div className="space-y-6">
      <form method="post"
        noValidate
        aria-label="Log in"
        className="space-y-5"
        onSubmit={handleSubmit(async (values) => {
          setServerError(null);
          const result = await logInAction(values);
          if (result?.error) setServerError(result.error);
        })}
      >
        <FormField id="login-email" label="Email" error={errors.email?.message}>
          <input
            id="login-email"
            type="email"
            autoComplete="email"
            inputMode="email"
            placeholder="you@example.com"
            aria-invalid={!!errors.email}
            aria-describedby={describedBy("login-email", errors.email?.message)}
            className={inputClass}
            {...register("email")}
          />
        </FormField>

        <FormField id="login-password" label="Password" error={errors.password?.message}>
          <PasswordField
            id="login-password"
            autoComplete="current-password"
            aria-invalid={!!errors.password}
            aria-describedby={describedBy("login-password", errors.password?.message)}
            {...register("password")}
          />
        </FormField>
        <div className="-mt-3 flex justify-end">
          <Link href="/forgot-password" className="text-ld-label-sm font-medium text-ld-primary hover:underline">
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-ld-primary text-ld-label-md text-ld-on-primary shadow-[0_8px_20px_rgba(201,126,139,0.28)] transition-colors hover:bg-ld-on-primary-fixed-variant disabled:opacity-60"
        >
          {isSubmitting ? "Logging in…" : "Log in"}
          <ArrowRight className="size-4" aria-hidden="true" />
        </button>

        <p className="text-center text-ld-body-sm text-ld-on-surface-variant">
          New here with your partner&apos;s space code?{" "}
          <Link href="/signup" className="font-medium text-ld-primary hover:underline">
            Create your account and enter it
          </Link>
          .
        </p>

        <LoadingModal open={isSubmitting} label="Logging you in" />

        {serverError && <AuthNotice tone="error">{serverError}</AuthNotice>}
      </form>

      <SocialSoonButton label="Continue with Google" />
    </div>
  );
}
