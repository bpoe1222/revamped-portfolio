import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PostCard } from "@/components/blog/post-card";
import {
  getArchivePosts,
  getPublicCategories,
  getPublicTags,
} from "@/lib/blog/queries";

export const dynamic = "force-dynamic";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;
const archiveDescription =
  "Browse every published field note from The Honest Build, with search and filters for the subjects that matter most.";
const archiveImage = {
  url: "/blog/honest-build-workbench.webp",
  alt: "A green notebook on a workshop table",
};

function one(value: string | string[] | undefined) {
  return typeof value === "string" ? value : "";
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<Metadata> {
  const params = await searchParams;
  const search = one(params.q).trim();
  const category = one(params.category).trim();
  const tag = one(params.tag).trim();
  const rawPage = one(params.page).trim();
  const page = Math.max(1, Number.parseInt(rawPage || "1", 10) || 1);
  const hasFilters = Boolean(search || category || tag);
  const hasRepeatedParameter = Object.values(params).some(Array.isArray);
  const hasUnknownParameter = Object.keys(params).some(
    (key) => !["q", "category", "tag", "page"].includes(key),
  );
  const hasInvalidPage = Boolean(
    rawPage && (!/^\d+$/.test(rawPage) || Number(rawPage) < 1),
  );
  const shouldNoIndex =
    hasFilters || hasRepeatedParameter || hasUnknownParameter || hasInvalidPage;
  const isIndexedPage = !shouldNoIndex && page > 1;
  const canonical = isIndexedPage
    ? `/blog/archive?page=${page}`
    : "/blog/archive";
  const title = isIndexedPage
    ? `Archive — Page ${page} — The Honest Build`
    : "Archive — The Honest Build";

  return {
    title: { absolute: title },
    description: archiveDescription,
    alternates: { canonical },
    ...(shouldNoIndex
      ? { robots: { index: false, follow: true } as const }
      : {}),
    openGraph: {
      type: "website",
      locale: "en_US",
      siteName: "The Honest Build",
      title,
      description: archiveDescription,
      url: canonical,
      images: [{ ...archiveImage, width: 1536, height: 1024 }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: archiveDescription,
      images: [archiveImage],
    },
  };
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
    getPublicCategories(),
    getPublicTags(),
  ]);

  if (page > archive.totalPages) notFound();

  const pageHref = (target: number) => {
    const query = new URLSearchParams();
    if (search) query.set("q", search);
    if (category) query.set("category", category);
    if (tag) query.set("tag", tag);
    if (target > 1) query.set("page", String(target));
    const serialized = query.toString();
    return serialized ? `/blog/archive?${serialized}` : "/blog/archive";
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
