import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { safeNextPath } from "@/lib/safe-redirect";
import { recordAuditEvent } from "@/server/services/audit";
import { ensureUserProfile } from "@/server/services/profile";

/**
 * Handles links from Supabase emails (email verification and password recovery).
 * Exchanges the one-time code for a session, creates the profile, then redirects to a safe path.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const next = safeNextPath(searchParams.get("next"));

  if (!code) {
    return NextResponse.redirect(new URL("/login?error=link", origin));
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.user) {
    return NextResponse.redirect(new URL("/login?error=link", origin));
  }

  await ensureUserProfile(data.user);
  if (next === "/app") {
    await recordAuditEvent("auth.email_verified", data.user.id);
  }
  return NextResponse.redirect(new URL(next, origin));
}
