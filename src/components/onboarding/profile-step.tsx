"use client";

import { LoadingModal } from "@/components/shared/loading-modal";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight } from "lucide-react";
import { z } from "zod";
import { AuthNotice } from "@/components/auth/auth-notice";
import { FormField, describedBy, inputClass, selectClass, SelectChevron } from "@/components/auth/form-field";
import { apiCall } from "@/components/onboarding/api-client";
import { COUNTRIES, CURRENCIES, currencyForCountry, DEFAULT_COUNTRY, DEFAULT_CURRENCY } from "@/lib/locale";

const schema = z.object({
  displayName: z.string().trim().min(2, "Please enter at least 2 characters.").max(60, "Please keep your name under 60 characters."),
  relationshipStartDate: z.string().optional(),
  country: z.enum(COUNTRIES.map((c) => c.code) as [string, ...string[]], { message: "Please choose your country." }),
  currency: z.enum(CURRENCIES.map((c) => c.code) as [string, ...string[]], { message: "Please choose a currency." }),
  theme: z.enum(["LIGHT", "DARK", "SYSTEM"]),
});
type Values = z.infer<typeof schema>;

export function ProfileStep({
  initialDisplayName,
  initialStartDate,
}: {
  initialDisplayName: string;
  initialStartDate: string | null;
}) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    mode: "onTouched",
    defaultValues: {
      displayName: initialDisplayName,
      relationshipStartDate: initialStartDate ?? "",
      country: DEFAULT_COUNTRY,
      currency: DEFAULT_CURRENCY,
      theme: "SYSTEM",
    },
  });

  return (
    <form
      method="post"
      noValidate
      aria-label="Your profile"
      className="space-y-5"
      onSubmit={handleSubmit(async (values) => {
        setServerError(null);
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
        const result = await apiCall("/api/me", {
          method: "PATCH",
          body: {
            displayName: values.displayName,
            relationshipStartDate: values.relationshipStartDate ? values.relationshipStartDate : null,
            timezone,
            country: values.country,
            currency: values.currency,
            theme: values.theme,
          },
        });
        if (!result.ok) {
          setServerError(result.error.message);
          return;
        }
        router.push("/onboarding/connect");
      })}
    >
      <FormField id="ob-name" label="Your display name" error={errors.displayName?.message}>
        <input
          id="ob-name"
          type="text"
          autoComplete="name"
          aria-invalid={!!errors.displayName}
          aria-describedby={describedBy("ob-name", errors.displayName?.message)}
          className={inputClass}
          {...register("displayName")}
        />
      </FormField>

      <FormField
        id="ob-start"
        label="Relationship start date (optional)"
        error={errors.relationshipStartDate?.message}
        hint="Used for your day counter. You can change it later."
      >
        <input
          id="ob-start"
          type="date"
          aria-invalid={!!errors.relationshipStartDate}
          aria-describedby={describedBy("ob-start", errors.relationshipStartDate?.message, true)}
          className={inputClass}
          {...register("relationshipStartDate")}
        />
      </FormField>

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField id="ob-country" label="Where are you based?" error={errors.country?.message} hint="Used for your currency and local details.">
          <div className="relative"><select id="ob-country" className={selectClass} aria-invalid={!!errors.country} {...register("country", { onChange: (e) => setValue("currency", currencyForCountry(e.target.value)) })}>
            {COUNTRIES.map((c) => (
              <option key={c.code} value={c.code}>{c.name}</option>
            ))}
          </select><SelectChevron /></div>
        </FormField>
        <FormField id="ob-currency" label="Default currency" error={errors.currency?.message} hint="Budgets in your space use this. You can change it in Settings.">
          <div className="relative"><select id="ob-currency" className={selectClass} aria-invalid={!!errors.currency} {...register("currency")}>
            {CURRENCIES.map((c) => (
              <option key={c.code} value={c.code}>{c.code} · {c.name}</option>
            ))}
          </select><SelectChevron /></div>
        </FormField>
      </div>

      <FormField id="ob-theme" label="Preferred theme">
        <div className="relative"><select id="ob-theme" className={selectClass} {...register("theme")}>
          <option value="SYSTEM">Match my device</option>
          <option value="LIGHT">Light</option>
          <option value="DARK">Dark</option>
        </select><SelectChevron /></div>
      </FormField>

      <button
        type="submit"
        disabled={isSubmitting}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-ld-primary text-ld-label-md text-ld-on-primary shadow-[0_8px_20px_rgba(201,126,139,0.28)] transition-colors hover:bg-ld-on-primary-fixed-variant disabled:opacity-60"
      >
        {isSubmitting ? "Saving…" : "Continue"}
        <ArrowRight className="size-4" aria-hidden="true" />
      </button>

      <LoadingModal open={isSubmitting} label="Saving your profile" />

      {serverError && <AuthNotice tone="error">{serverError}</AuthNotice>}
    </form>
  );
}
