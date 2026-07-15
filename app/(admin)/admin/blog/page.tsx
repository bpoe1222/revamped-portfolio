import { ConfirmButton } from "@/components/admin/confirm-button";
import { formatDate } from "@/lib/blog/content";
import { getAdminPosts, getCategories } from "@/lib/blog/queries";
import {
  deletePostAction,
  publishPostAction,
  unpublishPostAction,
} from "./actions";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;
const one = (value: string | string[] | undefined) =>
  typeof value === "string" ? value : "";

export default async function AdminDashboard({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const filters = {
    search: one(params.q),
    status: one(params.status),
    category: one(params.category),
    sort: one(params.sort),
  };
  const [posts, categories] = await Promise.all([
    getAdminPosts(filters),
    getCategories(),
  ]);

  return (
    <main className="admin-page">
      <div className="admin-title">
        <div>
          <p className="eyebrow">Editorial desk</p>
          <h1>Posts</h1>
          <p>
            {posts.length} result{posts.length === 1 ? "" : "s"}
          </p>
        </div>
        <a className="admin-primary" href="/admin/blog/new">
          New post
        </a>
      </div>
      {params.deleted && (
        <p className="admin-notice" role="status">
          Post deleted.
        </p>
      )}
      <form className="admin-filters" method="get">
        <label>
          <span>Search</span>
          <input
            type="search"
            name="q"
            defaultValue={filters.search}
            placeholder="Search titles"
          />
        </label>
        <label>
          <span>Status</span>
          <select name="status" defaultValue={filters.status}>
            <option value="">All statuses</option>
            <option value="draft">Draft</option>
            <option value="scheduled">Scheduled</option>
            <option value="published">Published</option>
          </select>
        </label>
        <label>
          <span>Category</span>
          <select name="category" defaultValue={filters.category}>
            <option value="">All categories</option>
            {categories.map((category) => (
              <option value={category.slug} key={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>Sort by</span>
          <select name="sort" defaultValue={filters.sort}>
            <option value="updated">Last updated</option>
            <option value="created">Created</option>
            <option value="published">Published</option>
            <option value="scheduled">Scheduled</option>
          </select>
        </label>
        <button className="admin-secondary" type="submit">
          Filter
        </button>
      </form>

      {posts.length ? (
        <div className="admin-post-list">
          {posts.map((post) => (
            <article className="admin-post-row" key={post.id}>
              <div>
                <span className={`status-badge status-badge--${post.status}`}>
                  {post.status}
                </span>
                <p>{post.categoryName ?? "Uncategorized"}</p>
              </div>
              <div>
                <h2>
                  <a href={`/admin/blog/${post.id}/edit`}>{post.title}</a>
                </h2>
                <p>
                  Updated {formatDate(post.updatedAt)}
                  {post.status === "scheduled" && post.scheduledFor
                    ? ` · Scheduled ${formatDate(post.scheduledFor)}`
                    : ""}
                </p>
              </div>
              <div className="admin-row-actions">
                <a href={`/admin/blog/${post.id}/preview`} target="_blank">
                  Preview
                </a>
                <a href={`/admin/blog/${post.id}/edit`}>Edit</a>
                {post.status === "published" ? (
                  <form action={unpublishPostAction.bind(null, post.id)}>
                    <button type="submit">Unpublish</button>
                  </form>
                ) : (
                  <form action={publishPostAction.bind(null, post.id)}>
                    <button type="submit">Publish</button>
                  </form>
                )}
                <form action={deletePostAction.bind(null, post.id)}>
                  <ConfirmButton
                    label="Delete"
                    message={`Permanently delete “${post.title}”? This cannot be undone.`}
                  />
                </form>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <section className="admin-empty">
          <h2>No posts found.</h2>
          <p>Create a post or adjust the filters.</p>
          <a href="/admin/blog/new">Create the first post →</a>
        </section>
      )}
    </main>
  );
}
