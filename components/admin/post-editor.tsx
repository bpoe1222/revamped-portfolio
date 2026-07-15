"use client";

import { useEffect, useRef, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import remarkGfm from "remark-gfm";
import type { EditorState } from "@/app/(admin)/admin/blog/actions";

type Category = { id: string; name: string };
type EditorPost = {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  categoryId: string | null;
  tags: { name: string }[];
  featuredImageUrl: string | null;
  featuredImageAlt: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  status: "draft" | "scheduled" | "published";
  scheduledFor: Date | null;
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}

function SubmitButton({
  value,
  children,
}: {
  value: string;
  children: React.ReactNode;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      className={value === "publish" ? "admin-primary" : "admin-secondary"}
      name="intent"
      value={value}
      type="submit"
      disabled={pending}
    >
      {pending ? "Saving…" : children}
    </button>
  );
}

export function PostEditor({
  action,
  categories,
  post,
}: {
  action: (state: EditorState, data: FormData) => Promise<EditorState>;
  categories: Category[];
  post?: EditorPost;
}) {
  const [state, formAction] = useFormState(action, { ok: false });
  const [title, setTitle] = useState(post?.title ?? "");
  const [slug, setSlug] = useState(post?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(post));
  const [content, setContent] = useState(post?.content ?? "");
  const [dirty, setDirty] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => {
      if (!dirty) return;
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const fieldError = (name: string) => state.fieldErrors?.[name]?.[0];
  const localSchedule = post?.scheduledFor
    ? new Date(
        post.scheduledFor.getTime() -
          post.scheduledFor.getTimezoneOffset() * 60_000,
      )
        .toISOString()
        .slice(0, 16)
    : "";

  return (
    <form
      className="post-editor"
      action={formAction}
      ref={formRef}
      onChange={() => setDirty(true)}
    >
      {state.error && (
        <div className="admin-alert" role="alert">
          {state.error}
        </div>
      )}
      <div className="editor-layout">
        <div className="editor-main">
          <label>
            <span>Title</span>
            <input
              name="title"
              value={title}
              onChange={(event) => {
                const value = event.target.value;
                setTitle(value);
                if (!slugTouched) setSlug(slugify(value));
              }}
              required
              maxLength={180}
              aria-describedby={fieldError("title") ? "title-error" : undefined}
            />
          </label>
          {fieldError("title") && (
            <p className="field-error" id="title-error">
              {fieldError("title")}
            </p>
          )}
          <label>
            <span>Slug</span>
            <div className="slug-field">
              <span>baileypoe.dev/blog/</span>
              <input
                name="slug"
                value={slug}
                onChange={(event) => {
                  setSlugTouched(true);
                  setSlug(event.target.value);
                }}
                required
              />
            </div>
          </label>
          {fieldError("slug") && (
            <p className="field-error">{fieldError("slug")}</p>
          )}
          <label>
            <span>Excerpt</span>
            <textarea
              name="excerpt"
              defaultValue={post?.excerpt}
              rows={4}
              maxLength={500}
              required
            />
          </label>
          {fieldError("excerpt") && (
            <p className="field-error">{fieldError("excerpt")}</p>
          )}

          <div className="markdown-editor">
            <label>
              <span>Article (Markdown)</span>
              <textarea
                name="content"
                value={content}
                onChange={(event) => setContent(event.target.value)}
                rows={24}
                required
              />
            </label>
            <section aria-label="Markdown preview">
              <p className="editor-label">Live preview</p>
              <div className="article-prose">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeSanitize]}
                >
                  {content || "*Your preview will appear here.*"}
                </ReactMarkdown>
              </div>
            </section>
          </div>
        </div>

        <aside className="editor-sidebar">
          <fieldset>
            <legend>Publishing</legend>
            <label>
              <span>Schedule date (local time)</span>
              <input
                name="scheduledFor"
                type="datetime-local"
                defaultValue={localSchedule}
              />
            </label>
            {fieldError("scheduledFor") && (
              <p className="field-error">{fieldError("scheduledFor")}</p>
            )}
            <p className="editor-help">
              Stored in UTC. A scheduled post becomes public automatically after
              this time.
            </p>
          </fieldset>
          <fieldset>
            <legend>Organization</legend>
            <label>
              <span>Category</span>
              <select name="categoryId" defaultValue={post?.categoryId ?? ""}>
                <option value="">Choose a category</option>
                {categories.map((category) => (
                  <option value={category.id} key={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span>Or create category</span>
              <input name="newCategory" maxLength={80} />
            </label>
            {fieldError("categoryId") && (
              <p className="field-error">{fieldError("categoryId")}</p>
            )}
            <label>
              <span>Tags</span>
              <input
                name="tags"
                defaultValue={post?.tags.map((tag) => tag.name).join(", ")}
                placeholder="faith, leadership, progress"
              />
            </label>
            <p className="editor-help">Separate tags with commas.</p>
          </fieldset>
          <fieldset>
            <legend>Featured image</legend>
            <label>
              <span>External image URL</span>
              <input
                name="featuredImageUrl"
                type="url"
                defaultValue={post?.featuredImageUrl ?? ""}
              />
            </label>
            <label>
              <span>Alt text</span>
              <input
                name="featuredImageAlt"
                defaultValue={post?.featuredImageAlt ?? ""}
                maxLength={240}
              />
            </label>
            {fieldError("featuredImageAlt") && (
              <p className="field-error">{fieldError("featuredImageAlt")}</p>
            )}
            <p className="editor-help">
              Uploads will be enabled after Vercel Blob is configured.
            </p>
          </fieldset>
          <fieldset>
            <legend>Search and sharing</legend>
            <label>
              <span>SEO title</span>
              <input
                name="seoTitle"
                defaultValue={post?.seoTitle ?? ""}
                maxLength={70}
              />
            </label>
            <label>
              <span>SEO description</span>
              <textarea
                name="seoDescription"
                defaultValue={post?.seoDescription ?? ""}
                rows={4}
                maxLength={170}
              />
            </label>
          </fieldset>
        </aside>
      </div>
      <div className="editor-actions">
        <SubmitButton value="draft">Save draft</SubmitButton>
        <SubmitButton value="schedule">Schedule</SubmitButton>
        <SubmitButton value="publish">Publish now</SubmitButton>
      </div>
    </form>
  );
}
