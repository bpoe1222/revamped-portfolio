import type { Metadata } from "next";
import { SiteNav } from "@/components/site-nav";

export const metadata: Metadata = {
  title: { default: "Bailey Poe", template: "%s | Bailey Poe" },
  description: "Quality systems, program leadership, and operational clarity.",
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
