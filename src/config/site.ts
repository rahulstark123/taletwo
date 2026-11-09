/** Public product identity. Non-secret, safe to import anywhere. */
export const SITE = {
  name: "TaleTwo",
  tagline: "Your little world, made for two.",
  brandMessage: "Every little moment deserves a place.",
  description:
    "TaleTwo is a private app for couples to save shared memories, write love letters, keep bucket lists and special days, plan together and play couple games. Free to start.",
  locale: "en_US",
  /** Search terms this site should be found for. Used in page metadata, not as a keyword stuffing list. */
  keywords: [
    "couples app",
    "private app for couples",
    "relationship app",
    "couple memories app",
    "love letters app",
    "shared bucket list for couples",
    "couple daily questions",
    "shared calendar for couples",
    "couple games online",
    "Astro AI for couples",
  ],
  /** Official contact address. Used in the footer, legal pages, support and structured data. */
  supportEmail: "taletwo@zohomail.in",
  /** Phone number for people who want to connect directly. International format. */
  supportPhone: "+919110062950",
} as const;

/** Production address used for canonical links, sitemap and social previews when no env value is set. */
const PRODUCTION_URL = "https://www.gettaletwo.fun";

/** Public base URL from NEXT_PUBLIC_APP_URL; falls back to production on Vercel and localhost in development. */
export function getAppUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_APP_URL?.trim();
  const base = fromEnv || (process.env.NODE_ENV === "production" ? PRODUCTION_URL : "http://localhost:3000");
  return base.replace(/\/$/, "");
}
