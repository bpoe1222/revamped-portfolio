CREATE TABLE `admin_identities` (
	`id` text PRIMARY KEY NOT NULL,
	`provider` text NOT NULL,
	`provider_account_id` text NOT NULL,
	`email` text NOT NULL,
	`role` text DEFAULT 'admin' NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	CONSTRAINT "admin_role_check" CHECK("admin_identities"."role" = 'admin')
);
--> statement-breakpoint
CREATE UNIQUE INDEX `admin_provider_account_unique` ON `admin_identities` (`provider`,`provider_account_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `admin_email_unique` ON `admin_identities` (`email`);--> statement-breakpoint
CREATE TABLE `blog_post_tags` (
	`post_id` text NOT NULL,
	`tag_id` text NOT NULL,
	PRIMARY KEY(`post_id`, `tag_id`),
	FOREIGN KEY (`post_id`) REFERENCES `blog_posts`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`tag_id`) REFERENCES `tags`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `blog_post_tag_tag_idx` ON `blog_post_tags` (`tag_id`);--> statement-breakpoint
CREATE TABLE `blog_posts` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`slug` text NOT NULL,
	`excerpt` text NOT NULL,
	`content` text NOT NULL,
	`content_format` text DEFAULT 'markdown' NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`featured_image_url` text,
	`featured_image_alt` text,
	`seo_title` text,
	`seo_description` text,
	`author_id` text NOT NULL,
	`category_id` text,
	`published_at` integer,
	`scheduled_for` integer,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`author_id`) REFERENCES `admin_identities`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON UPDATE no action ON DELETE set null,
	CONSTRAINT "blog_post_status_check" CHECK("blog_posts"."status" in ('draft', 'scheduled', 'published')),
	CONSTRAINT "blog_post_format_check" CHECK("blog_posts"."content_format" = 'markdown'),
	CONSTRAINT "blog_post_schedule_check" CHECK("blog_posts"."status" != 'scheduled' or "blog_posts"."scheduled_for" is not null)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `blog_post_slug_unique` ON `blog_posts` (`slug`);--> statement-breakpoint
CREATE INDEX `blog_post_slug_idx` ON `blog_posts` (`slug`);--> statement-breakpoint
CREATE INDEX `blog_post_status_idx` ON `blog_posts` (`status`);--> statement-breakpoint
CREATE INDEX `blog_post_published_at_idx` ON `blog_posts` (`published_at`);--> statement-breakpoint
CREATE INDEX `blog_post_scheduled_for_idx` ON `blog_posts` (`scheduled_for`);--> statement-breakpoint
CREATE INDEX `blog_post_category_idx` ON `blog_posts` (`category_id`);--> statement-breakpoint
CREATE INDEX `blog_post_author_idx` ON `blog_posts` (`author_id`);--> statement-breakpoint
CREATE TABLE `categories` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`description` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `category_slug_unique` ON `categories` (`slug`);--> statement-breakpoint
CREATE UNIQUE INDEX `category_name_unique` ON `categories` (`name`);--> statement-breakpoint
CREATE TABLE `tags` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `tag_slug_unique` ON `tags` (`slug`);--> statement-breakpoint
CREATE UNIQUE INDEX `tag_name_unique` ON `tags` (`name`);