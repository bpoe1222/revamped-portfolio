import Link from "next/link";

export function BlogHeader() {
  return (
    <header className="journal-header">
      <Link className="journal-wordmark" href="/blog">
        <span>The</span> Honest Build
      </Link>
      <nav aria-label="The Honest Build navigation">
        <Link href="/blog">Home</Link>
        <Link href="/blog/archive">Archive</Link>
        <Link href="/blog#about">About</Link>
        <a href="/blog/rss.xml">RSS</a>
      </nav>
    </header>
  );
}
