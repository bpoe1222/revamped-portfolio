import { formatDate } from "@/lib/blog/content";

type PostCardProps = {
  post: {
    slug: string;
    title: string;
    excerpt: string;
    categoryName: string | null;
    publishedAt: Date | null;
    scheduledFor: Date | null;
  };
  index?: number;
};

export function PostCard({ post, index }: PostCardProps) {
  return (
    <article className="journal-card">
      <div className="journal-card__meta">
        {typeof index === "number" && (
          <span>{String(index + 1).padStart(2, "0")}</span>
        )}
        <span>{post.categoryName ?? "Uncategorized"}</span>
        <time dateTime={(post.publishedAt ?? post.scheduledFor)?.toISOString()}>
          {formatDate(post.publishedAt ?? post.scheduledFor)}
        </time>
      </div>
      <h2>
        <a href={`/blog/${post.slug}`}>{post.title}</a>
      </h2>
      <p>{post.excerpt}</p>
      <a className="journal-card__link" href={`/blog/${post.slug}`}>
        Read the piece <span aria-hidden="true">→</span>
      </a>
    </article>
  );
}
