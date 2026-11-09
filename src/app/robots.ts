import type { MetadataRoute } from "next";
import { getAppUrl } from "@/config/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/app", "/app/", "/api/"] }],
    sitemap: `${getAppUrl()}/sitemap.xml`,
  };
}
