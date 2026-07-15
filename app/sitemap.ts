import type { MetadataRoute } from "next";
import { getPostsForDiscovery } from "@/lib/blog/queries";
import { siteUrl } from "@/lib/blog/content";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getPostsForDiscovery();
  return [
    { url: siteUrl("/"), changeFrequency: "monthly", priority: 1 },
    { url: siteUrl("/resume"), changeFrequency: "monthly", priority: 0.6 },
    { url: siteUrl("/contact"), changeFrequency: "yearly", priority: 0.5 },
    { url: siteUrl("/blog"), changeFrequency: "weekly", priority: 0.9 },
    { url: siteUrl("/blog/archive"), changeFrequency: "weekly", priority: 0.7 },
    ...posts.map((post) => ({
      url: siteUrl(`/blog/${post.slug}`),
      lastModified: post.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
