export type AdminAllowlist = { githubId?: string; email?: string };

export function isIdentityAllowlisted(
  identity: { provider: string; providerAccountId: string; email: string },
  allowlist: AdminAllowlist,
) {
  if (identity.provider !== "github") return false;
  const allowedId = allowlist.githubId?.trim();
  const allowedEmail = allowlist.email?.trim().toLowerCase();
  const email = identity.email.trim().toLowerCase();
  return Boolean(
    (allowedId && identity.providerAccountId === allowedId) ||
    (allowedEmail && email === allowedEmail),
  );
}
