import { NextResponse } from "next/server";
import { getCurrentUser } from "@/server/authorization/session";
import { searchPlaces } from "@/server/astro/places";

/** GET /api/astro/places?q=mumbai: city suggestions for the place of birth. Signed-in users only. */
export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ ok: false, error: { code: "UNAUTHENTICATED", message: "Please sign in again." } }, { status: 401 });

  const q = new URL(request.url).searchParams.get("q") ?? "";
  if (q.length > 80) return NextResponse.json({ ok: true, data: { places: [] } });
  return NextResponse.json({ ok: true, data: { places: await searchPlaces(q) } });
}
