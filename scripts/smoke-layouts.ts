const baseUrl = process.env.SMOKE_BASE_URL ?? "http://localhost:3000";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

async function get(path: string, redirect: RequestRedirect = "follow") {
  const response = await fetch(new URL(path, baseUrl), {
    cache: "no-store",
    redirect,
  });
  return { response, html: await response.text() };
}

function hasPortfolioChrome(html: string) {
  return (
    html.includes('aria-label="Primary navigation"') ||
    html.includes('class="nav-container') ||
    html.includes("Quality Program Manager") ||
    html.includes("theme-toggle")
  );
}

function hasBlogChrome(html: string) {
  return (
    html.includes('data-site-layout="blog"') &&
    html.includes('aria-label="The Honest Build navigation"') &&
    html.includes('class="journal-footer"')
  );
}

async function main() {
  for (const path of ["/", "/contact", "/resume"]) {
    const { response, html } = await get(path);
    assert(response.ok, `${path} returned ${response.status}.`);
    assert(
      hasPortfolioChrome(html),
      `${path} is missing portfolio navigation.`,
    );
    assert(
      !hasBlogChrome(html),
      `${path} unexpectedly contains the public blog layout.`,
    );
  }

  const blogPaths = [
    "/blog",
    "/blog/archive",
    "/blog/the-life-im-trying-to-build",
  ];
  let landingHtml = "";
  for (const path of blogPaths) {
    const { response, html } = await get(path);
    assert(response.ok, `${path} returned ${response.status}.`);
    assert(hasBlogChrome(html), `${path} is missing The Honest Build layout.`);
    assert(!hasPortfolioChrome(html), `${path} contains portfolio chrome.`);
    if (path === "/blog") landingHtml = html;
  }

  const cssPaths = [...landingHtml.matchAll(/href="([^"]+\.css[^"]*)"/g)].map(
    (match) => match[1],
  );
  assert(cssPaths.length > 0, "/blog emitted no stylesheet link.");

  let combinedCss = "";
  for (const path of new Set(cssPaths)) {
    const response = await fetch(new URL(path, baseUrl), { cache: "no-store" });
    assert(response.ok, `Stylesheet ${path} returned ${response.status}.`);
    combinedCss += await response.text();
  }
  for (const selector of [
    ".journal-header",
    ".journal-masthead",
    ".workbench-hero",
    ".journal-footer",
  ]) {
    assert(combinedCss.includes(selector), `Blog CSS is missing ${selector}.`);
  }

  const hero = await fetch(
    new URL("/blog/honest-build-workbench.webp", baseUrl),
  );
  assert(hero.ok, `Blog hero returned ${hero.status}.`);

  const login = await get("/admin/login");
  assert(login.response.ok, `/admin/login returned ${login.response.status}.`);
  assert(
    !hasPortfolioChrome(login.html),
    "/admin/login contains portfolio chrome.",
  );
  assert(
    !hasBlogChrome(login.html),
    "/admin/login contains the public blog layout.",
  );
  assert(
    !login.html.includes("local-placeholder"),
    "/admin/login exposes a rejected OAuth placeholder.",
  );

  const authIsUnconfigured = login.html.includes(
    "GitHub sign-in is not configured.",
  );
  if (authIsUnconfigured) {
    assert(
      !login.html.includes("Continue with GitHub"),
      "/admin/login rendered an OAuth button without valid configuration.",
    );
    const authApi = await get("/api/auth/signin/github", "manual");
    assert(
      authApi.response.status === 503,
      `Unconfigured auth API returned ${authApi.response.status}, expected 503.`,
    );
    assert(
      !authApi.html.includes("github.com/login/oauth/authorize") &&
        !authApi.html.includes("local-placeholder"),
      "Unconfigured auth API generated a broken GitHub OAuth URL.",
    );
  } else {
    assert(
      login.html.includes("Continue with GitHub"),
      "/admin/login has neither a configuration error nor a GitHub button.",
    );
  }

  const admin = await get("/admin/blog", "manual");
  assert(
    admin.response.status === 307,
    `/admin/blog returned ${admin.response.status}, expected 307.`,
  );
  assert(
    admin.response.headers.get("location")?.startsWith("/admin/login") === true,
    "/admin/blog did not redirect to login.",
  );
  assert(
    !hasPortfolioChrome(admin.html),
    "/admin/blog redirect contains portfolio chrome.",
  );
  assert(
    !hasBlogChrome(admin.html),
    "/admin/blog redirect contains the public blog layout.",
  );

  const refreshed = await get("/blog");
  assert(
    hasBlogChrome(refreshed.html),
    "Repeated direct /blog load lost the blog layout.",
  );
  assert(
    !hasPortfolioChrome(refreshed.html),
    "Repeated direct /blog load gained portfolio chrome.",
  );

  console.log(`Layout and stylesheet smoke checks passed against ${baseUrl}.`);
}

main().catch((error: unknown) => {
  console.error(
    error instanceof Error ? error.message : "Layout smoke test failed.",
  );
  process.exitCode = 1;
});
