import type { ReactNode } from "react";
import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { SITE, getAppUrl } from "@/config/site";
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

export const metadata: Metadata = {
  metadataBase: new URL(getAppUrl()),
  title: {
    default: `${SITE.name} — ${SITE.tagline}`,
    template: `%s · ${SITE.name}`,
  },
  description: SITE.description,
  applicationName: SITE.name,
  icons: { icon: "/icons/favicon.svg" },
};

export const viewport: Viewport = {
  themeColor: "#FAF7F2",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${playfair.variable} ${inter.variable} h-full antialiased`}>
      <body suppressHydrationWarning className="min-h-dvh bg-background text-foreground">{children}</body>
    </html>
  );
}
