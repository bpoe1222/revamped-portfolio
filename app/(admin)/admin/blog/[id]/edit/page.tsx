import { notFound } from "next/navigation";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { PostEditor } from "@/components/admin/post-editor";
import { formatDate } from "@/lib/blog/content";
import { getAdminPost, getCategories } from "@/lib/blog/queries";
import { deletePostAction, updatePostAction } from "../../actions";

type Params = Promise<{ id: string }>;
type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function EditPostPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const { id } = await params;
  const query = await searchParams;
  const [post, categories] = await Promise.all([
    getAdminPost(id),
    getCategories(),
  ]);
  if (!post) notFound();
  return (
    <main className="admin-page admin-editor-page">
      <div className="admin-title">
        <div>
          <a className="admin-back" href="/admin/blog">
            ← All posts
          </a>
          <h1>Edit post</h1>
          <p>
            Created {formatDate(post.createdAt)} · Updated{" "}
            {formatDate(post.updatedAt)}
          </p>
        </div>
        <div className="admin-title-actions">
          <a
            className="admin-secondary"
            href={`/admin/blog/${id}/preview`}
            target="_blank"
          >
            Secure preview ↗
          </a>
          <form action={deletePostAction.bind(null, id)}>
            <ConfirmButton
              label="Delete post"
              message={`Permanently delete “${post.title}”?`}
            />
          </form>
        </div>
      </div>
      {query.saved && (
        <p className="admin-notice" role="status">
          Post saved.
        </p>
      )}
      <PostEditor
        action={updatePostAction.bind(null, id)}
        categories={categories}
        post={post}
      />
    </main>
  );
}
