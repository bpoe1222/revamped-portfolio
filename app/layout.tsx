import type { Metadata } from "next";
import {
  PERSON_NAME,
  PORTFOLIO_DESCRIPTION,
  PORTFOLIO_TITLE,
  SITE_NAME,
  SITE_ORIGIN,
  portfolioSocialMetadata,
} from "@/lib/seo";
import "./globals.scss";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_ORIGIN),
  applicationName: SITE_NAME,
  title: {
    default: PORTFOLIO_TITLE,
    template: "%s | Bailey Poe",
  },
  description: PORTFOLIO_DESCRIPTION,
  authors: [{ name: PERSON_NAME, url: "/" }],
  creator: PERSON_NAME,
  publisher: PERSON_NAME,
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    apple: "/logo192.png",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  ...portfolioSocialMetadata(PORTFOLIO_TITLE, PORTFOLIO_DESCRIPTION),
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
