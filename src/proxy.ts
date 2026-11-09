import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabasePublicConfig } from "@/lib/supabase/config";

/**
 * Optimistic session check and cookie refresh. Private pages are still verified on the server
 * in requireVerifiedUser(); this layer only keeps unauthenticated visitors out early.
 */
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });
  const { url, key } = getSupabasePublicConfig();

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const { data } = await supabase.auth.getClaims();
  const signedIn = Boolean(data?.claims);
  const path = request.nextUrl.pathname;

  if (!signedIn && path.startsWith("/app")) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }
  if (signedIn && (path === "/login" || path === "/signup")) {
    return NextResponse.redirect(new URL("/app", request.url));
  }
  return response;
}

export const config = {
  matcher: ["/app/:path*", "/login", "/signup"],
};
