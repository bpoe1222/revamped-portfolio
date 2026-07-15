import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Markdown } from "@/components/blog/markdown";

describe("Markdown rendering", () => {
  it("supports editorial formatting", () => {
    render(
      <Markdown
        content={
          "## Heading\n\n**Bold** and *italic*\n\n> A quote\n\n- one\n- two"
        }
      />,
    );
    expect(
      screen.getByRole("heading", { name: "Heading" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Bold")).toHaveProperty("tagName", "STRONG");
    expect(
      screen.getByText("A quote").closest("blockquote"),
    ).toBeInTheDocument();
  });

  it("does not render untrusted raw HTML or script nodes", () => {
    const { container } = render(
      <Markdown
        content={"Hello <script>alert(1)</script> <img src=x onerror=alert(1)>"}
      />,
    );
    expect(container.querySelector("script")).toBeNull();
    expect(container.querySelector("img")).toBeNull();
  });
});
