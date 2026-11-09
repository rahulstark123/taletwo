"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { UserPlus, CalendarPlus } from "lucide-react";
import { AuthNotice } from "@/components/auth/auth-notice";
import { FormField, describedBy, inputClass, selectClass, SelectChevron } from "@/components/auth/form-field";
import {
  FAMILY_RELATIONSHIPS,
  FAMILY_ROLES,
  familyPlanSchema,
  inviteFamilySchema,
  type FamilyPlanInput,
  type InviteFamilyInput,
} from "@/lib/validations/family";

export const FAMILY_NOT_SAVED =
  "Your details look good. Family invitations and plans are not connected yet, so nothing has been sent or saved.";

const buttonClass =
  "inline-flex h-11 items-center justify-center gap-2 rounded-full bg-ld-primary px-6 text-ld-label-md text-ld-on-primary transition-colors hover:bg-ld-on-primary-fixed-variant disabled:opacity-60";

export function InviteFamilyForm() {
  const [status, setStatus] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<InviteFamilyInput>({
    resolver: zodResolver(inviteFamilySchema),
    mode: "onTouched",
    defaultValues: { name: "", email: "", relationship: undefined, role: "viewer" },
  });

  return (
    <form
      noValidate
      aria-label="Invite a family member"
      onSubmit={handleSubmit(async () => {
        // Milestone 3 sends the invitation and stores it server-side.
        setStatus(FAMILY_NOT_SAVED);
        reset();
      })}
      className="grid grid-cols-1 gap-4 sm:grid-cols-2"
    >
      <FormField id="family-name" label="Their name" error={errors.name?.message} className="sm:col-span-1">
        <input
          id="family-name"
          type="text"
          placeholder="e.g. Asha"
          aria-invalid={!!errors.name}
          aria-describedby={describedBy("family-name", errors.name?.message)}
          className={inputClass}
          {...register("name")}
        />
      </FormField>

      <FormField id="family-email" label="Email (optional)" error={errors.email?.message} hint="Leave blank to share an invite link instead.">
        <input
          id="family-email"
          type="email"
          inputMode="email"
          placeholder="name@example.com"
          aria-invalid={!!errors.email}
          aria-describedby={describedBy("family-email", errors.email?.message, true)}
          className={inputClass}
          {...register("email")}
        />
      </FormField>

      <FormField id="family-relationship" label="Relationship" error={errors.relationship?.message}>
        <div className="relative"><select
          id="family-relationship"
          defaultValue=""
          aria-invalid={!!errors.relationship}
          aria-describedby={describedBy("family-relationship", errors.relationship?.message)}
          className={selectClass}
          {...register("relationship")}
        >
          <option value="" disabled>
            Choose one
          </option>
          {FAMILY_RELATIONSHIPS.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select><SelectChevron /></div>
      </FormField>

      <FormField id="family-role" label="What they can do" error={errors.role?.message}>
        <div className="relative"><select
          id="family-role"
          aria-invalid={!!errors.role}
          aria-describedby={describedBy("family-role", errors.role?.message)}
          className={selectClass}
          {...register("role")}
        >
          {(Object.keys(FAMILY_ROLES) as (keyof typeof FAMILY_ROLES)[]).map((key) => (
            <option key={key} value={key}>
              {FAMILY_ROLES[key]}
            </option>
          ))}
        </select><SelectChevron /></div>
      </FormField>

      <div className="flex flex-col gap-3 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between">
        <button type="submit" disabled={isSubmitting} className={buttonClass}>
          <UserPlus className="size-4" aria-hidden="true" />
          Send invitation
        </button>
        {status && <div className="sm:max-w-md"><AuthNotice>{status}</AuthNotice></div>}
      </div>
    </form>
  );
}

export function FamilyPlanForm() {
  const [status, setStatus] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FamilyPlanInput>({
    resolver: zodResolver(familyPlanSchema),
    mode: "onTouched",
    defaultValues: { title: "", when: "", place: "", notes: "" },
  });

  return (
    <form
      noValidate
      aria-label="Plan something with family"
      onSubmit={handleSubmit(async () => {
        // Milestone 4 saves the plan and notifies the invited family members.
        setStatus(FAMILY_NOT_SAVED);
        reset();
      })}
      className="grid grid-cols-1 gap-4 sm:grid-cols-2"
    >
      <FormField id="plan-title" label="What is the plan?" error={errors.title?.message} className="sm:col-span-2">
        <input
          id="plan-title"
          type="text"
          placeholder="e.g. Diwali dinner, weekend at the lake"
          aria-invalid={!!errors.title}
          aria-describedby={describedBy("plan-title", errors.title?.message)}
          className={inputClass}
          {...register("title")}
        />
      </FormField>

      <FormField id="plan-when" label="When" error={errors.when?.message}>
        <input
          id="plan-when"
          type="datetime-local"
          aria-invalid={!!errors.when}
          aria-describedby={describedBy("plan-when", errors.when?.message)}
          className={inputClass}
          {...register("when")}
        />
      </FormField>

      <FormField id="plan-place" label="Where (optional)" error={errors.place?.message}>
        <input
          id="plan-place"
          type="text"
          placeholder="Home, a cafe, a city"
          aria-invalid={!!errors.place}
          aria-describedby={describedBy("plan-place", errors.place?.message)}
          className={inputClass}
          {...register("place")}
        />
      </FormField>

      <FormField id="plan-notes" label="Notes for the family (optional)" error={errors.notes?.message} className="sm:col-span-2">
        <textarea
          id="plan-notes"
          rows={3}
          placeholder="What to bring, dress code, anything they should know"
          aria-invalid={!!errors.notes}
          aria-describedby={describedBy("plan-notes", errors.notes?.message)}
          className={`${inputClass} h-auto py-3`}
          {...register("notes")}
        />
      </FormField>

      <div className="flex flex-col gap-3 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between">
        <button type="submit" disabled={isSubmitting} className={buttonClass}>
          <CalendarPlus className="size-4" aria-hidden="true" />
          Create family plan
        </button>
        {status && <div className="sm:max-w-md"><AuthNotice>{status}</AuthNotice></div>}
      </div>
    </form>
  );
}
