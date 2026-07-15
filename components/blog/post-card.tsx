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
  headingLevel?: "h2" | "h3";
};

export function PostCard({ post, index, headingLevel = "h2" }: PostCardProps) {
  const Heading = headingLevel;

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
      <Heading>
        <a href={`/blog/${post.slug}`}>{post.title}</a>
      </Heading>
      <p>{post.excerpt}</p>
      <a className="journal-card__link" href={`/blog/${post.slug}`}>
        Read the piece <span aria-hidden="true">→</span>
      </a>
    </article>
  );
}
