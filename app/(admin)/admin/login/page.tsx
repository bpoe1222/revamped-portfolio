import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LoginButton } from "@/components/admin/auth-buttons";
import { getAuthorizedAdmin } from "@/lib/auth";
import { inspectAuthConfiguration } from "@/lib/auth-config";

export const metadata: Metadata = {
  title: "Blog administration",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function AdminLogin({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const configuration = inspectAuthConfiguration();
  if (configuration.ok && (await getAuthorizedAdmin())) redirect("/admin/blog");
  const params = await searchParams;
  const denied = params.error === "AccessDenied";
  return (
    <main className="admin-login">
      <p className="eyebrow">Private workspace</p>
      <h1>The Honest Build administration</h1>
      <p>
        Sign in with the GitHub identity explicitly authorized for this journal.
      </p>
      {!configuration.ok && (
        <div className="admin-alert" role="alert">
          <p>
            <strong>GitHub sign-in is not configured.</strong>
          </p>
          <p>
            Set valid server-only values for the following variables in
            <code> .env.local</code>, then restart the application:
          </p>
          <ul>
            {configuration.variables.map((name) => (
              <li key={name}>
                <code>{name}</code>
              </li>
            ))}
          </ul>
          {configuration.variables.includes("ADMIN_GITHUB_ID") &&
            configuration.variables.includes("ADMIN_EMAIL") && (
              <p>
                Administrator authorization requires one of
                <code> ADMIN_GITHUB_ID</code> or <code>ADMIN_EMAIL</code>; you
                do not need to set both.
              </p>
            )}
        </div>
      )}
      {configuration.ok && denied && (
        <p className="admin-alert" role="alert">
          That GitHub account is authenticated but is not authorized to
          administer this blog.
        </p>
      )}
      {configuration.ok && <LoginButton />}
      <Link href="/blog">← Return to the journal</Link>
    </main>
  );
}
