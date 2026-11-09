"use client";

import { useState } from "react";
import { loginAdminAction } from "@/server/actions/admin";
import { AuthNotice } from "@/components/auth/auth-notice";
import { FormField, inputClass } from "@/components/auth/form-field";

/** Email and password for the admin panel. Same secure sign-in as the app, with an admin check after it. */
export function AdminLoginForm() {
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    const result = await loginAdminAction({ email: form.get("email"), password: form.get("password") });
    setBusy(false);
    if (result?.error) setError(result.error);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5" noValidate>
      <FormField id="admin-email" label="Admin email">
        <input id="admin-email" name="email" type="email" autoComplete="username" className={inputClass} />
      </FormField>
      <FormField id="admin-password" label="Password">
        <input id="admin-password" name="password" type="password" autoComplete="current-password" className={inputClass} />
      </FormField>
      <button type="submit" disabled={busy} className="flex h-12 w-full items-center justify-center rounded-full bg-ld-primary text-ld-label-md text-ld-on-primary disabled:opacity-60">
        {busy ? "Signing in…" : "Sign in to admin"}
      </button>
      {error && <AuthNotice tone="error">{error}</AuthNotice>}
    </form>
  );
}
