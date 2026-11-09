import type { MetadataRoute } from "next";
import { SITE } from "@/config/site";

/** Web app manifest: name, colours and icon for browsers and "add to home screen". */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SITE.name}: a private app for couples`,
    short_name: SITE.name,
    description: SITE.description,
    start_url: "/",
    display: "standalone",
    background_color: "#FAF7F2",
    theme_color: "#FAF7F2",
    icons: [{ src: "/icons/favicon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
