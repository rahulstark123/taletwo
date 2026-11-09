import type { ReactNode } from "react";
import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { SITE, getAppUrl } from "@/config/site";
import { JsonLd } from "@/components/seo/json-ld";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const APP_URL = getAppUrl();

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: `${SITE.name}: a private app for couples`,
    template: `%s | ${SITE.name}`,
  },
  description: SITE.description,
  keywords: [...SITE.keywords],
  applicationName: SITE.name,
  authors: [{ name: SITE.name, url: APP_URL }],
  creator: SITE.name,
  publisher: SITE.name,
  category: "lifestyle",
  icons: { icon: "/icons/favicon.svg", shortcut: "/icons/favicon.svg" },
  manifest: "/manifest.webmanifest",
  formatDetection: { telephone: false, email: false, address: false },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
  },
  openGraph: {
    type: "website",
    siteName: SITE.name,
    title: `${SITE.name}: a private app for couples`,
    description: SITE.description,
    url: APP_URL,
    locale: SITE.locale,
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE.name}: a private app for couples`,
    description: SITE.description,
  },
};

/** Organisation and website facts, so search engines and AI tools know who runs the site. */
const siteJsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE.name,
    url: APP_URL,
    logo: `${APP_URL}/icons/favicon.svg`,
    description: SITE.description,
    email: SITE.supportEmail,
  },
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE.name,
    url: APP_URL,
    description: SITE.description,
    inLanguage: "en",
  },
];

export const viewport: Viewport = {
  themeColor: "#FAF7F2",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${playfair.variable} ${inter.variable} h-full antialiased`}>
      <body suppressHydrationWarning className="min-h-dvh bg-background text-foreground">
        <JsonLd data={siteJsonLd} />
        {children}
      </body>
    </html>
  );
}
