import { PostEditor } from "@/components/admin/post-editor";
import { getCategories } from "@/lib/blog/queries";
import { createPostAction } from "../actions";

export default async function NewPostPage() {
  const categories = await getCategories();
  return (
    <main className="admin-page admin-editor-page">
      <div className="admin-title">
        <div>
          <a className="admin-back" href="/admin/blog">
            ← All posts
          </a>
          <h1>New post</h1>
        </div>
      </div>
      <PostEditor action={createPostAction} categories={categories} />
    </main>
  );
}
