import { describe, expect, it } from "vitest";
import { metadata as adminMetadata } from "@/app/(admin)/layout";
import { metadata as rootMetadata } from "@/app/layout";
import nextConfig from "@/next.config";
import {
  PORTFOLIO_DESCRIPTION,
  PORTFOLIO_TITLE,
  SITE_ORIGIN,
  portfolioContactMetadata as contactMetadata,
  portfolioHomeMetadata as homeMetadata,
  portfolioResumeMetadata as resumeMetadata,
  portfolioStructuredData,
} from "@/lib/seo";

describe("portfolio SEO metadata", () => {
  it("provides complete production-wide defaults", () => {
    expect(rootMetadata).toMatchObject({
      metadataBase: new URL(SITE_ORIGIN),
      title: {
        default: PORTFOLIO_TITLE,
        template: "%s | Bailey Poe",
      },
      description: PORTFOLIO_DESCRIPTION,
      creator: "Bailey Poe",
      publisher: "Bailey Poe",
      openGraph: {
        siteName: "BaileyPoe.dev",
        images: [{ url: "/opengraph-image", width: 1200, height: 630 }],
      },
      twitter: {
        card: "summary_large_image",
        images: [{ url: "/opengraph-image" }],
      },
      robots: {
        index: true,
        follow: true,
        googleBot: { "max-image-preview": "large" },
      },
    });
  });

  it("gives each portfolio route unique copy and a self-canonical URL", () => {
    expect(homeMetadata).toMatchObject({
      title: { absolute: PORTFOLIO_TITLE },
      description: PORTFOLIO_DESCRIPTION,
      alternates: { canonical: "/" },
      openGraph: { url: "/" },
    });
    expect(resumeMetadata).toMatchObject({
      title: "Resume",
      alternates: { canonical: "/resume" },
      openGraph: { url: "/resume" },
    });
    expect(contactMetadata).toMatchObject({
      title: "Contact",
      alternates: { canonical: "/contact" },
      openGraph: { url: "/contact" },
    });

    const descriptions = [
      homeMetadata.description,
      resumeMetadata.description,
      contactMetadata.description,
    ];
    expect(new Set(descriptions).size).toBe(3);
  });

  it("renders factual, parseable Person and WebSite structured data", () => {
    const serialized = JSON.stringify(portfolioStructuredData).replace(
      /</g,
      "\\u003c",
    );
    const data = JSON.parse(serialized) as {
      "@graph"?: Array<Record<string, unknown>>;
    };
    const person = data["@graph"]?.find((entry) => entry["@type"] === "Person");
    const website = data["@graph"]?.find(
      (entry) => entry["@type"] === "WebSite",
    );

    expect(person).toMatchObject({
      name: "Bailey Poe",
      jobTitle: "Quality Program Manager",
      url: "https://baileypoe.dev/",
    });
    expect(person).not.toHaveProperty("sameAs");
    expect(website).toMatchObject({
      name: "BaileyPoe.dev",
      alternateName: "Bailey Poe",
      url: "https://baileypoe.dev/",
      inLanguage: "en-US",
    });
  });

  it("keeps every admin HTML route noindex by default", () => {
    expect(adminMetadata).toMatchObject({
      robots: { index: false, follow: false, nocache: true },
    });
  });

  it("redirects the stale CRA document to the canonical homepage", async () => {
    const redirects = await nextConfig.redirects?.();
    expect(redirects).toContainEqual({
      source: "/index.html",
      destination: "/",
      permanent: true,
    });
  });
});
