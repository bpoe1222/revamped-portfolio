import { mkdir } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { eq, or } from "drizzle-orm";
import { migrate } from "drizzle-orm/libsql/migrator";
import {
  adminIdentities,
  blogPosts,
  blogPostTags,
  categories,
  tags,
} from "../lib/db/schema";

async function main() {
  if (!process.env.TURSO_DATABASE_URL)
    await mkdir(".data", { recursive: true });
  const { db } = await import("../lib/db/connection");
  await migrate(db, { migrationsFolder: "./drizzle" });

  const authorEmail =
    process.env.ADMIN_EMAIL?.trim().toLowerCase() || "author@baileypoe.dev";
  const authorProviderId =
    process.env.ADMIN_GITHUB_ID?.trim() || "seed-author-bailey-poe";
  const seedAuthorId = "00000000-0000-4000-8000-000000000001";

  await db
    .insert(adminIdentities)
    .values({
      id: seedAuthorId,
      provider: "github",
      providerAccountId: authorProviderId,
      email: authorEmail,
      role: "admin",
    })
    .onConflictDoNothing();

  const author = await db
    .select({ id: adminIdentities.id })
    .from(adminIdentities)
    .where(
      or(
        eq(adminIdentities.providerAccountId, authorProviderId),
        eq(adminIdentities.email, authorEmail),
      ),
    )
    .limit(1);
  const authorId = author[0]?.id;
  if (!authorId) throw new Error("Seed author identity could not be resolved.");

  const categorySeeds = [
    [
      "Faith",
      "faith",
      "Notes on belief, practice, doubt, and becoming faithful in ordinary life.",
    ],
    [
      "Family",
      "family",
      "Writing about presence, responsibility, love, and life together.",
    ],
    [
      "Work",
      "work",
      "Clear leadership, useful craft, and work worth doing well.",
    ],
    [
      "Growth",
      "growth",
      "Small, honest steps toward becoming a steadier person.",
    ],
  ] as const;

  for (const [name, slug, description] of categorySeeds) {
    await db
      .insert(categories)
      .values({ id: randomUUID(), name, slug, description })
      .onConflictDoNothing({ target: categories.slug });
  }

  const tagSeeds = ["purpose", "leadership", "progress", "family", "character"];
  for (const name of tagSeeds) {
    await db
      .insert(tags)
      .values({ id: randomUUID(), name, slug: name })
      .onConflictDoNothing({ target: tags.slug });
  }

  const allCategories = await db.select().from(categories);
  const allTags = await db.select().from(tags);
  const categoryId = new Map(
    allCategories.map((category) => [category.slug, category.id]),
  );
  const tagId = new Map(allTags.map((tag) => [tag.slug, tag.id]));

  const postSeeds = [
    {
      id: "10000000-0000-4000-8000-000000000001",
      title: "The Life I’m Trying to Build",
      slug: "the-life-im-trying-to-build",
      category: "growth",
      tags: ["purpose", "family", "character"],
      excerpt:
        "A good life is not assembled in one brave decision. It is built in the quiet, repeated choices that make us more present, faithful, and useful.",
      publishedAt: new Date("2026-06-02T13:00:00.000Z"),
      content: `There is a version of ambition that is mostly about being seen. It asks how impressive the work looks, how quickly the numbers move, and whether other people are paying attention.

I know that version well. I also know how thin it feels when the room gets quiet.

The life I’m trying to build has a different frame. I want to be fully present at home. I want my family to receive more than the tired remains of my attention. I want faith to shape the ordinary Tuesday, not only the moments when I feel certain. I want to do useful work with care and then leave enough of myself for the people I love.

## The plans are smaller than they used to be

That does not mean the plans are less serious. It means I am learning to measure them differently.

I care more about keeping a promise than announcing a goal. I care more about an hour of focused work than a week of talking about what I intend to do. I care more about a calm conversation with my family than winning an argument nobody will remember.

The build happens in those choices. They are not dramatic enough for a highlight reel, but they are strong enough to carry weight.

## A life needs load-bearing habits

Every structure depends on a few parts that cannot be decorative. For me, those parts are prayer, honest work, movement, rest, and unhurried time with family. When I neglect them, everything else begins to lean.

I am not consistent enough to write this as an expert. I am writing it as someone learning to return. A missed morning does not have to become a missed month. A hard conversation can still be repaired. A poor week does not get the final word.

> The goal is not to look finished. The goal is to keep building what can hold a good life.

There is humility in admitting that the work will never be complete. There is also hope in knowing the next honest step is usually close enough to take today.`,
    },
    {
      id: "10000000-0000-4000-8000-000000000002",
      title: "Leading Without Pretending",
      slug: "leading-without-pretending",
      category: "work",
      tags: ["leadership", "character"],
      excerpt:
        "Leadership gets clearer when we stop performing certainty and start giving people honesty, direction, and room to contribute.",
      publishedAt: new Date("2026-06-16T13:00:00.000Z"),
      content: `A leader can lose a room while saying all the right words.

People notice when confidence becomes theater. They hear the polished answer that avoids the real risk. They feel the meeting move forward without anyone naming what is actually uncertain.

I used to think leadership meant having an answer ready. Experience has made that definition less impressive and more dangerous.

## Clarity is not the same as certainty

Teams rarely need a leader to predict the future. They need someone willing to describe the present without flinching.

What do we know? What are we assuming? What could hurt the customer? Who owns the next decision? When will we look at the evidence again?

Those questions do not make a leader look weak. They make the work visible. Visibility gives capable people a place to contribute.

Pretending creates a different environment. If the person in charge cannot admit uncertainty, everyone else learns to hide it too. Risks stay quiet. Dates become wishes. A green status report survives right up until the launch does not.

## The useful sentence

One of the most useful sentences in leadership is: “I don’t know yet, but here is how we are going to find out.”

It holds honesty and direction together. The first half makes room for truth. The second half keeps uncertainty from becoming passivity.

That is the kind of leadership I respect: calm enough to listen, clear enough to decide, and secure enough to change course when the evidence changes.

## Let the work speak plainly

Good leadership is not a performance of control. It is a practice of responsibility. We name the stakes, invite the right voices, make the best decision available, and stay accountable for what follows.

There will always be pressure to sound more certain than we are. Resisting that pressure is part of the job.

The team does not need a perfect guide. It needs an honest one.`,
    },
    {
      id: "10000000-0000-4000-8000-000000000003",
      title: "Why Small Progress Still Counts",
      slug: "why-small-progress-still-counts",
      category: "growth",
      tags: ["progress", "character"],
      excerpt:
        "The smallest repeatable step is often more valuable than the dramatic effort we cannot sustain.",
      publishedAt: new Date("2026-06-30T13:00:00.000Z"),
      content: `Some days offer a wide-open stretch of road. Most do not.

Most days arrive already crowded: work that matters, people who need us, dishes in the sink, a body that needs care, and a mind carrying more tabs than it can display.

When progress only counts if it is dramatic, those ordinary days begin to feel like failure.

## The measurement is broken

We tend to compare a real Tuesday with an imaginary perfect day. In that imaginary day, we wake early, feel motivated, finish the hard project, exercise, read, pray, cook, and remain patient through every interruption.

The comparison is unfair because the perfect day has no friction. A real life does.

Small progress respects reality. It asks what can be done faithfully with the time and strength available. Ten focused minutes can move a project. One honest apology can change the temperature of a home. A short walk can interrupt a week of stillness. A paragraph can keep a writing practice alive.

None of those actions finish the work. They keep the work moving.

## Repetition gives the step its weight

A small action looks insignificant when viewed alone. Repeated, it becomes a direction.

That is why the best next step is often not the largest one we can imagine. It is the one we can take again. Sustainable effort may feel less heroic, but it survives contact with a full calendar and an imperfect mood.

This is not permission to avoid hard things. It is a way to approach them without making intensity the only tool we trust.

## Count what is honest

At the end of the day, I am learning to ask a simpler question: Did I move toward the person I am trying to become?

Sometimes the answer is a finished piece of work. Sometimes it is closing the laptop and listening. Sometimes it is beginning again after a disappointing week.

Small progress still counts because a life is made mostly of small moments. Treating them as meaningful is how we learn to build with them.`,
    },
  ] as const;

  let inserted = 0;
  for (const seed of postSeeds) {
    const exists = await db
      .select({ id: blogPosts.id })
      .from(blogPosts)
      .where(eq(blogPosts.slug, seed.slug))
      .limit(1);
    if (exists[0]) continue;

    await db.insert(blogPosts).values({
      id: seed.id,
      title: seed.title,
      slug: seed.slug,
      excerpt: seed.excerpt,
      content: seed.content,
      contentFormat: "markdown",
      status: "published",
      authorId,
      categoryId: categoryId.get(seed.category) ?? null,
      publishedAt: seed.publishedAt,
      seoTitle: seed.title,
      seoDescription: seed.excerpt,
    });
    for (const tag of seed.tags) {
      const id = tagId.get(tag);
      if (id)
        await db.insert(blogPostTags).values({ postId: seed.id, tagId: id });
    }
    inserted += 1;
  }

  console.log(
    `Starter content seed complete (${inserted} new post${inserted === 1 ? "" : "s"}).`,
  );
}

main().catch((error: unknown) => {
  console.error("Starter content seed failed", {
    errorName: error instanceof Error ? error.name : "UnknownError",
  });
  process.exitCode = 1;
});
