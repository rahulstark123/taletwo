import type { MetadataRoute } from "next";
import { getAppUrl } from "@/config/site";

/** Public marketing pages only. Private /app, auth and admin routes are never listed. */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = getAppUrl();
  const now = new Date();
  const pages: { path: string; priority: number; changeFrequency: "weekly" | "monthly" }[] = [
    { path: "", priority: 1, changeFrequency: "weekly" },
    { path: "/features", priority: 0.9, changeFrequency: "monthly" },
    { path: "/how-it-works", priority: 0.9, changeFrequency: "monthly" },
    { path: "/pricing", priority: 0.9, changeFrequency: "monthly" },
    { path: "/about", priority: 0.6, changeFrequency: "monthly" },
    { path: "/contact", priority: 0.5, changeFrequency: "monthly" },
    { path: "/privacy", priority: 0.4, changeFrequency: "monthly" },
    { path: "/terms", priority: 0.4, changeFrequency: "monthly" },
  ];
  return pages.map((page) => ({
    url: `${base}${page.path || "/"}`,
    lastModified: now,
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  }));
}
