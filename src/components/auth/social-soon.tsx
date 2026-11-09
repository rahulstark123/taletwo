import { Divider } from "@/components/auth/divider";

/** Disabled Google button with a clear reason. Shown until OAuth is configured in Milestone 2. */
export function SocialSoonButton({ label }: { label: string }) {
  return (
    <>
      <Divider />
      <button
        type="button"
        disabled
        aria-describedby="google-soon"
        className="flex h-12 w-full cursor-not-allowed items-center justify-center gap-2 rounded-full bg-ld-surface-container-low text-ld-label-md text-ld-on-surface-variant"
      >
        {label}
      </button>
      <p id="google-soon" className="text-center text-ld-caption text-ld-outline">
        Google sign-in is coming soon.
      </p>
    </>
  );
}
