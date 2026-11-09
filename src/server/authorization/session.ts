import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ensureUserProfile } from "@/server/services/profile";

/**
 * Returns the verified Supabase user for this request, or null.
 * getUser() asks the Auth server to verify the session, so it cannot be spoofed with a stale cookie.
 */
export const getCurrentUser = cache(async () => {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;
  return data.user;
});

/**
 * Guard for private routes. Unauthenticated visitors go to login. Unverified accounts go to the
 * verification page. Also guarantees the database profile exists.
 */
export async function requireVerifiedUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!user.email_confirmed_at) redirect("/verify-email");
  await ensureUserProfile(user);
  return user;
}
