import "server-only";

import {
  and,
  asc,
  desc,
  eq,
  inArray,
  like,
  lte,
  or,
  sql,
  type SQL,
} from "drizzle-orm";
import {
  adminIdentities,
  blogPosts,
  blogPostTags,
  categories,
  db,
  tags,
} from "@/lib/db/server";

export const publicationDate = sql<Date>`coalesce(${blogPosts.publishedAt}, ${blogPosts.scheduledFor})`;

export function publicPostCondition(now = new Date()) {
  return or(
    and(eq(blogPosts.status, "published"), lte(blogPosts.publishedAt, now)),
    and(eq(blogPosts.status, "scheduled"), lte(blogPosts.scheduledFor, now)),
  );
}

const summarySelection = {
  id: blogPosts.id,
  title: blogPosts.title,
  slug: blogPosts.slug,
  excerpt: blogPosts.excerpt,
  featuredImageUrl: blogPosts.featuredImageUrl,
  featuredImageAlt: blogPosts.featuredImageAlt,
  publishedAt: blogPosts.publishedAt,
  scheduledFor: blogPosts.scheduledFor,
  updatedAt: blogPosts.updatedAt,
  categoryId: categories.id,
  categoryName: categories.name,
  categorySlug: categories.slug,
};

export async function getPublishedPosts(limit = 6) {
  return db
    .select(summarySelection)
    .from(blogPosts)
    .leftJoin(categories, eq(blogPosts.categoryId, categories.id))
    .where(publicPostCondition())
    .orderBy(desc(publicationDate))
    .limit(limit);
}

export async function getCategories() {
  return db.select().from(categories).orderBy(asc(categories.name));
}

export async function getTags() {
  return db.select().from(tags).orderBy(asc(tags.name));
}

export type ArchiveFilters = {
  search?: string;
  category?: string;
  tag?: string;
  page?: number;
  pageSize?: number;
};

export async function getArchivePosts(filters: ArchiveFilters = {}) {
  const page = Math.max(1, filters.page ?? 1);
  const pageSize = Math.min(24, Math.max(1, filters.pageSize ?? 9));
  const conditions: (SQL | undefined)[] = [publicPostCondition()];

  if (filters.search?.trim()) {
    const pattern = `%${filters.search.trim().toLowerCase()}%`;
    conditions.push(
      or(
        like(sql`lower(${blogPosts.title})`, pattern),
        like(sql`lower(${blogPosts.excerpt})`, pattern),
        like(sql`lower(${blogPosts.content})`, pattern),
      ),
    );
  }
  if (filters.category) conditions.push(eq(categories.slug, filters.category));
  if (filters.tag) conditions.push(eq(tags.slug, filters.tag));

  const where = and(...conditions);
  const from = db
    .select(summarySelection)
    .from(blogPosts)
    .leftJoin(categories, eq(blogPosts.categoryId, categories.id))
    .leftJoin(blogPostTags, eq(blogPosts.id, blogPostTags.postId))
    .leftJoin(tags, eq(blogPostTags.tagId, tags.id));

  const posts = await from
    .where(where)
    .groupBy(blogPosts.id)
    .orderBy(desc(publicationDate))
    .limit(pageSize)
    .offset((page - 1) * pageSize);

  const countResult = await db
    .select({ count: sql<number>`count(distinct ${blogPosts.id})` })
    .from(blogPosts)
    .leftJoin(categories, eq(blogPosts.categoryId, categories.id))
    .leftJoin(blogPostTags, eq(blogPosts.id, blogPostTags.postId))
    .leftJoin(tags, eq(blogPostTags.tagId, tags.id))
    .where(where);

  return {
    posts,
    page,
    pageSize,
    total: Number(countResult[0]?.count ?? 0),
    totalPages: Math.max(
      1,
      Math.ceil(Number(countResult[0]?.count ?? 0) / pageSize),
    ),
  };
}

export async function getPublishedPostBySlug(slug: string) {
  const rows = await db
    .select({
      ...summarySelection,
      content: blogPosts.content,
      seoTitle: blogPosts.seoTitle,
      seoDescription: blogPosts.seoDescription,
      authorName: adminIdentities.email,
    })
    .from(blogPosts)
    .leftJoin(categories, eq(blogPosts.categoryId, categories.id))
    .innerJoin(adminIdentities, eq(blogPosts.authorId, adminIdentities.id))
    .where(and(eq(blogPosts.slug, slug), publicPostCondition()))
    .limit(1);

  const post = rows[0];
  if (!post) return null;

  const postTags = await db
    .select({ id: tags.id, name: tags.name, slug: tags.slug })
    .from(blogPostTags)
    .innerJoin(tags, eq(blogPostTags.tagId, tags.id))
    .where(eq(blogPostTags.postId, post.id))
    .orderBy(asc(tags.name));

  const effectiveDate = post.publishedAt ?? post.scheduledFor ?? post.updatedAt;
  const [previous] = await db
    .select({ title: blogPosts.title, slug: blogPosts.slug })
    .from(blogPosts)
    .where(
      and(publicPostCondition(), sql`${publicationDate} < ${effectiveDate}`),
    )
    .orderBy(desc(publicationDate))
    .limit(1);
  const [next] = await db
    .select({ title: blogPosts.title, slug: blogPosts.slug })
    .from(blogPosts)
    .where(
      and(publicPostCondition(), sql`${publicationDate} > ${effectiveDate}`),
    )
    .orderBy(asc(publicationDate))
    .limit(1);

  return {
    ...post,
    tags: postTags,
    previous: previous ?? null,
    next: next ?? null,
  };
}

export async function getAdminPosts(filters: {
  search?: string;
  status?: string;
  category?: string;
  sort?: string;
}) {
  const conditions: (SQL | undefined)[] = [];
  if (filters.search?.trim()) {
    conditions.push(
      like(
        sql`lower(${blogPosts.title})`,
        `%${filters.search.trim().toLowerCase()}%`,
      ),
    );
  }
  if (["draft", "scheduled", "published"].includes(filters.status ?? "")) {
    conditions.push(
      eq(
        blogPosts.status,
        filters.status as "draft" | "scheduled" | "published",
      ),
    );
  }
  if (filters.category) conditions.push(eq(categories.slug, filters.category));

  const sortColumn =
    filters.sort === "created"
      ? blogPosts.createdAt
      : filters.sort === "published"
        ? blogPosts.publishedAt
        : filters.sort === "scheduled"
          ? blogPosts.scheduledFor
          : blogPosts.updatedAt;

  return db
    .select({
      ...summarySelection,
      status: blogPosts.status,
      createdAt: blogPosts.createdAt,
    })
    .from(blogPosts)
    .leftJoin(categories, eq(blogPosts.categoryId, categories.id))
    .where(and(...conditions))
    .orderBy(desc(sortColumn));
}

export async function getAdminPost(id: string) {
  const rows = await db
    .select()
    .from(blogPosts)
    .where(eq(blogPosts.id, id))
    .limit(1);
  if (!rows[0]) return null;
  const postTags = await db
    .select({ id: tags.id, name: tags.name, slug: tags.slug })
    .from(blogPostTags)
    .innerJoin(tags, eq(blogPostTags.tagId, tags.id))
    .where(eq(blogPostTags.postId, id));
  return { ...rows[0], tags: postTags };
}

export async function getPostsForDiscovery() {
  return db
    .select({
      slug: blogPosts.slug,
      title: blogPosts.title,
      excerpt: blogPosts.excerpt,
      content: blogPosts.content,
      publishedAt: blogPosts.publishedAt,
      scheduledFor: blogPosts.scheduledFor,
      updatedAt: blogPosts.updatedAt,
    })
    .from(blogPosts)
    .where(publicPostCondition())
    .orderBy(desc(publicationDate));
}

export async function getTagNamesForPosts(postIds: string[]) {
  if (!postIds.length) return new Map<string, string[]>();
  const rows = await db
    .select({ postId: blogPostTags.postId, name: tags.name })
    .from(blogPostTags)
    .innerJoin(tags, eq(blogPostTags.tagId, tags.id))
    .where(inArray(blogPostTags.postId, postIds));
  const result = new Map<string, string[]>();
  for (const row of rows)
    result.set(row.postId, [...(result.get(row.postId) ?? []), row.name]);
  return result;
}
