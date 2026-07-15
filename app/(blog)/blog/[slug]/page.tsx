import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Markdown } from "@/components/blog/markdown";
import {
  estimatedReadingMinutes,
  formatDate,
  siteUrl,
} from "@/lib/blog/content";
import { getPublishedPostBySlug } from "@/lib/blog/queries";

export const dynamic = "force-dynamic";
type Params = Promise<{ slug: string }>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug);
  if (!post)
    return { title: "Post not found", robots: { index: false, follow: false } };

  const title = post.seoTitle || post.title;
  const description = post.seoDescription || post.excerpt;
  const images = post.featuredImageUrl
    ? [{ url: post.featuredImageUrl, alt: post.featuredImageAlt ?? post.title }]
    : [
        {
          url: "/blog/honest-build-workbench.webp",
          alt: "The Honest Build workbench",
        },
      ];
  return {
    title,
    description,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: "article",
      url: `/blog/${post.slug}`,
      title,
      description,
      publishedTime: (post.publishedAt ?? post.scheduledFor)?.toISOString(),
      modifiedTime: post.updatedAt.toISOString(),
      authors: ["Bailey Poe"],
      tags: post.tags.map((tag) => tag.name),
      images,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: images.map((image) => image.url),
    },
  };
}

export default async function ArticlePage({ params }: { params: Params }) {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug);
  if (!post) notFound();

  const publishedDate = post.publishedAt ?? post.scheduledFor ?? post.updatedAt;
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.seoDescription || post.excerpt,
    datePublished: publishedDate.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    mainEntityOfPage: siteUrl(`/blog/${post.slug}`),
    author: { "@type": "Person", name: "Bailey Poe", url: siteUrl("/") },
    publisher: { "@type": "Person", name: "Bailey Poe" },
    image: post.featuredImageUrl
      ? [post.featuredImageUrl]
      : [siteUrl("/blog/honest-build-workbench.webp")],
    keywords: post.tags.map((tag) => tag.name).join(", "),
  };

  return (
    <main className="article-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
        }}
      />
      <header className="article-header">
        <Link className="article-back" href="/blog/archive">
          ← Archive
        </Link>
        <p className="article-category">{post.categoryName ?? "Journal"}</p>
        <h1>{post.title}</h1>
        <p className="article-deck">{post.excerpt}</p>
        <div className="article-byline">
          <span>By Bailey Poe</span>
          <time dateTime={publishedDate.toISOString()}>
            {formatDate(publishedDate)}
          </time>
          <span>{estimatedReadingMinutes(post.content)} min read</span>
          {post.updatedAt.getTime() > publishedDate.getTime() + 86_400_000 && (
            <span>Updated {formatDate(post.updatedAt)}</span>
          )}
        </div>
      </header>

      {post.featuredImageUrl && (
        <figure className="article-image">
          {/* External author-provided URLs intentionally use a native image until Blob is configured. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={post.featuredImageUrl} alt={post.featuredImageAlt ?? ""} />
        </figure>
      )}

      <article>
        <Markdown content={post.content} />
        {post.tags.length > 0 && (
          <footer className="article-tags" aria-label="Post tags">
            {post.tags.map((tag) => (
              <a href={`/blog/archive?tag=${tag.slug}`} key={tag.id}>
                #{tag.name}
              </a>
            ))}
          </footer>
        )}
      </article>

      <nav className="article-neighbors" aria-label="Adjacent posts">
        {post.previous ? (
          <a href={`/blog/${post.previous.slug}`}>
            <span>Previous</span>
            {post.previous.title}
          </a>
        ) : (
          <span />
        )}
        {post.next && (
          <a href={`/blog/${post.next.slug}`}>
            <span>Next</span>
            {post.next.title}
          </a>
        )}
      </nav>
    </main>
  );
}
