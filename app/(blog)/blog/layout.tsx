import type { Metadata } from "next";
import { BlogHeader } from "@/components/blog/blog-header";
import Link from "next/link";

export const metadata: Metadata = {
  title: { default: "The Honest Build", template: "%s | The Honest Build" },
  description:
    "Faith, family, work, and becoming better one honest step at a time.",
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
