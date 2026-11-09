import Link from "next/link";
import { cacheLife } from "next/cache";
import { Wordmark } from "@/components/brand/logo";
import { SITE } from "@/config/site";

const PRODUCT = [
  { label: "Features", href: "/features" },
  { label: "How It Works", href: "/how-it-works" },
  { label: "Pricing", href: "/pricing" },
] as const;

const COMPANY = [
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
] as const;

const LEGAL = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Service", href: "/terms" },
] as const;

export async function MarketingFooter() {
  const year = await currentYear();
  return (
    <footer className="mt-20 w-full border-t border-ld-surface-container-highest bg-ld-surface-container-low">
      <div className="mx-auto max-w-[1240px] px-5 pb-10 pt-14 md:px-6 lg:px-8">
        <div className="mb-14 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-5 lg:gap-8">
          <div className="flex flex-col gap-3 lg:col-span-2">
            <Wordmark />
            <p className="max-w-sm font-display text-ld-headline-lg-mobile italic text-ld-on-surface-variant">
              Your little world, made for two.
            </p>
            <a href={`mailto:${SITE.supportEmail}`} className="text-ld-body-sm text-ld-on-surface-variant transition-colors duration-200 hover:text-ld-primary">
              {SITE.supportEmail}
            </a>
          </div>
          <FooterColumn title="Product" links={PRODUCT} />
          <FooterColumn title="Company" links={COMPANY} />
          <FooterColumn title="Legal" links={LEGAL} />
        </div>
        <div className="flex flex-col items-center justify-between gap-2 border-t border-ld-surface-container-highest pt-6 sm:flex-row">
          <p className="text-ld-caption text-ld-outline">© {year} TaleTwo. All rights reserved.</p>
          <p className="text-ld-caption text-ld-outline">Crafted with care for cross-border couples worldwide.</p>
        </div>
        <p className="pt-4 text-center font-display text-ld-body-sm italic text-ld-on-surface-variant">
          Gratitude to the universe for all the success and love.
        </p>
      </div>
    </footer>
  );
}

function FooterColumn({ title, links }: { title: string; links: readonly { label: string; href: string }[] }) {
  return (
    <nav aria-label={`Footer ${title.toLowerCase()}`} className="flex flex-col gap-3">
      <span className="text-ld-label-sm uppercase tracking-wider text-ld-outline">{title}</span>
      <ul className="flex flex-col gap-3">
        {links.map((link) => (
          <li key={link.href} className="leading-none">
            <Link href={link.href} className="text-ld-body-sm text-ld-on-surface-variant transition-colors duration-200 hover:text-ld-primary">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/** Cached per day so the footer stays static-friendly under Cache Components. */
async function currentYear(): Promise<number> {
  "use cache";
  cacheLife("days");
  return new Date().getFullYear();
}
