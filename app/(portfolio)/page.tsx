import type { Metadata } from "next";
import LegacyPortfolio from "@/src/App";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default function HomePage() {
  return <LegacyPortfolio />;
}
