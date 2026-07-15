import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PostCard } from "@/components/blog/post-card";

const post = {
  slug: "an-honest-note",
  title: "An honest note",
  excerpt: "A short field note from the workbench.",
  categoryName: "Growth",
  publishedAt: new Date("2026-06-15T12:00:00.000Z"),
  scheduledFor: null,
};

describe("PostCard heading structure", () => {
  it("supports a nested heading on the blog landing page", () => {
    render(<PostCard post={post} headingLevel="h3" />);
    expect(
      screen.getByRole("heading", { level: 3, name: post.title }),
    ).toBeInTheDocument();
  });

  it("defaults to an h2 for the archive grid", () => {
    render(<PostCard post={post} />);
    expect(
      screen.getByRole("heading", { level: 2, name: post.title }),
    ).toBeInTheDocument();
  });
});
