import { portfolioHomeMetadata, portfolioStructuredData } from "@/lib/seo";
import LegacyPortfolio from "@/src/App";

export const metadata = portfolioHomeMetadata;

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(portfolioStructuredData).replace(
            /</g,
            "\\u003c",
          ),
        }}
      />
      <LegacyPortfolio />
    </>
  );
}
