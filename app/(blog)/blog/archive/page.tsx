import type { Metadata } from "next";
import Link from "next/link";
import { PostCard } from "@/components/blog/post-card";
import { getArchivePosts, getCategories, getTags } from "@/lib/blog/queries";

export const revalidate = 300;
export const metadata: Metadata = {
  title: { absolute: "Archive — The Honest Build" },
  description: "Every published field note from The Honest Build.",
  alternates: { canonical: "/blog/archive" },
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function one(value: string | string[] | undefined) {
  return typeof value === "string" ? value : "";
}

export default async function ArchivePage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const search = one(params.q);
  const category = one(params.category);
  const tag = one(params.tag);
  const page = Math.max(1, Number.parseInt(one(params.page) || "1", 10) || 1);
  const [archive, categories, tags] = await Promise.all([
    getArchivePosts({ search, category, tag, page }),
    getCategories(),
    getTags(),
  ]);

  const pageHref = (target: number) => {
    const query = new URLSearchParams();
    if (search) query.set("q", search);
    if (category) query.set("category", category);
    if (tag) query.set("tag", tag);
    query.set("page", String(target));
    return `/blog/archive?${query}`;
  };

  return (
    <main className="archive-page">
      <header className="archive-hero">
        <p className="section-label">Complete archive</p>
        <h1>Every note from the build.</h1>
        <p>
          Search the journal or narrow the work by the subjects that matter to
          you.
        </p>
      </header>

      <form className="archive-filters" action="/blog/archive" method="get">
        <label>
          <span>Search</span>
          <input
            name="q"
            type="search"
            defaultValue={search}
            placeholder="Title, excerpt, or text"
          />
        </label>
        <label>
          <span>Category</span>
          <select name="category" defaultValue={category}>
            <option value="">All categories</option>
            {categories.map((item) => (
              <option value={item.slug} key={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>Tag</span>
          <select name="tag" defaultValue={tag}>
            <option value="">All tags</option>
            {tags.map((item) => (
              <option value={item.slug} key={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </label>
        <button type="submit">Apply filters</button>
        {(search || category || tag) && <Link href="/blog/archive">Clear</Link>}
      </form>

      {archive.posts.length ? (
        <div className="journal-grid archive-grid">
          {archive.posts.map((post, index) => (
            <PostCard
              post={post}
              index={(page - 1) * archive.pageSize + index}
              key={post.id}
            />
          ))}
        </div>
      ) : (
        <section className="journal-empty">
          <h2>No notes matched that search.</h2>
          <p>Try a broader phrase or clear one of the filters.</p>
          <Link href="/blog/archive">Reset the archive →</Link>
        </section>
      )}

      {archive.totalPages > 1 && (
        <nav className="pagination" aria-label="Archive pages">
          {page > 1 && <a href={pageHref(page - 1)}>← Newer</a>}
          <span>
            Page {page} of {archive.totalPages}
          </span>
          {page < archive.totalPages && (
            <a href={pageHref(page + 1)}>Older →</a>
          )}
        </nav>
      )}
    </main>
  );
}
