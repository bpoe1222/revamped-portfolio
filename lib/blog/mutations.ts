import "server-only";

import { and, eq, ne } from "drizzle-orm";
import { blogPosts, blogPostTags, categories, db, tags } from "@/lib/db/server";
import { parseTags, slugify, type PostInput } from "./validation";

function isUniqueConstraintError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const candidate = error as {
    message?: string;
    code?: string;
    extendedCode?: string;
    cause?: unknown;
  };
  return (
    /UNIQUE/i.test(candidate.message ?? "") ||
    /UNIQUE/i.test(candidate.code ?? "") ||
    /UNIQUE/i.test(candidate.extendedCode ?? "") ||
    (candidate.cause !== error && isUniqueConstraintError(candidate.cause))
  );
}

export async function savePost(
  input: PostInput,
  authorId: string,
  postId?: string,
) {
  try {
    return await db.transaction(async (transaction) => {
      const existing = postId
        ? await transaction
            .select()
            .from(blogPosts)
            .where(eq(blogPosts.id, postId))
            .limit(1)
        : [];

      if (postId && !existing[0])
        return { ok: false as const, error: "Post not found." };

      let categoryId = input.categoryId || null;
      if (input.newCategory) {
        const categorySlug = slugify(input.newCategory);
        if (!categorySlug)
          return { ok: false as const, error: "Category name is invalid." };
        await transaction
          .insert(categories)
          .values({
            id: crypto.randomUUID(),
            name: input.newCategory,
            slug: categorySlug,
          })
          .onConflictDoNothing({ target: categories.slug });
        const category = await transaction
          .select({ id: categories.id })
          .from(categories)
          .where(eq(categories.slug, categorySlug))
          .limit(1);
        categoryId = category[0]?.id ?? null;
      } else if (categoryId) {
        const category = await transaction
          .select({ id: categories.id })
          .from(categories)
          .where(eq(categories.id, categoryId))
          .limit(1);
        if (!category[0])
          return {
            ok: false as const,
            error: "Selected category no longer exists.",
          };
      }

      if (!categoryId)
        return { ok: false as const, error: "A category is required." };

      const now = new Date();
      const status =
        input.intent === "publish"
          ? ("published" as const)
          : input.intent === "schedule"
            ? ("scheduled" as const)
            : ("draft" as const);
      const id = postId ?? crypto.randomUUID();
      const values = {
        title: input.title,
        slug: input.slug,
        excerpt: input.excerpt,
        content: input.content,
        contentFormat: "markdown" as const,
        status,
        featuredImageUrl: input.featuredImageUrl || null,
        featuredImageAlt: input.featuredImageAlt || null,
        seoTitle: input.seoTitle || null,
        seoDescription: input.seoDescription || null,
        authorId,
        categoryId,
        publishedAt:
          status === "published" ? (existing[0]?.publishedAt ?? now) : null,
        scheduledFor:
          status === "scheduled" ? new Date(input.scheduledFor) : null,
        updatedAt: now,
      };

      if (postId) {
        await transaction
          .update(blogPosts)
          .set(values)
          .where(eq(blogPosts.id, postId));
        await transaction
          .delete(blogPostTags)
          .where(eq(blogPostTags.postId, postId));
      } else {
        await transaction.insert(blogPosts).values({ id, ...values });
      }

      for (const name of parseTags(input.tags)) {
        const tagSlug = slugify(name);
        if (!tagSlug) continue;
        await transaction
          .insert(tags)
          .values({ id: crypto.randomUUID(), name, slug: tagSlug })
          .onConflictDoNothing({ target: tags.slug });
        const tag = await transaction
          .select({ id: tags.id })
          .from(tags)
          .where(eq(tags.slug, tagSlug))
          .limit(1);
        if (tag[0]) {
          await transaction
            .insert(blogPostTags)
            .values({ postId: id, tagId: tag[0].id })
            .onConflictDoNothing();
        }
      }

      return { ok: true as const, id, slug: input.slug };
    });
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return {
        ok: false as const,
        error: "That slug is already used by another post.",
      };
    }
    console.error("Blog post save failed", {
      operation: postId ? "update" : "create",
      errorName: error instanceof Error ? error.name : "UnknownError",
    });
    return {
      ok: false as const,
      error: "The post could not be saved. Please try again.",
    };
  }
}

export async function setPostStatus(id: string, status: "draft" | "published") {
  const post = await db
    .select({ id: blogPosts.id, publishedAt: blogPosts.publishedAt })
    .from(blogPosts)
    .where(eq(blogPosts.id, id))
    .limit(1);
  if (!post[0]) return false;

  await db
    .update(blogPosts)
    .set({
      status,
      publishedAt:
        status === "published" ? (post[0].publishedAt ?? new Date()) : null,
      scheduledFor: null,
      updatedAt: new Date(),
    })
    .where(eq(blogPosts.id, id));
  return true;
}

export async function deletePost(id: string) {
  const result = await db.delete(blogPosts).where(eq(blogPosts.id, id));
  return result.rowsAffected > 0;
}

export async function slugIsAvailable(slug: string, excludingId?: string) {
  const conditions = [eq(blogPosts.slug, slug)];
  if (excludingId) conditions.push(ne(blogPosts.id, excludingId));
  const existing = await db
    .select({ id: blogPosts.id })
    .from(blogPosts)
    .where(and(...conditions))
    .limit(1);
  return !existing[0];
}
