import { sql } from "drizzle-orm";
import {
  check,
  index,
  integer,
  primaryKey,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

const timestamps = {
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
};

export const adminIdentities = sqliteTable(
  "admin_identities",
  {
    id: text("id").primaryKey(),
    provider: text("provider").notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    email: text("email").notNull(),
    role: text("role", { enum: ["admin"] })
      .notNull()
      .default("admin"),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("admin_provider_account_unique").on(
      table.provider,
      table.providerAccountId,
    ),
    uniqueIndex("admin_email_unique").on(table.email),
    check("admin_role_check", sql`${table.role} = 'admin'`),
  ],
);

export const categories = sqliteTable(
  "categories",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    description: text("description"),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("category_slug_unique").on(table.slug),
    uniqueIndex("category_name_unique").on(table.name),
  ],
);

export const tags = sqliteTable(
  "tags",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("tag_slug_unique").on(table.slug),
    uniqueIndex("tag_name_unique").on(table.name),
  ],
);

export const blogPosts = sqliteTable(
  "blog_posts",
  {
    id: text("id").primaryKey(),
    title: text("title").notNull(),
    slug: text("slug").notNull(),
    excerpt: text("excerpt").notNull(),
    content: text("content").notNull(),
    contentFormat: text("content_format", { enum: ["markdown"] })
      .notNull()
      .default("markdown"),
    status: text("status", { enum: ["draft", "scheduled", "published"] })
      .notNull()
      .default("draft"),
    featuredImageUrl: text("featured_image_url"),
    featuredImageAlt: text("featured_image_alt"),
    seoTitle: text("seo_title"),
    seoDescription: text("seo_description"),
    authorId: text("author_id")
      .notNull()
      .references(() => adminIdentities.id, { onDelete: "restrict" }),
    categoryId: text("category_id").references(() => categories.id, {
      onDelete: "set null",
    }),
    publishedAt: integer("published_at", { mode: "timestamp" }),
    scheduledFor: integer("scheduled_for", { mode: "timestamp" }),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("blog_post_slug_unique").on(table.slug),
    index("blog_post_slug_idx").on(table.slug),
    index("blog_post_status_idx").on(table.status),
    index("blog_post_published_at_idx").on(table.publishedAt),
    index("blog_post_scheduled_for_idx").on(table.scheduledFor),
    index("blog_post_category_idx").on(table.categoryId),
    index("blog_post_author_idx").on(table.authorId),
    check(
      "blog_post_status_check",
      sql`${table.status} in ('draft', 'scheduled', 'published')`,
    ),
    check("blog_post_format_check", sql`${table.contentFormat} = 'markdown'`),
    check(
      "blog_post_schedule_check",
      sql`${table.status} != 'scheduled' or ${table.scheduledFor} is not null`,
    ),
  ],
);

export const blogPostTags = sqliteTable(
  "blog_post_tags",
  {
    postId: text("post_id")
      .notNull()
      .references(() => blogPosts.id, { onDelete: "cascade" }),
    tagId: text("tag_id")
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
  },
  (table) => [
    primaryKey({ columns: [table.postId, table.tagId] }),
    index("blog_post_tag_tag_idx").on(table.tagId),
  ],
);

export type BlogPost = typeof blogPosts.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type Tag = typeof tags.$inferSelect;
export type AdminIdentity = typeof adminIdentities.$inferSelect;
