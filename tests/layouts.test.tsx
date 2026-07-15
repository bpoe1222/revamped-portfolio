import React from "react";
import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import RootLayout from "@/app/layout";
import PortfolioLayout from "@/app/(portfolio)/layout";
import BlogLayout from "@/app/(blog)/blog/layout";
import { AdminShell } from "@/components/admin/admin-shell";

function renderWithRoot(children: React.ReactNode) {
  return renderToStaticMarkup(<RootLayout>{children}</RootLayout>);
}

describe("site layout boundaries", () => {
  beforeAll(() => {
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      value: () => ({
        matches: false,
        addEventListener: () => undefined,
        removeEventListener: () => undefined,
      }),
    });
  });

  beforeEach(() => window.localStorage.clear());

  it("keeps the root layout free of all site-specific navigation", () => {
    const html = renderWithRoot(<main>Shared infrastructure only</main>);
    expect(html).not.toContain('aria-label="Primary navigation"');
    expect(html).not.toContain('aria-label="The Honest Build navigation"');
    expect(html).not.toContain('aria-label="Administration navigation"');
  });

  it("renders portfolio navigation only for portfolio routes", () => {
    const html = renderWithRoot(
      <PortfolioLayout>
        <main>Portfolio route</main>
      </PortfolioLayout>,
    );
    expect(html).toContain('aria-label="Primary navigation"');
    expect(html).toContain('aria-label="Bailey Poe home"');
    expect(html).toContain("Quality Program Manager");
    expect(html).toContain("theme-toggle");
    expect(html).not.toContain('aria-label="The Honest Build navigation"');
    expect(html).not.toContain('data-site-layout="blog"');
  });

  it("renders only The Honest Build navigation for every public blog child", () => {
    const html = renderWithRoot(
      <BlogLayout>
        <main>Any /blog child route</main>
      </BlogLayout>,
    );
    expect(html).toContain('data-site-layout="blog"');
    expect(html).toContain('aria-label="The Honest Build navigation"');
    expect(html).toContain('href="/blog/archive"');
    expect(html).toContain('href="/blog/rss.xml"');
    expect(html).not.toContain('aria-label="Primary navigation"');
    expect(html).not.toContain('aria-label="Bailey Poe home"');
    expect(html).not.toContain('class="nav-container');
    expect(html).not.toContain("Quality Program Manager");
    expect(html).not.toContain("theme-toggle");
  });

  it("renders only the console navigation for protected blog administration", () => {
    const html = renderWithRoot(
      <AdminShell email="admin@example.com">
        <main>Protected console route</main>
      </AdminShell>,
    );
    expect(html).toContain('data-site-layout="admin"');
    expect(html).toContain('aria-label="Administration navigation"');
    expect(html).not.toContain('aria-label="Primary navigation"');
    expect(html).not.toContain('aria-label="The Honest Build navigation"');
    expect(html).not.toContain('class="nav-container');
    expect(html).not.toContain("journal-header");
    expect(html).not.toContain("journal-footer");
  });
});
