import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PostCard } from "@/components/blog/post-card";
import { getPublicCategories, getPublishedPosts } from "@/lib/blog/queries";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { absolute: "The Honest Build" },
  description:
    "Faith, family, work, and becoming better one honest step at a time.",
  alternates: {
    canonical: "/blog",
    types: { "application/rss+xml": "/blog/rss.xml" },
  },
  openGraph: {
    title: "The Honest Build",
    description:
      "Faith, family, work, and becoming better one honest step at a time.",
    type: "website",
    locale: "en_US",
    siteName: "The Honest Build",
    url: "/blog",
    images: [
      {
        url: "/blog/thb-logo.png",
        width: 1254,
        height: 1254,
        alt: "The Honest Build logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "The Honest Build",
    description:
      "Faith, family, work, and becoming better one honest step at a time.",
    images: [
      {
        url: "/blog/thb-logo.png",
        alt: "The Honest Build logo",
      },
    ],
  },
};

export default async function BlogPage() {
  const [posts, categories] = await Promise.all([
    getPublishedPosts(7),
    getPublicCategories(),
  ]);
  const [featured, ...recent] = posts;

  return (
    <main>
      <section className="journal-masthead" aria-labelledby="journal-title">
        <div
          className="registration-mark registration-mark--one"
          aria-hidden="true"
        />
        <p className="journal-kicker">
          Field notes on a life under construction
        </p>
        <h1 id="journal-title">The Honest Build</h1>
        <p className="journal-tagline">
          Faith, family, work, and becoming better one honest step at a time.
        </p>
        <div className="journal-rule" aria-hidden="true">
          <span>Est. 2026</span>
          <span>Bailey Poe</span>
        </div>
      </section>

      <section className="workbench-hero">
        <Image
          src="/blog/honest-build-workbench.webp"
          alt="A deep green notebook, plans, ruler, pencil, and coffee arranged on a wooden workbench"
          width={1536}
          height={1024}
          priority
          sizes="(max-width: 760px) 100vw, 92vw"
        />
        <p className="workbench-caption">No. 01 — Notes from the workbench</p>
      </section>

      {featured ? (
        <section className="featured-story" aria-labelledby="featured-title">
          <div className="section-label">
            <span>Featured</span>
            <span>Latest dispatch</span>
          </div>
          <article>
            <p>{featured.categoryName ?? "Journal"}</p>
            <h2 id="featured-title">
              <a href={`/blog/${featured.slug}`}>{featured.title}</a>
            </h2>
            <p>{featured.excerpt}</p>
            <a href={`/blog/${featured.slug}`}>Continue reading →</a>
          </article>
        </section>
      ) : (
        <section className="journal-empty">
          <p className="section-label">The bench is ready</p>
          <h2>The first honest piece is still being built.</h2>
          <p>Check back soon. Thoughtful work takes the time it takes.</p>
        </section>
      )}

      <section className="journal-section" aria-labelledby="recent-heading">
        <div className="journal-section__heading">
          <p className="section-label">From the journal</p>
          <h2 id="recent-heading">Recent field notes</h2>
          <Link href="/blog/archive">View the complete archive →</Link>
        </div>
        {recent.length ? (
          <div className="journal-grid">
            {recent.map((post, index) => (
              <PostCard
                post={post}
                index={index}
                headingLevel="h3"
                key={post.id}
              />
            ))}
          </div>
        ) : (
          featured && (
            <p className="journal-inline-empty">
              More field notes are on the way.
            </p>
          )
        )}
      </section>

      <section
        className="journal-categories"
        aria-labelledby="category-heading"
      >
        <p className="section-label">Browse the work</p>
        <h2 id="category-heading">Built around what matters.</h2>
        <div>
          {categories.map((category, index) => (
            <a
              href={`/blog/archive?category=${category.slug}`}
              key={category.id}
            >
              <span>{String(index + 1).padStart(2, "0")}</span>
              {category.name}
            </a>
          ))}
        </div>
      </section>

      <section className="journal-about" id="about">
        <div>
          <p className="section-label">About Bailey</p>
          <h2>Trying to live the lesson before writing it down.</h2>
        </div>
        <div>
          <p>
            I’m Bailey Poe—a husband, father, quality-minded builder, and
            lifelong work in progress. This is where I write plainly about the
            things that shape a good life.
          </p>
          <p>
            The goal is not a polished image. It is an honest record of becoming
            more faithful, useful, steady, and present.
          </p>
        </div>
      </section>

      <section className="journal-now" aria-labelledby="now-heading">
        <p className="section-label">Now / Summer 2026</p>
        <h2 id="now-heading">Current focus</h2>
        <ul>
          <li>Leading with clarity without pretending to have every answer.</li>
          <li>Protecting unhurried time with family.</li>
          <li>Choosing small, repeatable progress over dramatic starts.</li>
        </ul>
      </section>
    </main>
  );
}
