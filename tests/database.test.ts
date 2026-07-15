import { randomUUID } from "node:crypto";
import { beforeAll, describe, expect, it } from "vitest";
import { migrate } from "drizzle-orm/libsql/migrator";
import { eq } from "drizzle-orm";
import { getDatabase } from "@/lib/db/connection";
import { adminIdentities, blogPosts, categories } from "@/lib/db/schema";
import { deletePost, savePost, setPostStatus } from "@/lib/blog/mutations";
import {
  getArchivePosts,
  getPostsForDiscovery,
  getPublishedPostBySlug,
} from "@/lib/blog/queries";

const authorId = "20000000-0000-4000-8000-000000000001";
const categoryId = "20000000-0000-4000-8000-000000000002";
const db = getDatabase();

beforeAll(async () => {
  await migrate(db, { migrationsFolder: "./drizzle" });
  await db.insert(adminIdentities).values({
    id: authorId,
    provider: "github",
    providerAccountId: "test-admin",
    email: "admin@example.com",
  });
  await db
    .insert(categories)
    .values({ id: categoryId, name: "Growth", slug: "growth" });
});

const draftInput = {
  title: "Database-backed draft",
  slug: "database-backed-draft",
  excerpt: "A complete excerpt used by the integration tests.",
  content:
    "## Tested content\n\nThis post is created through the real mutation service.",
  categoryId,
  newCategory: "",
  tags: "testing, progress",
  featuredImageUrl: "",
  featuredImageAlt: "",
  seoTitle: "",
  seoDescription: "",
  intent: "draft" as const,
  scheduledFor: "",
};

describe("Turso-compatible database workflow", () => {
  let postId = "";
  it("creates a draft with category and tag assignments", async () => {
    const result = await savePost(draftInput, authorId);
    expect(result.ok).toBe(true);
    if (result.ok) postId = result.id;
    expect(await getPublishedPostBySlug(draftInput.slug)).toBeNull();
  });

  it("edits the draft and rejects a duplicate slug", async () => {
    const updated = await savePost(
      { ...draftInput, title: "Edited database-backed draft" },
      authorId,
      postId,
    );
    expect(updated.ok).toBe(true);
    const duplicate = await savePost(
      { ...draftInput, title: "Duplicate title" },
      authorId,
    );
    expect(duplicate.ok).toBe(false);
    if (!duplicate.ok) expect(duplicate.error).toMatch(/slug/i);
  });

  it("publishes and unpublishes without leaking drafts", async () => {
    expect(await setPostStatus(postId, "published")).toBe(true);
    expect((await getPublishedPostBySlug(draftInput.slug))?.title).toMatch(
      /Edited/,
    );
    expect(await setPostStatus(postId, "draft")).toBe(true);
    expect(await getPublishedPostBySlug(draftInput.slug)).toBeNull();
  });

  it("makes elapsed scheduled posts public but excludes future schedules", async () => {
    await db.insert(blogPosts).values({
      id: randomUUID(),
      title: "Elapsed schedule",
      slug: "elapsed-schedule",
      excerpt: "This scheduled post is now visible.",
      content: "Scheduled content that is long enough.",
      status: "scheduled",
      authorId,
      categoryId,
      scheduledFor: new Date(Date.now() - 60_000),
    });
    await db.insert(blogPosts).values({
      id: randomUUID(),
      title: "Future schedule",
      slug: "future-schedule",
      excerpt: "This scheduled post must remain private.",
      content: "Future content that is long enough.",
      status: "scheduled",
      authorId,
      categoryId,
      scheduledFor: new Date(Date.now() + 86_400_000),
    });
    expect(await getPublishedPostBySlug("elapsed-schedule")).not.toBeNull();
    expect(await getPublishedPostBySlug("future-schedule")).toBeNull();
  });

  it("supports archive content search and excludes drafts from discovery feeds", async () => {
    const archive = await getArchivePosts({ search: "scheduled content" });
    expect(archive.posts.map((post) => post.slug)).toContain(
      "elapsed-schedule",
    );
    const discovery = await getPostsForDiscovery();
    expect(discovery.some((post) => post.slug === "future-schedule")).toBe(
      false,
    );
    expect(discovery.some((post) => post.slug === draftInput.slug)).toBe(false);
  });

  it("deletes posts and leaves no public route", async () => {
    expect(await deletePost(postId)).toBe(true);
    expect(
      await db.select().from(blogPosts).where(eq(blogPosts.id, postId)),
    ).toHaveLength(0);
  });
});
