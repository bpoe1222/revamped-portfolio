import type { Metadata } from "next";

export const SITE_ORIGIN = "https://baileypoe.dev";
export const SITE_NAME = "BaileyPoe.dev";
export const PERSON_NAME = "Bailey Poe";
export const PORTFOLIO_TITLE =
  "Bailey Poe | Quality Program Manager & Developer";
export const PORTFOLIO_DESCRIPTION =
  "Portfolio of Bailey Poe, a Quality Program Manager and developer focused on quality systems, program operations, release readiness, and front-end development.";
export const PORTFOLIO_IMAGE_ALT =
  "Bailey Poe — Quality Program Manager and developer";

const portfolioImage = {
  url: "/opengraph-image",
  width: 1200,
  height: 630,
  alt: PORTFOLIO_IMAGE_ALT,
};

export function absoluteUrl(path = "/") {
  return new URL(path, SITE_ORIGIN).toString();
}

export function portfolioSocialMetadata(
  title: string,
  description: string,
  path?: string,
): Pick<Metadata, "openGraph" | "twitter"> {
  return {
    openGraph: {
      type: "website",
      locale: "en_US",
      siteName: SITE_NAME,
      title,
      description,
      ...(path ? { url: path } : {}),
      images: [{ ...portfolioImage }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [{ ...portfolioImage }],
    },
  };
}

type PortfolioPageMetadata = {
  title: string;
  description: string;
  path: string;
  socialTitle?: string;
  absoluteTitle?: boolean;
};

export function createPortfolioPageMetadata({
  title,
  description,
  path,
  socialTitle = title,
  absoluteTitle = false,
}: PortfolioPageMetadata): Metadata {
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical: path },
    ...portfolioSocialMetadata(socialTitle, description, path),
  };
}

export const portfolioHomeMetadata = createPortfolioPageMetadata({
  title: PORTFOLIO_TITLE,
  description: PORTFOLIO_DESCRIPTION,
  path: "/",
  absoluteTitle: true,
});

export const portfolioResumeMetadata = createPortfolioPageMetadata({
  title: "Resume",
  socialTitle: "Bailey Poe Resume | Quality Program Manager & Developer",
  description:
    "Review Bailey Poe’s experience in quality program management, quality systems, release readiness, program operations, React, and software development.",
  path: "/resume",
});

export const portfolioContactMetadata = createPortfolioPageMetadata({
  title: "Contact",
  socialTitle: "Contact Bailey Poe | Quality Programs & Development",
  description:
    "Contact Bailey Poe about quality programs, program operations, software development, or practical technology solutions.",
  path: "/contact",
});

export const portfolioStructuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person",
      "@id": `${SITE_ORIGIN}/#person`,
      name: PERSON_NAME,
      url: absoluteUrl("/"),
      jobTitle: "Quality Program Manager",
      description:
        "Quality Program Manager and developer focused on quality systems, program operations, release readiness, and front-end development.",
      knowsAbout: [
        "Quality systems",
        "Program operations",
        "Release readiness",
        "Front-end development",
      ],
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_ORIGIN}/#website`,
      url: absoluteUrl("/"),
      name: SITE_NAME,
      alternateName: PERSON_NAME,
      description: PORTFOLIO_DESCRIPTION,
      inLanguage: "en-US",
      publisher: { "@id": `${SITE_ORIGIN}/#person` },
    },
  ],
};
