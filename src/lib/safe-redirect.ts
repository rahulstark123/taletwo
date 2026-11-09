/** Only allow relative, same-site paths after auth, to prevent open redirects. */
export function safeNextPath(value: string | null | undefined, fallback = "/app") {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes("\\")) return fallback;
  return value;
}
