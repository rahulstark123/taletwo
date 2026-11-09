import Image from "next/image";
import { LANDING_PHOTOS, type LandingPhotoKey } from "@/config/landing-images";
import { cn } from "@/lib/utils";

/**
 * Artwork slot for the landing page. Shows the image from public/images/landing/ when its entry in
 * src/config/landing-images.ts is `available: true`. Until then it shows a labelled placeholder.
 * SVG artwork is drawn with a plain <img>, since it is already small and needs no resizing.
 */
export function LandingPhoto({
  photo,
  className,
  sizes = "(min-width: 1024px) 40vw, 100vw",
}: {
  photo: LandingPhotoKey;
  className?: string;
  sizes?: string;
}) {
  const config = LANDING_PHOTOS[photo];
  const src = `/images/landing/${config.file}`;

  return (
    <div className={cn("relative overflow-hidden rounded-2xl bg-gradient-to-br from-ld-secondary-container/70 via-ld-surface-container to-ld-tertiary-fixed/60", className)}>
      {config.available ? (
        config.format === "svg" ? (
          // eslint-disable-next-line @next/next/no-img-element -- static SVG artwork, already tiny
          <img src={src} alt={config.alt} width={config.width} height={config.height} loading="lazy" decoding="async" className="h-full w-full object-cover" />
        ) : (
          <Image src={src} alt={config.alt} width={config.width} height={config.height} sizes={sizes} className="h-full w-full object-cover" />
        )
      ) : (
        <div role="img" aria-label={config.alt} className="flex h-full min-h-48 w-full items-end p-4">
          <span className="rounded-full bg-ld-surface/90 px-3 py-1 text-ld-caption text-ld-on-surface-variant">
            Photo to come: {config.alt.toLowerCase()}
          </span>
        </div>
      )}
    </div>
  );
}
