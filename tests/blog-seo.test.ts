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
            url: "/blog/honest-build-workbench.webp",
            alt: "A green notebook on a workshop table",
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: "The Honest Build",
        images: [
          {
            url: "/blog/honest-build-workbench.webp",
            alt: "A green notebook on a workshop table",
          },
        ],
      },
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
