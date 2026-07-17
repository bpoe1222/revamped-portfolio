import { afterEach, describe, expect, it, vi } from "vitest";

const discoveryMock = vi.hoisted(() => vi.fn());
const publishedPostMock = vi.hoisted(() => vi.fn());

vi.mock("@/lib/blog/queries", () => ({
  getArchivePosts: vi.fn(),
  getPostsForDiscovery: discoveryMock,
  getPublicCategories: vi.fn(),
  getPublicTags: vi.fn(),
  getPublishedPosts: vi.fn(),
  getPublishedPostBySlug: publishedPostMock,
}));

import { generateMetadata as generateArticleMetadata } from "@/app/(blog)/blog/[slug]/page";
import { GET as getRssFeed } from "@/app/(blog)/blog/rss.xml/route";
import { metadata as blogLayoutMetadata } from "@/app/(blog)/blog/layout";
import { metadata as blogMetadata } from "@/app/(blog)/blog/page";
import { generateMetadata as generateArchiveMetadata } from "@/app/(blog)/blog/archive/page";
import robots from "@/app/robots";
import sitemap from "@/app/sitemap";
import { siteUrl } from "@/lib/blog/content";

afterEach(() => {
  discoveryMock.mockReset();
  publishedPostMock.mockReset();
  vi.unstubAllEnvs();
});

describe("blog discovery metadata", () => {
  it("keeps canonical discovery URLs on the production origin", () => {
    vi.stubEnv("SITE_URL", "http://localhost:3000");
    expect(siteUrl("/blog/example")).toBe("https://baileypoe.dev/blog/example");
  });

  it("provides complete social metadata for the blog landing page", () => {
    expect(blogMetadata).toMatchObject({
      alternates: { canonical: "/blog" },
      openGraph: {
        siteName: "The Honest Build",
        url: "/blog",
        images: [
          {
            url: "/blog/thb-logo.png",
            alt: "The Honest Build logo",
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: "The Honest Build",
        images: [
          {
            url: "/blog/thb-logo.png",
            alt: "The Honest Build logo",
          },
        ],
      },
    });
  });

  it("scopes The Honest Build browser icons to the blog layout", () => {
    expect(blogLayoutMetadata.icons).toMatchObject({
      icon: [
        { url: "/blog/icons/thb-16x16.png", sizes: "16x16" },
        { url: "/blog/icons/thb-32x32.png", sizes: "32x32" },
        { url: "/blog/icons/thb-48x48.png", sizes: "48x48" },
        { url: "/blog/icons/thb-192x192.png", sizes: "192x192" },
        { url: "/blog/icons/thb-512x512.png", sizes: "512x512" },
      ],
      apple: [{ url: "/blog/icons/thb-180x180.png", sizes: "180x180" }],
    });
  });

  it("uses article SEO fields as final values and falls back to post copy", async () => {
    const post = {
      title: "Visible article title",
      slug: "visible-article-title",
      excerpt: "Visible article excerpt.",
      seoTitle: null,
      seoDescription: null,
      featuredImageUrl: null,
      featuredImageAlt: null,
      publishedAt: new Date("2026-01-02T12:00:00.000Z"),
      scheduledFor: null,
      updatedAt: new Date("2026-01-03T12:00:00.000Z"),
      tags: [],
    };
    publishedPostMock.mockResolvedValueOnce(post);

    const fallback = await generateArticleMetadata({
      params: Promise.resolve({ slug: post.slug }),
    });
    expect(fallback).toMatchObject({
      title: post.title,
      description: post.excerpt,
      alternates: { canonical: `/blog/${post.slug}` },
      openGraph: {
        images: [{ url: "/blog/thb-logo.png" }],
      },
      twitter: {
        images: [{ url: "/blog/thb-logo.png" }],
      },
    });

    publishedPostMock.mockResolvedValueOnce({
      ...post,
      featuredImageUrl: "https://images.example.com/post-cover.png",
      featuredImageAlt: "The post-specific cover",
    });
    const withPostImage = await generateArticleMetadata({
      params: Promise.resolve({ slug: post.slug }),
    });
    expect(withPostImage).toMatchObject({
      openGraph: {
        images: [
          {
            url: "https://images.example.com/post-cover.png",
            alt: "The post-specific cover",
          },
        ],
      },
      twitter: {
        images: [
          {
            url: "https://images.example.com/post-cover.png",
            alt: "The post-specific cover",
          },
        ],
      },
    });

    publishedPostMock.mockResolvedValueOnce({
      ...post,
      seoTitle: "Purpose-built search title",
      seoDescription: "Purpose-built search description.",
    });
    const customized = await generateArticleMetadata({
      params: Promise.resolve({ slug: post.slug }),
    });
    expect(customized).toMatchObject({
      title: { absolute: "Purpose-built search title" },
      description: "Purpose-built search description.",
    });
  });

  it("adds feed-level branding without adding images to RSS items", async () => {
    discoveryMock.mockResolvedValueOnce([
      {
        slug: "feed-entry",
        title: "Feed entry",
        excerpt: "An unchanged item description.",
        publishedAt: new Date("2026-01-02T12:00:00.000Z"),
        scheduledFor: null,
        updatedAt: new Date("2026-01-03T12:00:00.000Z"),
      },
    ]);

    const response = await getRssFeed();
    const feed = await response.text();
    const parsedFeed = new DOMParser().parseFromString(feed, "text/xml");
    const item = feed.match(/<item>.*?<\/item>/)?.[0];

    expect(parsedFeed.querySelector("parsererror")).toBeNull();
    expect(parsedFeed.documentElement.tagName).toBe("rss");
    expect(response.headers.get("Content-Type")).toBe(
      "application/rss+xml; charset=utf-8",
    );
    expect(feed).toContain('xmlns:atom="http://www.w3.org/2005/Atom"');
    expect(feed).toContain(
      '<atom:link href="https://baileypoe.dev/blog/rss.xml" rel="self" type="application/rss+xml"/>',
    );
    expect(feed).toContain(
      "<image><url>https://baileypoe.dev/blog/thb-logo.png</url><title>The Honest Build</title><link>https://baileypoe.dev/blog</link></image>",
    );
    expect(item).toContain("<title>Feed entry</title>");
    expect(item).not.toContain("thb-logo.png");
    expect(item).not.toContain("<enclosure");
    expect(item).not.toContain("<media:");
  });

  it("self-canonicalizes clean pagination and noindexes archive filters", async () => {
    const firstPage = await generateArchiveMetadata({
      searchParams: Promise.resolve({}),
    });
    const secondPage = await generateArchiveMetadata({
      searchParams: Promise.resolve({ page: "2" }),
    });
    const filtered = await generateArchiveMetadata({
      searchParams: Promise.resolve({ category: "growth", page: "2" }),
    });

    expect(firstPage).toMatchObject({
      alternates: { canonical: "/blog/archive" },
    });
    expect(firstPage.robots).toBeUndefined();
    expect(secondPage).toMatchObject({
      title: { absolute: "Archive — Page 2 — The Honest Build" },
      alternates: { canonical: "/blog/archive?page=2" },
      openGraph: { url: "/blog/archive?page=2" },
    });
    expect(secondPage.robots).toBeUndefined();
    expect(filtered).toMatchObject({
      alternates: { canonical: "/blog/archive" },
      robots: { index: false, follow: true },
    });
  });

  it("lets crawlers see admin noindex while excluding API endpoints", () => {
    const result = robots();
    expect(result).toEqual({
      rules: { userAgent: "*", allow: "/", disallow: "/api/" },
      sitemap: "https://baileypoe.dev/sitemap.xml",
    });
  });

  it("uses the latest public post update for blog sitemap entries", async () => {
    const earlier = new Date("2026-01-02T12:00:00.000Z");
    const latest = new Date("2026-02-03T12:00:00.000Z");
    discoveryMock.mockResolvedValue([
      {
        slug: "newer-publication",
        title: "Newer publication",
        excerpt: "A public post.",
        publishedAt: new Date("2025-12-01T12:00:00.000Z"),
        scheduledFor: null,
        updatedAt: earlier,
      },
      {
        slug: "recently-updated",
        title: "Recently updated",
        excerpt: "Another public post.",
        publishedAt: new Date("2026-01-01T12:00:00.000Z"),
        scheduledFor: null,
        updatedAt: latest,
      },
    ]);

    const entries = await sitemap();
    const blog = entries.find(
      (entry) => entry.url === "https://baileypoe.dev/blog",
    );
    const archive = entries.find(
      (entry) => entry.url === "https://baileypoe.dev/blog/archive",
    );

    expect(blog?.lastModified).toEqual(latest);
    expect(archive?.lastModified).toEqual(latest);
    expect(entries.some((entry) => entry.url.includes("/admin"))).toBe(false);
    expect(entries.some((entry) => entry.url.includes("/api/"))).toBe(false);
    expect(
      entries.some((entry) => entry.url.includes("googlee9cd6cd17ecb3006")),
    ).toBe(false);
  });
});
