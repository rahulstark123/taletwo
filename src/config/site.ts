/** Public product identity. Non-secret, safe to import anywhere. */
export const SITE = {
  name: "TaleTwo",
  tagline: "Your little world, made for two.",
  brandMessage: "Every little moment deserves a place.",
  description:
    "A private space to save your memories, share your dreams, plan your future and celebrate every little moment together.",
  locale: "en_US",
  /** Placeholder until the production domain and mailbox exist. */
  supportEmail: "hello@taletwo.example",
} as const;

/** Public base URL from NEXT_PUBLIC_APP_URL; falls back to localhost for development. */
export function getAppUrl(): string {
  return (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(/\/$/, "");
}
