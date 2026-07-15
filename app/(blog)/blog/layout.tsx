import type { Metadata } from "next";
import { BlogHeader } from "@/components/blog/blog-header";
import Link from "next/link";

export const metadata: Metadata = {
  title: { default: "The Honest Build", template: "%s | The Honest Build" },
  description:
    "Faith, family, work, and becoming better one honest step at a time.",
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "The Honest Build",
    title: "The Honest Build",
    description:
      "Faith, family, work, and becoming better one honest step at a time.",
    url: "/blog",
    images: [
      {
        url: "/blog/honest-build-workbench.webp",
        width: 1536,
        height: 1024,
        alt: "A green notebook on a workshop table",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "The Honest Build",
    description:
      "Faith, family, work, and becoming better one honest step at a time.",
    images: [
      {
        url: "/blog/honest-build-workbench.webp",
        alt: "A green notebook on a workshop table",
      },
    ],
  },
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="journal" data-site-layout="blog">
      <BlogHeader />
      {children}
      <footer className="journal-footer">
        <p>The Honest Build</p>
        <p>
          Faith, family, work, and becoming better one honest step at a time.
        </p>
        <Link href="/">BaileyPoe.dev</Link>
      </footer>
    </div>
  );
}
