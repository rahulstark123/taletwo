"use client";

import Link from "next/link";
import { useState } from "react";
import { setThemeOverride } from "@/components/layout/theme-store";
import { COUNTRIES, CURRENCIES, currencyForCountry } from "@/lib/locale";
import { SelectChevron, selectClass } from "@/components/auth/form-field";
import { BadgeCheck, CreditCard, Copy, LifeBuoy, LogOut, Mail, Monitor, Moon, Plus, RefreshCw, Save, ScrollText, ShieldCheck, Sun, UserRound, Users } from "lucide-react";
import { apiCall } from "@/components/onboarding/api-client";
import { logOutAction, requestPasswordResetAction } from "@/server/actions/auth";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { LOGOUT_MESSAGES, LoadingModal } from "@/components/shared/loading-modal";
import { cn } from "@/lib/utils";

export type ThemeChoice = "LIGHT" | "DARK" | "SYSTEM";

export interface SettingsInitial {
  displayName: string;
  email: string;
  verified: boolean;
  theme: ThemeChoice;
  workspaceName: string | null;
  memberCount: number;
  spaceCode: string;
  country: string;
  currency: string;
}

const inputClass =
  "h-11 w-full rounded-xl border border-ld-outline-variant bg-ld-surface px-4 text-ld-body-md text-ld-on-surface placeholder:text-ld-on-surface-variant/70 focus:border-ld-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-ld-primary/30";

const THEMES: { value: ThemeChoice; label: string; hint: string; icon: typeof Sun }[] = [
  { value: "SYSTEM", label: "Match device", hint: "Follows your phone or computer", icon: Monitor },
  { value: "LIGHT", label: "Light", hint: "Warm and bright", icon: Sun },
  { value: "DARK", label: "Dark", hint: "Easier on the eyes at night", icon: Moon },
];

function Card({ id, title, description, children }: { id: string; title: string; description: string; children: React.ReactNode }) {
  return (
    <section aria-labelledby={id} className="space-y-5 rounded-3xl bg-ld-surface-container-lowest p-6 shadow-sm sm:p-8">
      <div className="space-y-1">
        <h2 id={id} className="font-display text-ld-title-lg text-ld-on-surface">{title}</h2>
        <p className="text-ld-body-sm text-ld-on-surface-variant">{description}</p>
      </div>
      {children}
    </section>
  );
}

function Notice({ tone, text }: { tone: "error" | "info"; text: string }) {
  return (
    <p
      role={tone === "error" ? "alert" : "status"}
      className={cn("rounded-xl px-4 py-3 text-ld-body-sm", tone === "error" ? "bg-ld-error-container text-ld-on-error-container" : "bg-ld-tertiary-fixed/60 text-ld-on-tertiary-fixed-variant")}
    >
      {text}
    </p>
  );
}

/** Account settings: appearance, password, couple space, help and sign out. */
export function SettingsBoard({ initial }: { initial: SettingsInitial }) {
  const [theme, setTheme] = useState<ThemeChoice>(initial.theme);
  const [themeMsg, setThemeMsg] = useState<{ tone: "error" | "info"; text: string } | null>(null);

  const [resetOpen, setResetOpen] = useState(false);
  const [resetBusy, setResetBusy] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [resetMsg, setResetMsg] = useState<{ tone: "error" | "info"; text: string } | null>(null);

  const [code, setCode] = useState(initial.spaceCode);
  const [codeMsg, setCodeMsg] = useState<{ tone: "error" | "info"; text: string } | null>(null);
  const [codeBusy, setCodeBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      setCodeMsg({ tone: "error", text: "Copying is not available here. Please select the code and copy it." });
    }
  }

  async function regenerateCode() {
    if (!window.confirm("Make a new space code? The current code will stop working straight away.")) return;
    setCodeBusy(true);
    setCodeMsg(null);
    const res = await apiCall<{ spaceCode: string }>("/api/me/space-code", { method: "POST" });
    setCodeBusy(false);
    if (!res.ok) {
      setCodeMsg({ tone: "error", text: res.error.message });
      return;
    }
    setCode(res.data.spaceCode);
    setCodeMsg({ tone: "info", text: "New code created. Share it with your partner." });
  }

  const [spaceName, setSpaceName] = useState(initial.workspaceName ?? "");
  const [country, setCountry] = useState(initial.country);
  const [currency, setCurrency] = useState(initial.currency);
  const [locBusy, setLocBusy] = useState(false);
  const [locMsg, setLocMsg] = useState<{ tone: "error" | "info"; text: string } | null>(null);

  function chooseCountry(code: string) {
    setCountry(code);
    setCurrency(currencyForCountry(code));
  }

  async function saveLocation() {
    if (locBusy) return;
    setLocBusy(true);
    setLocMsg(null);
    const res = await apiCall<{ workspace: { country: string; currency: string } }>("/api/workspaces/current", { method: "PATCH", body: { country, currency } });
    setLocBusy(false);
    if (!res.ok) {
      setLocMsg({ tone: "error", text: res.error.message });
      return;
    }
    setLocMsg({ tone: "info", text: "Saved. Money in your space now uses this currency." });
  }
  const [spaceBusy, setSpaceBusy] = useState(false);
  const [spaceMsg, setSpaceMsg] = useState<{ tone: "error" | "info"; text: string } | null>(null);

  async function chooseTheme(value: ThemeChoice) {
    const previous = theme;
    setTheme(value);
    setThemeMsg(null);
    setThemeOverride(value);
    const res = await apiCall<{ theme: ThemeChoice }>("/api/me/preferences", { method: "PATCH", body: { theme: value } });
    if (!res.ok) {
      setTheme(previous);
      setThemeOverride(previous);
      setThemeMsg({ tone: "error", text: res.error.message });
    } else {
      setThemeMsg({ tone: "info", text: "Saved. Your appearance choice is stored on your account." });
    }
  }

  async function sendResetLink() {
    if (resetBusy) return;
    setResetBusy(true);
    setResetMsg(null);
    try {
      await requestPasswordResetAction({ email: initial.email });
      // The same reply is given whether or not the address has an account, so this never reveals one.
      setResetSent(true);
      setResetMsg({ tone: "info", text: `Check ${initial.email} for the reset link. It may take a minute to arrive.` });
    } catch {
      setResetMsg({ tone: "error", text: "We could not send the link right now. Please try again in a few minutes." });
    } finally {
      setResetBusy(false);
      setResetOpen(false);
    }
  }

  async function saveSpace(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (spaceBusy) return;
    setSpaceBusy(true);
    setSpaceMsg(null);
    const res = await apiCall<{ workspace: { name: string } }>("/api/workspaces/current", { method: "PATCH", body: { name: spaceName } });
    setSpaceBusy(false);
    if (!res.ok) {
      setSpaceMsg({ tone: "error", text: res.error.message });
      return;
    }
    setSpaceName(res.data.workspace.name);
    setSpaceMsg({ tone: "info", text: "Space name saved." });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <LoadingModal open={loggingOut} label="Logging you out" messages={LOGOUT_MESSAGES} />
      <Card id="account-heading" title="Account" description="Your name, email and profile photo are on your profile page.">
        <div className="flex items-center justify-between gap-4 rounded-2xl bg-ld-surface-container p-4">
          <div className="min-w-0">
            <p className="truncate text-ld-label-md font-semibold text-ld-on-surface">{initial.displayName}</p>
            <p className="truncate text-ld-caption text-ld-on-surface-variant">{initial.email}</p>
            <p className="mt-1 inline-flex items-center gap-1 text-ld-caption text-ld-tertiary">
              <BadgeCheck className="size-3.5" aria-hidden="true" />
              {initial.verified ? "Email verified" : "Email not verified"}
            </p>
          </div>
          <Link href="/app/profile" className="inline-flex h-10 shrink-0 items-center gap-2 rounded-xl bg-ld-surface-container-lowest px-4 text-ld-label-sm text-ld-primary ring-1 ring-ld-outline-variant/50">
            <UserRound className="size-4" aria-hidden="true" />
            Edit profile
          </Link>
        </div>
      </Card>

      <Card id="code-heading" title="Your space code" description="Your partner enters this 6-character code to join your space. It stays the same until you change it.">
        <div className="flex flex-wrap items-center gap-3">
          <p className="font-mono text-2xl tracking-[0.25em] text-ld-on-surface" aria-label={`Your space code ${code.split("").join(" ")}`}>
            {code}
          </p>
          <button type="button" onClick={copyCode} className="inline-flex h-10 items-center gap-2 rounded-xl bg-ld-surface-container px-4 text-ld-label-sm text-ld-on-surface">
            <Copy className="size-4" aria-hidden="true" />
            {copied ? "Copied" : "Copy code"}
          </button>
          <button type="button" onClick={() => setAddOpen(true)} disabled={initial.memberCount >= 2} className="inline-flex h-10 items-center gap-2 rounded-xl bg-ld-primary px-4 text-ld-label-sm text-ld-on-primary disabled:opacity-50">
            <Plus className="size-4" aria-hidden="true" />
            Add partner
          </button>
          <button type="button" onClick={regenerateCode} disabled={codeBusy} className="inline-flex h-10 items-center gap-2 rounded-xl bg-ld-surface-container px-4 text-ld-label-sm text-ld-on-surface disabled:opacity-50">
            <RefreshCw className="size-4" aria-hidden="true" />
            {codeBusy ? "Creating…" : "Make a new code"}
          </button>
        </div>
        {initial.memberCount >= 2 && <p className="text-ld-caption text-ld-on-surface-variant">Your space already has two people. Only one partner can join a couple space.</p>}
        {codeMsg && <Notice tone={codeMsg.tone} text={codeMsg.text} />}
        <ConfirmDialog
          open={addOpen}
          title="Add your partner"
          description={`Share your space code ${code} with your partner. They sign up or log in, then enter this code to join. Only one partner can join this space.`}
          confirmLabel="Copy code"
          cancelLabel="Close"
          onConfirm={() => {
            copyCode();
            setAddOpen(false);
          }}
          onCancel={() => setAddOpen(false)}
        />
      </Card>

      <Card id="appearance-heading" title="Appearance" description="Choose how TaleTwo looks on this account.">
        <div role="radiogroup" aria-label="Theme" className="grid gap-3 sm:grid-cols-3">
          {THEMES.map((t) => {
            const active = theme === t.value;
            return (
              <button
                key={t.value}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => chooseTheme(t.value)}
                className={cn(
                  "flex flex-col items-start gap-2 rounded-2xl p-4 text-left ring-1 transition-colors",
                  active ? "bg-ld-surface-container ring-2 ring-ld-primary" : "bg-ld-surface ring-ld-outline-variant/50 hover:bg-ld-surface-container"
                )}
              >
                <t.icon className="size-5 text-ld-primary" aria-hidden="true" />
                <span className="text-ld-label-md font-semibold text-ld-on-surface">{t.label}</span>
                <span className="text-ld-caption text-ld-on-surface-variant">{t.hint}</span>
              </button>
            );
          })}
        </div>
        {themeMsg && <Notice tone={themeMsg.tone} text={themeMsg.text} />}
      </Card>

      <Card id="security-heading" title="Password" description="Forgot your password, or want a new one? We will email you a secure reset link.">
        <div className="space-y-3 rounded-2xl bg-ld-surface-container p-4">
          <div className="space-y-1">
            <p className="text-ld-label-md font-semibold text-ld-on-surface">Forgot your current password?</p>
            <p className="text-ld-caption text-ld-on-surface-variant">We will email a secure link to {initial.email}. Your current password keeps working until you use the link.</p>
          </div>
          <button type="button" onClick={() => setResetOpen(true)} disabled={resetSent} className="inline-flex h-10 items-center gap-2 rounded-xl bg-ld-surface-container-lowest px-4 text-ld-label-sm text-ld-primary ring-1 ring-ld-outline-variant/50 hover:bg-ld-surface disabled:opacity-50">
            <Mail className="size-4" aria-hidden="true" />
            {resetSent ? "Link sent" : "Send reset link"}
          </button>
          {resetMsg && <Notice tone={resetMsg.tone} text={resetMsg.text} />}
        </div>

        <ConfirmDialog
          open={resetOpen}
          title="Reset your password?"
          description={`Are you sure? We will send a reset link to ${initial.email}. Use it within the time shown in the email to choose a new password.`}
          confirmLabel="Yes, send the link"
          cancelLabel="Not now"
          busy={resetBusy}
          onConfirm={sendResetLink}
          onCancel={() => setResetOpen(false)}
        />
      </Card>

      <Card id="space-heading" title="Your couple space" description="The name both of you see across TaleTwo.">
        {initial.workspaceName === null ? (
          <p className="rounded-2xl bg-ld-surface-container p-4 text-ld-body-sm text-ld-on-surface-variant">
            You are not in a couple space yet. Connect with your partner to set one up.
          </p>
        ) : (
          <form onSubmit={saveSpace} className="space-y-4" noValidate>
            <label className="block space-y-1.5">
              <span className="text-ld-label-sm text-ld-on-surface-variant">Space name</span>
              <input value={spaceName} onChange={(e) => setSpaceName(e.target.value)} maxLength={80} className={inputClass} />
            </label>
            <p className="inline-flex items-center gap-2 text-ld-caption text-ld-on-surface-variant">
              <Users className="size-3.5" aria-hidden="true" />
              {initial.memberCount} of 2 people connected
            </p>
            <div className="flex justify-end">
              <button type="submit" disabled={spaceBusy || spaceName.trim() === (initial.workspaceName ?? "")} className="inline-flex h-11 items-center gap-2 rounded-xl bg-ld-primary px-5 text-ld-label-md text-ld-on-primary disabled:opacity-50">
                <Save className="size-4" aria-hidden="true" />
                {spaceBusy ? "Saving…" : "Save name"}
              </button>
            </div>
            {spaceMsg && <Notice tone={spaceMsg.tone} text={spaceMsg.text} />}
          </form>
        )}
      </Card>

      {initial.workspaceName !== null && (
        <Card id="location-heading" title="Country and currency" description="Your country and the currency used for budgets and money in your space.">
          <form onSubmit={(e) => { e.preventDefault(); saveLocation(); }} className="space-y-4" noValidate>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block space-y-1.5">
                <span className="text-ld-label-sm text-ld-on-surface-variant">Country</span>
                <div className="relative">
                  <select value={country} onChange={(e) => chooseCountry(e.target.value)} className={selectClass}>
                    {COUNTRIES.map((c) => (
                      <option key={c.code} value={c.code}>{c.name}</option>
                    ))}
                  </select>
                  <SelectChevron />
                </div>
              </label>
              <label className="block space-y-1.5">
                <span className="text-ld-label-sm text-ld-on-surface-variant">Default currency</span>
                <div className="relative">
                  <select value={currency} onChange={(e) => setCurrency(e.target.value)} className={selectClass}>
                    {CURRENCIES.map((c) => (
                      <option key={c.code} value={c.code}>{c.code} · {c.name}</option>
                    ))}
                  </select>
                  <SelectChevron />
                </div>
              </label>
            </div>
            <p className="text-ld-caption text-ld-on-surface-variant">Plan budgets and other money in your space are shown in this currency. Subscriptions are billed in Indian rupees for now.</p>
            <div className="flex justify-end">
              <button type="submit" disabled={locBusy || (country === initial.country && currency === initial.currency)} className="inline-flex h-11 items-center gap-2 rounded-xl bg-ld-primary px-5 text-ld-label-md text-ld-on-primary disabled:opacity-50">
                <Save className="size-4" aria-hidden="true" />
                {locBusy ? "Saving…" : "Save"}
              </button>
            </div>
            {locMsg && <Notice tone={locMsg.tone} text={locMsg.text} />}
          </form>
        </Card>
      )}

      <Card id="billing-heading" title="Plan and billing" description="Your plan, receipts and invoices.">
        <div className="grid gap-3 sm:grid-cols-2">
          <Link href="/app/subscriptions" className="flex items-center gap-3 rounded-2xl bg-ld-surface p-4 ring-1 ring-ld-outline-variant/50 hover:bg-ld-surface-container">
            <CreditCard className="size-5 text-ld-primary" aria-hidden="true" />
            <span className="text-ld-label-md text-ld-on-surface">Subscriptions</span>
          </Link>
          <Link href="/app/subscriptions" className="flex items-center gap-3 rounded-2xl bg-ld-surface p-4 ring-1 ring-ld-outline-variant/50 hover:bg-ld-surface-container">
            <ScrollText className="size-5 text-ld-primary" aria-hidden="true" />
            <span className="text-ld-label-md text-ld-on-surface">My receipts</span>
          </Link>
        </div>
      </Card>

      <Card id="help-heading" title="Help and legal" description="Get help, or read how TaleTwo handles your information.">
        <ul className="grid gap-3 sm:grid-cols-3">
          <li><Link href="/app/support" className="flex items-center gap-2 rounded-2xl bg-ld-surface p-4 text-ld-label-md text-ld-on-surface ring-1 ring-ld-outline-variant/50 hover:bg-ld-surface-container"><LifeBuoy className="size-4 text-ld-primary" aria-hidden="true" />Support</Link></li>
          <li><Link href="/privacy" className="flex items-center gap-2 rounded-2xl bg-ld-surface p-4 text-ld-label-md text-ld-on-surface ring-1 ring-ld-outline-variant/50 hover:bg-ld-surface-container"><ShieldCheck className="size-4 text-ld-primary" aria-hidden="true" />Privacy</Link></li>
          <li><Link href="/terms" className="flex items-center gap-2 rounded-2xl bg-ld-surface p-4 text-ld-label-md text-ld-on-surface ring-1 ring-ld-outline-variant/50 hover:bg-ld-surface-container"><ScrollText className="size-4 text-ld-primary" aria-hidden="true" />Terms</Link></li>
        </ul>
        <p className="text-ld-caption text-ld-on-surface-variant">
          To get a copy of your data, or to delete your account, send a request from the{" "}
          <Link href="/app/support" className="text-ld-primary underline-offset-2 hover:underline">Support</Link> page.
        </p>
      </Card>

      <Card id="session-heading" title="Session" description="Sign out of TaleTwo on this device.">
        <button
          type="button"
          onClick={() => {
            setLoggingOut(true);
            logOutAction();
          }}
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-ld-surface-container px-5 text-ld-label-md text-ld-on-surface hover:bg-ld-surface-container-high sm:w-auto"
        >
          <LogOut className="size-4" aria-hidden="true" />
          Log out
        </button>
      </Card>
    </div>
  );
}
