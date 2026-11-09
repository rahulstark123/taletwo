"use client";

import { LoadingModal } from "@/components/shared/loading-modal";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, Heart } from "lucide-react";
import { AuthNotice } from "@/components/auth/auth-notice";
import { apiCall } from "@/components/onboarding/api-client";

export function CompleteStep({
  members,
}: {
  members: { userId: string; displayName: string; initial: string }[];
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="space-y-8 text-center">
      <div className="flex flex-col items-center gap-4">
        <div className="flex -space-x-3">
          {members.map((m, i) => (
            <span
              key={m.userId}
              className={
                "flex size-14 items-center justify-center rounded-full text-ld-title-md font-semibold ring-4 ring-ld-surface-container-lowest " +
                (i === 0 ? "bg-ld-secondary-container text-ld-on-secondary-container" : "bg-ld-tertiary-fixed text-ld-on-tertiary-fixed-variant")
              }
              aria-hidden="true"
            >
              {m.initial}
            </span>
          ))}
        </div>
        <p className="text-ld-body-sm text-ld-on-surface-variant">
          {members.map((m) => m.displayName).join(" & ")}
        </p>
      </div>

      <div className="space-y-3">
        <h2 className="font-display text-ld-headline-lg-mobile text-ld-on-surface md:text-ld-headline-lg">
          Your little world is ready.
        </h2>
        <p className="text-ld-body-md text-ld-on-surface-variant">
          {members.length < 2 ? "Your partner can join any time with your space code." : "Both of you are connected."}
        </p>
        <Heart className="mx-auto size-5 fill-ld-primary text-ld-primary" aria-hidden="true" />
      </div>

      <LoadingModal open={busy} label="Opening TaleTwo" />

      {error && <AuthNotice tone="error">{error}</AuthNotice>}

      <button
        type="button"
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          setError(null);
          const result = await apiCall("/api/onboarding/complete", { method: "POST" });
          if (!result.ok) {
            setBusy(false);
            setError(result.error.message);
            return;
          }
          router.push("/app");
          router.refresh();
        }}
        className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-ld-primary px-8 text-ld-label-md text-ld-on-primary shadow-[0_8px_20px_rgba(201,126,139,0.28)] transition-colors hover:bg-ld-on-primary-fixed-variant disabled:opacity-60 sm:w-auto"
      >
        {busy ? "Opening…" : "Enter TaleTwo"}
        <ArrowRight className="size-4" aria-hidden="true" />
      </button>
    </div>
  );
}
