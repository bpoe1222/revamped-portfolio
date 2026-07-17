import { getPostsForDiscovery } from "@/lib/blog/queries";
import { siteUrl } from "@/lib/blog/content";
import {
  BLOG_LOGO_PATH,
  BLOG_NAME,
  BLOG_PATH,
  BLOG_RSS_PATH,
} from "@/lib/blog/branding";

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
  const body = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel><title>${BLOG_NAME}</title><link>${siteUrl(BLOG_PATH)}</link><description>Faith, family, work, and becoming better one honest step at a time.</description><language>en-us</language><atom:link href="${siteUrl(BLOG_RSS_PATH)}" rel="self" type="application/rss+xml"/><image><url>${siteUrl(BLOG_LOGO_PATH)}</url><title>${BLOG_NAME}</title><link>${siteUrl(BLOG_PATH)}</link></image>${items}</channel></rss>`;

  return new Response(body, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600",
    },
  });
}
