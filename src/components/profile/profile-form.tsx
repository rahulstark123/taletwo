"use client";

import { useMemo, useRef, useState } from "react";
import { setThemeOverride } from "@/components/layout/theme-store";
import { Camera, LogOut, Trash2, Users, Check, ShieldCheck } from "lucide-react";
import { apiCall } from "@/components/onboarding/api-client";
import { SelectChevron } from "@/components/auth/form-field";
import { compressPhoto } from "@/lib/image-compress";
import { uploadPhotoFile, deletePhotoPaths } from "@/lib/uploads-client";
import type { MeResponse } from "@/lib/me-types";
import { logOutAction } from "@/server/actions/auth";
import { cn } from "@/lib/utils";

const THEMES = [
  { value: "SYSTEM", label: "Match my device" },
  { value: "LIGHT", label: "Light" },
  { value: "DARK", label: "Dark" },
] as const;

type Theme = (typeof THEMES)[number]["value"];

interface Draft {
  displayName: string;
  relationshipStartDate: string;
  timezone: string;
  theme: Theme;
}

function timezoneOptions(current: string): string[] {
  let all: string[] = [];
  try {
    all = Intl.supportedValuesOf("timeZone");
  } catch {
    all = ["UTC"];
  }
  return all.includes(current) ? all : [current, ...all];
}

export function ProfileForm({ me, workspaceId, partnerName, memberCount }: { me: MeResponse; workspaceId: number | null; partnerName: string | null; memberCount: number }) {
  const [saved, setSaved] = useState<Draft>({
    displayName: me.displayName,
    relationshipStartDate: me.relationshipStartDate ?? "",
    timezone: me.timezone,
    theme: me.theme,
  });
  const [draft, setDraft] = useState<Draft>(saved);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(me.avatarUrl);
  const [avatarPath, setAvatarPath] = useState<string | null>(null);
  const [busy, setBusy] = useState<null | "save" | "photo">(null);
  const [message, setMessage] = useState<{ tone: "info" | "error"; text: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const zones = useMemo(() => timezoneOptions(me.timezone), [me.timezone]);

  const dirty = JSON.stringify(draft) !== JSON.stringify(saved);
  const nameOk = draft.displayName.trim().length >= 2;
  const initial = (saved.displayName || me.email).charAt(0).toUpperCase();

  async function save() {
    if (!nameOk) return setMessage({ tone: "error", text: "Please enter at least 2 characters for your name." });
    setBusy("save");
    setMessage(null);
    const res = await apiCall<{ profile: unknown }>("/api/me", {
      method: "PATCH",
      body: {
        displayName: draft.displayName.trim(),
        relationshipStartDate: draft.relationshipStartDate || null,
        timezone: draft.timezone,
        theme: draft.theme,
        ...(avatarPath !== null ? { avatarPath } : {}),
      },
    });
    setBusy(null);
    if (!res.ok) return setMessage({ tone: "error", text: res.error.message });
    setSaved({ ...draft, displayName: draft.displayName.trim() });
    setThemeOverride(draft.theme);
    setAvatarPath(null);
    setMessage({ tone: "info", text: "Your profile is saved." });
  }

  async function choosePhoto(file: File) {
    setBusy("photo");
    setMessage(null);
    let uploaded: string | null = null;
    try {
      const { file: small } = await compressPhoto(file, { maxWidthOrHeight: 512, maxSizeMB: 0.2 });
      const up = await uploadPhotoFile("avatar", small);
      if (!up.ok) throw new Error(up.error.message);
      uploaded = up.data.path;
      const res = await apiCall<MeResponse>("/api/me", {
        method: "PATCH",
        body: { displayName: saved.displayName, relationshipStartDate: saved.relationshipStartDate || null, timezone: saved.timezone, theme: saved.theme, avatarPath: uploaded },
      });
      if (!res.ok) throw new Error(res.error.message);
      setAvatarUrl(res.data.avatarUrl);
      setAvatarPath(null);
      setMessage({ tone: "info", text: "New photo saved." });
    } catch (e) {
      if (uploaded) await deletePhotoPaths("avatar", [uploaded]);
      setMessage({ tone: "error", text: e instanceof Error ? e.message : "Could not update the photo." });
    } finally {
      setBusy(null);
    }
  }

  async function removePhoto() {
    setBusy("photo");
    const res = await apiCall<{ profile: unknown }>("/api/me", {
      method: "PATCH",
      body: { displayName: saved.displayName, relationshipStartDate: saved.relationshipStartDate || null, timezone: saved.timezone, theme: saved.theme, avatarPath: null },
    });
    setBusy(null);
    if (!res.ok) return setMessage({ tone: "error", text: res.error.message });
    setAvatarUrl(null);
    setMessage({ tone: "info", text: "Photo removed." });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
      {/* Profile */}
      <section aria-labelledby="profile-details" className="space-y-6 rounded-3xl bg-ld-surface-container-lowest p-6 shadow-sm sm:p-8">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center">
          <div className="relative">
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- short-lived signed URL from private storage
              <img src={avatarUrl} alt="Your profile photo" className="size-24 rounded-full object-cover shadow-sm ring-4 ring-ld-surface" />
            ) : (
              <span aria-hidden="true" className="flex size-24 items-center justify-center rounded-full bg-ld-secondary-container font-display text-[32px] text-ld-on-secondary-container shadow-sm ring-4 ring-ld-surface">{initial}</span>
            )}
          </div>
          <div className="flex flex-col items-center gap-2 sm:items-start">
            <p className="font-display text-ld-headline-md text-ld-on-surface">{saved.displayName}</p>
            <div className="flex flex-wrap gap-2">
              <button type="button" disabled={busy !== null} onClick={() => fileRef.current?.click()} className="inline-flex h-9 items-center gap-2 rounded-full bg-ld-surface-container px-4 text-ld-label-sm text-ld-on-surface hover:bg-ld-surface-container-high disabled:opacity-50">
                <Camera className="size-4" aria-hidden="true" />
                {busy === "photo" ? "Updating…" : avatarUrl ? "Change photo" : "Add photo"}
              </button>
              {avatarUrl && (
                <button type="button" disabled={busy !== null} onClick={removePhoto} className="inline-flex h-9 items-center gap-2 rounded-full px-3 text-ld-label-sm text-ld-on-surface-variant hover:bg-ld-error/10 hover:text-ld-error disabled:opacity-50">
                  <Trash2 className="size-4" aria-hidden="true" />
                  Remove
                </button>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ""; if (f) choosePhoto(f); }} />
            <p className="text-[11px] text-ld-outline">Photos are compressed for you and stay private.</p>
          </div>
        </div>

        <form noValidate method="post" className="space-y-5" aria-labelledby="profile-details" onSubmit={(e) => { e.preventDefault(); save(); }}>
          <h2 id="profile-details" className="sr-only">Profile details</h2>

          <div className="space-y-2">
            <label htmlFor="pf-name" className="text-ld-label-md font-medium text-ld-on-surface">Display name</label>
            <input id="pf-name" type="text" value={draft.displayName} maxLength={60} onChange={(e) => setDraft((d) => ({ ...d, displayName: e.target.value }))} aria-invalid={!nameOk} className="h-12 w-full rounded-xl border border-ld-outline-variant bg-ld-surface px-4 text-ld-body-md text-ld-on-surface focus:border-ld-primary focus:outline-none focus:ring-2 focus:ring-ld-primary/25" />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="pf-start" className="text-ld-label-md font-medium text-ld-on-surface">Relationship start (optional)</label>
              <input id="pf-start" type="date" value={draft.relationshipStartDate} max={new Date().toISOString().slice(0, 10)} onChange={(e) => setDraft((d) => ({ ...d, relationshipStartDate: e.target.value }))} className="h-11 w-full rounded-xl border border-ld-outline-variant bg-ld-surface px-4 text-ld-body-sm text-ld-on-surface focus:border-ld-primary focus:outline-none focus:ring-2 focus:ring-ld-primary/25" />
            </div>
            <div className="space-y-2">
              <label htmlFor="pf-theme" className="text-ld-label-md font-medium text-ld-on-surface">Theme</label>
              <div className="relative">
                <select id="pf-theme" value={draft.theme} onChange={(e) => setDraft((d) => ({ ...d, theme: e.target.value as Theme }))} className="block h-11 w-full appearance-none rounded-xl border border-ld-outline-variant bg-ld-surface px-4 pr-11 text-ld-body-sm text-ld-on-surface focus:border-ld-primary focus:outline-none focus:ring-2 focus:ring-ld-primary/25">
                  {THEMES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
                <SelectChevron />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="pf-tz" className="text-ld-label-md font-medium text-ld-on-surface">Timezone</label>
            <div className="relative">
              <select id="pf-tz" value={draft.timezone} onChange={(e) => setDraft((d) => ({ ...d, timezone: e.target.value }))} className="block h-11 w-full appearance-none rounded-xl border border-ld-outline-variant bg-ld-surface px-4 pr-11 text-ld-body-sm text-ld-on-surface focus:border-ld-primary focus:outline-none focus:ring-2 focus:ring-ld-primary/25">
                {zones.map((z) => <option key={z} value={z}>{z.replace(/_/g, " ")}</option>)}
              </select>
              <SelectChevron />
            </div>
            <p className="text-[11px] text-ld-outline">Day counters, the calendar and the daily question follow this timezone.</p>
          </div>

          <div className="space-y-2">
            <span className="text-ld-label-md font-medium text-ld-on-surface">Email</span>
            <div className="flex items-center justify-between gap-3 rounded-xl bg-ld-surface-container-low px-4 py-3">
              <span className="truncate text-ld-body-sm text-ld-on-surface-variant">{me.email}</span>
              <span className="inline-flex shrink-0 items-center gap-1 text-ld-caption text-ld-tertiary"><ShieldCheck className="size-3.5" aria-hidden="true" />Verified</span>
            </div>
          </div>

          {message && <p role={message.tone === "error" ? "alert" : "status"} className={cn("rounded-xl px-4 py-2 text-ld-caption", message.tone === "error" ? "bg-ld-error-container text-ld-on-error-container" : "bg-ld-secondary-container/40 text-ld-on-surface")}>{message.text}</p>}

          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
            <button type="button" onClick={() => logOutAction()} className="inline-flex h-11 items-center justify-center gap-2 rounded-full px-4 text-ld-label-md text-ld-on-surface-variant hover:bg-ld-on-surface/5">
              <LogOut className="size-4" aria-hidden="true" />
              Log out
            </button>
            <button type="submit" disabled={!dirty || !nameOk || busy !== null} className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-ld-primary px-6 text-ld-label-md text-ld-on-primary shadow-[0_8px_20px_rgba(201,126,139,0.28)] transition-colors hover:bg-ld-on-primary-fixed-variant disabled:opacity-40">
              <Check className="size-4" aria-hidden="true" />
              {busy === "save" ? "Saving…" : "Save changes"}
            </button>
          </div>
        </form>
      </section>

      {/* Couple */}
      <aside aria-labelledby="couple-card" className="space-y-5">
        <section className="space-y-4 rounded-3xl bg-ld-surface-container p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-full bg-ld-surface-container-lowest text-ld-primary"><Users className="size-4" aria-hidden="true" /></span>
            <h2 id="couple-card" className="font-display text-ld-title-lg text-ld-on-surface">Your couple space</h2>
          </div>
          <dl className="space-y-3 text-ld-body-sm">
            <div className="flex justify-between gap-3"><dt className="text-ld-on-surface-variant">Workspace</dt><dd className="font-semibold text-ld-on-surface">{workspaceId ? `#${workspaceId}` : "Not set up"}</dd></div>
            <div className="flex justify-between gap-3"><dt className="text-ld-on-surface-variant">Partner</dt><dd className="font-semibold text-ld-on-surface">{partnerName ?? "Not connected yet"}</dd></div>
            <div className="flex justify-between gap-3"><dt className="text-ld-on-surface-variant">Members</dt><dd className="font-semibold text-ld-on-surface">{memberCount} of 2</dd></div>
          </dl>
          <p className="text-ld-caption text-ld-on-surface-variant">
            {memberCount < 2 ? "Your partner can join with the invite code from onboarding." : "You are both connected."}
          </p>
        </section>

        <section className="rounded-3xl bg-ld-surface-container-lowest p-6 shadow-sm">
          <p className="text-ld-label-sm font-semibold uppercase tracking-widest text-ld-primary">Privacy</p>
          <p className="mt-2 text-ld-body-sm text-ld-on-surface-variant">Your profile photo is stored privately. Only you can see the file, and links to it expire after an hour.</p>
        </section>
      </aside>
    </div>
  );
}
