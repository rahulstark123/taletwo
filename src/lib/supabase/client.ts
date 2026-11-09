"use client";

import { createBrowserClient } from "@supabase/ssr";
import { getSupabasePublicConfig } from "@/lib/supabase/config";

/** Browser Supabase client. Used only for Auth UI flows that must run in the browser. */
export function createSupabaseBrowserClient() {
  const { url, key } = getSupabasePublicConfig();
  return createBrowserClient(url, key);
}
