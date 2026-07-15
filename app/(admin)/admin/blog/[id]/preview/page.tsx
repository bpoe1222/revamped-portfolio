import type { Metadata } from "next";
import { unstable_noStore as noStore } from "next/cache";
import { notFound } from "next/navigation";
import { Markdown } from "@/components/blog/markdown";
import { estimatedReadingMinutes, formatDate } from "@/lib/blog/content";
import { getAdminPost } from "@/lib/blog/queries";

export const metadata: Metadata = {
  title: "Secure draft preview",
  robots: { index: false, follow: false, nocache: true },
};
type Params = Promise<{ id: string }>;

export default async function DraftPreview({ params }: { params: Params }) {
  noStore();
  const { id } = await params;
  const post = await getAdminPost(id);
  if (!post) notFound();
  return (
    <main className="preview-page">
      <div className="preview-banner">
        <strong>Private {post.status} preview</strong>
        <span>
          This page requires administrator authorization and is not indexed or
          publicly cached.
        </span>
        <a href={`/admin/blog/${id}/edit`}>Return to editor</a>
      </div>
      <article className="article-page">
        <header className="article-header">
          <p className="article-category">Preview</p>
          <h1>{post.title}</h1>
          <p className="article-deck">{post.excerpt}</p>
          <div className="article-byline">
            <span>By Bailey Poe</span>
            <span>{estimatedReadingMinutes(post.content)} min read</span>
            <span>Updated {formatDate(post.updatedAt)}</span>
          </div>
        </header>
        <Markdown content={post.content} />
      </article>
    </main>
  );
}
