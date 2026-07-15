import type { MetadataRoute } from "next";
import { getPostsForDiscovery } from "@/lib/blog/queries";
import { siteUrl } from "@/lib/blog/content";

export const dynamic = "force-dynamic";

function publicLastModified(post: {
  publishedAt: Date | null;
  scheduledFor: Date | null;
  updatedAt: Date;
}) {
  const published = post.publishedAt ?? post.scheduledFor;
  return published && published > post.updatedAt ? published : post.updatedAt;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getPostsForDiscovery();
  const latestBlogUpdate = posts.reduce<Date | undefined>((latest, post) => {
    const modified = publicLastModified(post);
    return !latest || modified > latest ? modified : latest;
  }, undefined);

  return [
    { url: siteUrl("/"), changeFrequency: "monthly", priority: 1 },
    { url: siteUrl("/resume"), changeFrequency: "monthly", priority: 0.6 },
    { url: siteUrl("/contact"), changeFrequency: "yearly", priority: 0.5 },
    {
      url: siteUrl("/blog"),
      lastModified: latestBlogUpdate,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: siteUrl("/blog/archive"),
      lastModified: latestBlogUpdate,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    ...posts.map((post) => ({
      url: siteUrl(`/blog/${post.slug}`),
      lastModified: publicLastModified(post),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
