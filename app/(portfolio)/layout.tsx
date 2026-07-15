import type { Metadata } from "next";
import { SiteNav } from "@/components/site-nav";
import {
  PORTFOLIO_DESCRIPTION,
  PORTFOLIO_TITLE,
  portfolioSocialMetadata,
} from "@/lib/seo";

export const metadata: Metadata = {
  title: { default: PORTFOLIO_TITLE, template: "%s | Bailey Poe" },
  description: PORTFOLIO_DESCRIPTION,
  ...portfolioSocialMetadata(PORTFOLIO_TITLE, PORTFOLIO_DESCRIPTION),
};

export default function PortfolioLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <SiteNav />
      {children}
    </>
  );
}
