/**
 * Landing-page artwork. Each entry points to a small illustrated SVG in public/images/landing/.
 * SVG is used for speed: each file is a few kilobytes and stays sharp at any size.
 * To use real photos later, add a JPG or WebP file, change `file`, and set `format` to "raster".
 */
export const LANDING_PHOTOS = {
  memoryKitchen: {
    file: "memory-kitchen.svg",
    format: "svg",
    alt: "A couple cooking pasta together in a sunlit kitchen, laughing",
    width: 400,
    height: 500,
    available: true,
  },
  memoryCoast: {
    file: "memory-coast.svg",
    format: "svg",
    alt: "A couple sitting together by the sea at sunset",
    width: 400,
    height: 500,
    available: true,
  },
  familyTable: {
    file: "family-table.svg",
    format: "svg",
    alt: "A family sharing a meal together at a wooden table",
    width: 600,
    height: 400,
    available: true,
  },
  momentBanner: {
    file: "moment-banner.jpg",
    format: "raster",
    alt: "A couple holding hands over coffee cups on a table",
    width: 1200,
    height: 525,
    available: true,
  },
} as const;

export type LandingPhotoKey = keyof typeof LANDING_PHOTOS;
