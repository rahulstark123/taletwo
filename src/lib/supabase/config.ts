/**
 * Public Supabase settings. The publishable (anon) key is designed to be shipped to the browser;
 * row-level security protects data. Never put the service role key in this file.
 */
export function getSupabasePublicConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error("Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.");
  }
  return { url, key };
}
