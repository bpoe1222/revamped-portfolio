import { describe, expect, it } from "vitest";
import { estimatedReadingMinutes } from "@/lib/blog/content";
import { parseTags, postInputSchema, slugify } from "@/lib/blog/validation";
import { isIdentityAllowlisted } from "@/lib/auth-policy";

const valid = {
  title: "An Honest Post",
  slug: "an-honest-post",
  excerpt: "A sufficiently descriptive excerpt for testing.",
  content: "## A heading\n\nThis is enough Markdown content to validate.",
  categoryId: "10000000-0000-4000-8000-000000000001",
  newCategory: "",
  tags: "faith, work",
  featuredImageUrl: "",
  featuredImageAlt: "",
  seoTitle: "",
  seoDescription: "",
  intent: "draft" as const,
  scheduledFor: "",
};

describe("blog validation", () => {
  it("accepts permitted post fields and rejects malformed slugs", () => {
    expect(postInputSchema.safeParse(valid).success).toBe(true);
    expect(
      postInputSchema.safeParse({ ...valid, slug: "../admin" }).success,
    ).toBe(false);
  });

  it("requires alt text with an image and a future time when scheduling", () => {
    expect(
      postInputSchema.safeParse({
        ...valid,
        featuredImageUrl: "https://example.com/a.jpg",
      }).success,
    ).toBe(false);
    expect(
      postInputSchema.safeParse({
        ...valid,
        intent: "schedule",
        scheduledFor: "2020-01-01T00:00",
      }).success,
    ).toBe(false);
  });

  it("normalizes slugs and de-duplicates tags", () => {
    expect(slugify("  Small Progress & Grace  ")).toBe("small-progress-grace");
    expect(parseTags("faith, work, faith")).toEqual(["faith", "work"]);
  });

  it("calculates a minimum one-minute reading time", () => {
    expect(estimatedReadingMinutes("A short note.")).toBe(1);
  });
});

describe("administrator allowlisting", () => {
  const identity = {
    provider: "github",
    providerAccountId: "42",
    email: "bailey@example.com",
  };
  it("rejects unauthenticated or unauthorized identity data", () => {
    expect(isIdentityAllowlisted(identity, {})).toBe(false);
    expect(
      isIdentityAllowlisted(identity, {
        githubId: "99",
        email: "other@example.com",
      }),
    ).toBe(false);
  });
  it("authorizes an exact provider account or normalized email", () => {
    expect(isIdentityAllowlisted(identity, { githubId: "42" })).toBe(true);
    expect(
      isIdentityAllowlisted(identity, { email: "BAILEY@example.com" }),
    ).toBe(true);
  });
  it("never accepts another OAuth provider", () => {
    expect(
      isIdentityAllowlisted(
        { ...identity, provider: "google" },
        { email: identity.email },
      ),
    ).toBe(false);
  });
});
