# BaileyPoe.dev and The Honest Build

BaileyPoe.dev is a Next.js App Router site deployed on Vercel. The portfolio remains at the existing routes, while **The Honest Build** is a database-backed editorial section at `/blog` with a protected console at `/admin/blog`.

## Architecture

- Next.js App Router provides server rendering, metadata, route handlers, protected server actions, RSS, and sitemap generation.
- URL-transparent route groups isolate the three visual shells: `app/(portfolio)` owns BaileyPoe.dev navigation, `app/(blog)/blog` owns The Honest Build header/footer, and `app/(admin)/admin` owns the protected console. The root layout contains no site-specific chrome.
- Turso is the production SQLite-compatible database.
- `@libsql/client` and Drizzle ORM provide parameterized access, schema definitions, transactions, and committed SQL migrations.
- Zod validates explicitly selected form fields before every write.
- Auth.js uses GitHub OAuth, an environment allowlist for initial admission, and a database-backed `admin` role on every protected request.
- Markdown is canonical post content. `react-markdown`, GitHub-flavored Markdown, and a sanitizing rehype pipeline render it without raw HTML.
- Scheduled posts use date-based visibility. A `scheduled` post becomes public when `scheduled_for <= now`; no cron job is required.

Database code lives in `lib/db`. Browser components never receive the Turso URL or token. Public queries only return `published` posts whose publication time has passed, or `scheduled` posts whose scheduled time has passed.

## Required environment variables

Copy `.env.example` to the ignored `.env.local` and set values locally. Never commit `.env.local`.

| Name                 | Purpose                                                                                       |
| -------------------- | --------------------------------------------------------------------------------------------- |
| `TURSO_DATABASE_URL` | Turso libSQL database URL provisioned by the Vercel Marketplace integration                   |
| `TURSO_AUTH_TOKEN`   | Private Turso database token                                                                  |
| `NEXTAUTH_URL`       | Application origin; `http://localhost:3000` locally and `https://baileypoe.dev` in production |
| `SITE_URL`           | Canonical public site origin, normally `https://baileypoe.dev`                                |
| `NEXTAUTH_SECRET`    | Strong random Auth.js signing secret                                                          |
| `GITHUB_ID`          | GitHub OAuth application client ID                                                            |
| `GITHUB_SECRET`      | GitHub OAuth application client secret                                                        |
| `ADMIN_GITHUB_ID`    | Recommended: authorized administrator’s immutable numeric GitHub account ID                   |
| `ADMIN_EMAIL`        | Alternative allowlist match using the verified GitHub email                                   |

The Vercel Turso integration convention is `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN`. Confirm those exact names under Vercel → Project → Settings → Environment Variables before deploying. Private variables must never use a `NEXT_PUBLIC_` prefix.

Generate `NEXTAUTH_SECRET` locally with a cryptographically secure generator such as `openssl rand -base64 32`; store the result only in `.env.local` and Vercel. At least one of `ADMIN_GITHUB_ID` or `ADMIN_EMAIL` is required; prefer the immutable numeric ID.

## Local development

```bash
npm install
cp .env.example .env.local
npm run db:migrate
npm run db:seed
npm run dev
```

When Turso variables are omitted outside production, migration and seed scripts use the ignored `.data/blog.db` development database. Production refuses to fall back to a local file.

## Database changes

After editing `lib/db/schema.ts`:

```bash
npm run db:generate
npm run db:migrate
```

Review every generated file in `drizzle/` before applying it. Migration files are committed; local database files are not.

Seed starter content with:

```bash
npm run db:seed
```

The seed is idempotent. It creates only missing starter records and never updates a post with an existing slug, so later editor changes are preserved.

## GitHub administrator authentication

This project uses NextAuth/Auth.js v4 with its GitHub provider. It does not expose OAuth credentials to browser code. Missing, blank, short, or obvious placeholder credentials are rejected before the provider is created; the login page names only the variables needing attention and does not render a broken GitHub button.

GitHub OAuth Apps support a single callback URL, so use separate development and production apps:

1. Create a development OAuth App with homepage `http://localhost:3000` and authorization callback URL `http://localhost:3000/api/auth/callback/github`.
2. Add its client ID and client secret to the ignored `.env.local` as `GITHUB_ID` and `GITHUB_SECRET`.
3. Set `NEXTAUTH_URL=http://localhost:3000`, add a strong `NEXTAUTH_SECRET`, and set `ADMIN_GITHUB_ID` to the authorized administrator’s immutable numeric GitHub ID. `ADMIN_EMAIL` is an optional alternative allowlist.
4. Restart `npm run dev` after changing environment variables, then visit `http://localhost:3000/admin/blog`.
5. Create a separate production OAuth App with homepage `https://baileypoe.dev` and callback URL `https://baileypoe.dev/api/auth/callback/github`.
6. In Vercel, set `GITHUB_ID`, `GITHUB_SECRET`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL=https://baileypoe.dev`, and `ADMIN_GITHUB_ID` or `ADMIN_EMAIL` for the Production environment. Use the production OAuth App’s client values and redeploy after changing them.

Do not put credentials in `.env.example`, `.env.production`, source files, or any `NEXT_PUBLIC_*` variable. The first allowed sign-in creates or links the database identity. Every later page load and mutation rechecks that identity’s database-backed `admin` role.

An authenticated identity outside the allowlist is denied. Removing or changing its database role immediately removes console authorization. Admin pages and previews are private, `noindex`, and `no-store`.

## Editorial workflow

- Create: open `/admin/blog/new`, fill the required title, slug, excerpt, category, and Markdown body, then save a draft, schedule, or publish.
- Slug: generated from the title until manually edited; duplicate slugs return a safe validation error.
- Preview: use **Secure preview** from the editor. Preview URLs sit behind the same server-side administrator check and cannot enter public caches.
- Publish: **Publish now** writes a UTC publication time and revalidates blog, article, RSS, and sitemap paths.
- Schedule: select a local date/time and click **Schedule**. It is converted to UTC in storage and becomes publicly queryable after the timestamp.
- Unpublish: use the dashboard action. It clears publication scheduling and immediately removes the post from public queries and discovery routes.
- Delete: requires browser confirmation and deletes post/tag joins in one database-enforced cascade.

Supported Markdown includes headings, paragraphs, emphasis, links, lists, blockquotes, and fenced code. Raw HTML is not enabled.

## Media storage

No existing managed object storage was found. The editor therefore accepts an externally hosted HTTPS image URL plus required alt text. Image binaries are never stored in Turso or committed as uploads.

For direct production uploads, connect Vercel Blob first, then add an administrator-only server upload action that validates decoded image type, extension, size, dimensions, and randomized filename before writing. Also add safe reference checks before deletion. Do not add a Blob token or paid storage dependency until the account choice is approved.

The local blog hero is an optimized 109 KB WebP in `public/blog/` and is served through `next/image`.

## Vercel deployment

1. Rotate any Turso token that has appeared outside the secret manager.
2. Confirm all required variables for Production and Preview environments.
3. Set the Vercel framework preset to Next.js and use the default `npm run build` command.
4. Pull environment variables into an ignored local file when needed with Vercel CLI, then run `npm run db:migrate` against the intended Turso database before deployment.
5. Run `npm run db:seed` once. Re-running is safe.
6. Deploy, then verify `/`, `/resume`, `/contact`, `/blog`, all seeded posts, RSS, sitemap, OAuth sign-in, draft privacy, and publish/unpublish.

Do not run migrations automatically in every serverless invocation. Apply reviewed migrations as an explicit release step.

`vercel.json` pins the deployment install and build commands to `npm ci` and `npm run build`, so Vercel installs exactly the committed lockfile. Turso clients are initialized lazily, and database-backed blog, feed, sitemap, and admin routes render at request time. As a result, `next build` does not need database or OAuth credentials, network access to Turso, or an already-migrated schema. Those values remain mandatory when the deployed routes execute.

Keep `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`, `GITHUB_ID`, `GITHUB_SECRET`, `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, and the administrator allowlist in Vercel Environment Variables. The tracked `.env.production` contains only non-secret legacy build flags; never add credentials to it. Production runtime refuses to use a local `file:` database URL.

## Backup, restore, and credential rotation

- Use Turso’s dashboard/CLI backup or point-in-time recovery facilities appropriate to the account plan before schema changes.
- Store any local SQL export under ignored `backups/`, encrypt it at rest, and never commit it.
- Test restores against a separate Turso database before changing production connection variables.
- To rotate the Turso token, create a replacement in Turso, update `TURSO_AUTH_TOKEN` in Vercel and local secret storage, redeploy and verify, then revoke the old token in Turso. Never log either token during the process.
- Rotate `NEXTAUTH_SECRET` deliberately; doing so invalidates active sessions and requires administrators to sign in again.

## Validation commands

```bash
npm run format:check
npm run lint
npm run typecheck
npm test
npm run test:smoke
npm run build
npm run db:migrate
npm run db:seed
```

`npm run test:smoke` expects the application at `http://localhost:3000` and checks real portfolio, blog, article, admin, stylesheet, and hero responses. Set `SMOKE_BASE_URL` only when intentionally testing another local origin.

Stop `next dev` or `next start` before running `npm run build`. Next.js reads and writes `.next` at runtime, so building over a running server can mix old prerendered HTML with new asset hashes. If that happens, stop every Next process, remove `.next`, rebuild, and start the server only after the build completes.

## Security checklist

- Keep Turso, OAuth, Auth.js, and future Blob credentials server-only.
- Prefer `ADMIN_GITHUB_ID`; audit the database identity after the first sign-in.
- Review generated migrations and back up before applying them.
- Keep dependencies patched and review `npm audit` findings before releases.
- Confirm drafts/future schedules do not appear in article routes, archive results, RSS, sitemap, or metadata.
- Confirm `/admin/*` responses remain private/no-store/noindex and unauthenticated requests redirect to login.
- Use descriptive image alt text and trusted HTTPS image origins.
- Rotate credentials immediately if they are pasted into chat, logs, tickets, or screenshots.
