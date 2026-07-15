import { getPostsForDiscovery } from "@/lib/blog/queries";
import { siteUrl } from "@/lib/blog/content";

export const dynamic = "force-dynamic";

function xml(value: string) {
  return value.replace(
    /[<>&'\"]/g,
    (character) =>
      ({
        "<": "&lt;",
        ">": "&gt;",
        "&": "&amp;",
        "'": "&apos;",
        '"': "&quot;",
      })[character] ?? character,
  );
}

export async function GET() {
  const posts = await getPostsForDiscovery();
  const items = posts
    .map((post) => {
      const date = post.publishedAt ?? post.scheduledFor ?? post.updatedAt;
      return `<item><title>${xml(post.title)}</title><link>${xml(siteUrl(`/blog/${post.slug}`))}</link><guid isPermaLink="true">${xml(siteUrl(`/blog/${post.slug}`))}</guid><pubDate>${date.toUTCString()}</pubDate><description>${xml(post.excerpt)}</description></item>`;
    })
    .join("");
  const body = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>The Honest Build</title><link>${siteUrl("/blog")}</link><description>Faith, family, work, and becoming better one honest step at a time.</description><language>en-us</language>${items}</channel></rss>`;

  return new Response(body, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600",
    },
  });
}
