import "server-only";

/**
 * City and town search for the place-of-birth field. Uses Photon (open-source search over OpenStreetMap
 * data), called from the server so the browser never contacts it directly. No API key is needed.
 */

export interface PlaceSuggestion {
  label: string;
  name: string;
  country: string;
}

const API_URL = "https://photon.komoot.io/api/";
const PLACE_TYPES = new Set(["city", "town", "village"]);

interface PhotonFeature {
  properties?: { name?: string; state?: string; country?: string; type?: string };
}

export async function searchPlaces(query: string): Promise<PlaceSuggestion[]> {
  const q = query.trim();
  if (q.length < 2) return [];

  const url = `${API_URL}?${new URLSearchParams({ q, limit: "8", lang: "en", osm_tag: "place" })}`;
  let res: Response;
  try {
    res = await fetch(url, {
      headers: { "user-agent": "TaleTwo/1.0" },
      signal: AbortSignal.timeout(8_000),
      cache: "no-store",
    });
  } catch {
    return [];
  }
  if (!res.ok) return [];

  const json = (await res.json()) as { features?: PhotonFeature[] };
  const seen = new Set<string>();
  const out: PlaceSuggestion[] = [];
  for (const f of json.features ?? []) {
    const p = f.properties;
    if (!p?.name || !p.country || !p.type || !PLACE_TYPES.has(p.type)) continue;
    const label = [p.name, p.state, p.country].filter(Boolean).join(", ");
    if (seen.has(label)) continue;
    seen.add(label);
    out.push({ label, name: p.name, country: p.country });
    if (out.length === 6) break;
  }
  return out;
}
