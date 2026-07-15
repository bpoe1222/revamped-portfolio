import "server-only";

import { and, eq } from "drizzle-orm";
import { getServerSession, type NextAuthOptions } from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import { forbidden, redirect, unauthorized } from "next/navigation";
import { db, adminIdentities } from "@/lib/db/server";
import { isIdentityAllowlisted } from "@/lib/auth-policy";
import {
  inspectAuthConfiguration,
  requireAuthConfiguration,
  type AuthConfiguration,
} from "@/lib/auth-config";

function normalizeEmail(value: string | null | undefined) {
  return value?.trim().toLowerCase() ?? "";
}

function isAllowlisted(
  configuration: AuthConfiguration,
  providerAccountId: string,
  email: string,
) {
  return isIdentityAllowlisted(
    { provider: "github", providerAccountId, email },
    {
      githubId: configuration.adminGithubId,
      email: configuration.adminEmail,
    },
  );
}

export function getAuthOptions(): NextAuthOptions {
  const configuration = requireAuthConfiguration();
  const useSecureCookies =
    new URL(configuration.nextAuthUrl).protocol === "https:";

  return {
    providers: [
      GitHubProvider({
        clientId: configuration.githubClientId,
        clientSecret: configuration.githubClientSecret,
      }),
    ],
    session: { strategy: "jwt", maxAge: 60 * 60 * 8 },
    pages: {
      signIn: "/admin/login",
      error: "/admin/login",
    },
    callbacks: {
      async signIn({ account, profile, user }) {
        if (!account || account.provider !== "github") return false;

        const email = normalizeEmail(user.email ?? profile?.email);
        if (
          !email ||
          !isAllowlisted(configuration, account.providerAccountId, email)
        )
          return false;

        const existing = await db
          .select({ id: adminIdentities.id })
          .from(adminIdentities)
          .where(
            and(
              eq(adminIdentities.provider, "github"),
              eq(adminIdentities.providerAccountId, account.providerAccountId),
            ),
          )
          .limit(1);

        const existingByEmail = existing[0]
          ? []
          : await db
              .select({ id: adminIdentities.id })
              .from(adminIdentities)
              .where(eq(adminIdentities.email, email))
              .limit(1);

        if (existing[0]) {
          await db
            .update(adminIdentities)
            .set({ email, updatedAt: new Date() })
            .where(eq(adminIdentities.id, existing[0].id));
        } else if (existingByEmail[0]) {
          await db
            .update(adminIdentities)
            .set({
              provider: "github",
              providerAccountId: account.providerAccountId,
              updatedAt: new Date(),
            })
            .where(eq(adminIdentities.id, existingByEmail[0].id));
        } else {
          await db.insert(adminIdentities).values({
            id: crypto.randomUUID(),
            provider: "github",
            providerAccountId: account.providerAccountId,
            email,
            role: "admin",
          });
        }

        return true;
      },
      async jwt({ token, account }) {
        if (account?.provider === "github") {
          token.providerAccountId = account.providerAccountId;
        }
        return token;
      },
      async session({ session, token }) {
        const providerAccountId = token.providerAccountId;
        if (typeof providerAccountId !== "string" || !session.user)
          return session;

        const identity = await db
          .select({ id: adminIdentities.id, role: adminIdentities.role })
          .from(adminIdentities)
          .where(
            and(
              eq(adminIdentities.provider, "github"),
              eq(adminIdentities.providerAccountId, providerAccountId),
            ),
          )
          .limit(1);

        if (identity[0]?.role === "admin") {
          session.user.adminId = identity[0].id;
          session.user.role = "admin";
        }
        return session;
      },
    },
    cookies: {
      sessionToken: {
        name: useSecureCookies
          ? "__Secure-next-auth.session-token"
          : "next-auth.session-token",
        options: {
          httpOnly: true,
          sameSite: "lax",
          path: "/",
          secure: useSecureCookies,
        },
      },
    },
    secret: configuration.nextAuthSecret,
  };
}

export async function getAuthorizedAdmin() {
  const session = await getServerSession(getAuthOptions());
  if (!session?.user?.adminId || session.user.role !== "admin") return null;

  const identity = await db
    .select()
    .from(adminIdentities)
    .where(eq(adminIdentities.id, session.user.adminId))
    .limit(1);

  return identity[0]?.role === "admin" ? identity[0] : null;
}

export async function requireAdminPage() {
  const configuration = inspectAuthConfiguration();
  if (!configuration.ok) redirect("/admin/login?error=Configuration");

  const session = await getServerSession(getAuthOptions());
  if (!session?.user) redirect("/admin/login");
  if (!session.user.adminId || session.user.role !== "admin") forbidden();
  const identity = await db
    .select()
    .from(adminIdentities)
    .where(eq(adminIdentities.id, session.user.adminId))
    .limit(1);
  if (identity[0]?.role !== "admin") forbidden();
  return identity[0];
}

export async function requireAdminMutation() {
  const admin = await getAuthorizedAdmin();
  if (!admin) unauthorized();
  return admin;
}
