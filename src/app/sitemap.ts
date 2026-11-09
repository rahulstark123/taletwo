import type { MetadataRoute } from "next";
import { getAppUrl } from "@/config/site";

/** Public marketing routes only. Private /app routes are never listed. */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = getAppUrl();
  const routes = ["", "/features", "/how-it-works", "/pricing", "/about", "/contact", "/privacy", "/terms"];
  return routes.map((route) => ({
    url: `${base}${route}`,
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : 0.6,
  }));
}
