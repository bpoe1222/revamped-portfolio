import type { Metadata } from "next";
import { PortfolioAquaEasterEgg } from "@/components/portfolio-aqua-easter-egg";
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
    <PortfolioAquaEasterEgg>
      <div className="portfolio-app-frame">
        <div className="aqua-window-titlebar" aria-hidden="true">
          <span>BaileyPoe.dev</span>
        </div>
        <SiteNav />
        <div className="portfolio-app-content">{children}</div>
      </div>
    </PortfolioAquaEasterEgg>
  );
}
