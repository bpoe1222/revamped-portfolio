import "server-only";

export const authEnvironmentVariables = [
  "NEXTAUTH_URL",
  "NEXTAUTH_SECRET",
  "GITHUB_ID",
  "GITHUB_SECRET",
  "ADMIN_GITHUB_ID",
  "ADMIN_EMAIL",
] as const;

export type AuthEnvironmentVariable = (typeof authEnvironmentVariables)[number];

export type AuthEnvironment = Partial<
  Record<AuthEnvironmentVariable, string | undefined>
>;

export type AuthConfiguration = {
  nextAuthUrl: string;
  nextAuthSecret: string;
  githubClientId: string;
  githubClientSecret: string;
  adminGithubId?: string;
  adminEmail?: string;
};

export type AuthConfigurationResult =
  | { ok: true; configuration: AuthConfiguration }
  | {
      ok: false;
      variables: AuthEnvironmentVariable[];
      message: string;
    };

const placeholderPattern =
  /^(?:local[-_ ]?placeholder|placeholder|change[-_ ]?me|replace[-_ ]|your[-_ ])/i;

function clean(value: string | undefined) {
  return value?.trim() ?? "";
}

function isMissingOrPlaceholder(value: string) {
  return !value || placeholderPattern.test(value);
}

function isValidOrigin(value: string) {
  try {
    const url = new URL(value);
    return (
      (url.protocol === "http:" || url.protocol === "https:") &&
      !url.username &&
      !url.password &&
      url.pathname === "/" &&
      !url.search &&
      !url.hash
    );
  } catch {
    return false;
  }
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function inspectAuthConfiguration(
  environment: AuthEnvironment = process.env,
): AuthConfigurationResult {
  const nextAuthUrl = clean(environment.NEXTAUTH_URL);
  const nextAuthSecret = clean(environment.NEXTAUTH_SECRET);
  const githubClientId = clean(environment.GITHUB_ID);
  const githubClientSecret = clean(environment.GITHUB_SECRET);
  const adminGithubId = clean(environment.ADMIN_GITHUB_ID);
  const adminEmail = clean(environment.ADMIN_EMAIL).toLowerCase();
  const invalid = new Set<AuthEnvironmentVariable>();

  if (isMissingOrPlaceholder(nextAuthUrl) || !isValidOrigin(nextAuthUrl)) {
    invalid.add("NEXTAUTH_URL");
  }
  if (isMissingOrPlaceholder(nextAuthSecret) || nextAuthSecret.length < 32) {
    invalid.add("NEXTAUTH_SECRET");
  }
  if (isMissingOrPlaceholder(githubClientId)) invalid.add("GITHUB_ID");
  if (isMissingOrPlaceholder(githubClientSecret)) invalid.add("GITHUB_SECRET");

  if (adminGithubId && !/^\d+$/.test(adminGithubId)) {
    invalid.add("ADMIN_GITHUB_ID");
  }
  if (adminEmail && !isValidEmail(adminEmail)) invalid.add("ADMIN_EMAIL");
  if (!adminGithubId && !adminEmail) {
    invalid.add("ADMIN_GITHUB_ID");
    invalid.add("ADMIN_EMAIL");
  }

  const variables = authEnvironmentVariables.filter((name) =>
    invalid.has(name),
  );
  if (variables.length > 0) {
    return {
      ok: false,
      variables,
      message: `GitHub authentication is not configured. Set valid server-only values for ${variables.join(
        ", ",
      )}, then restart the application.`,
    };
  }

  return {
    ok: true,
    configuration: {
      nextAuthUrl,
      nextAuthSecret,
      githubClientId,
      githubClientSecret,
      ...(adminGithubId ? { adminGithubId } : {}),
      ...(adminEmail ? { adminEmail } : {}),
    },
  };
}

export class AuthConfigurationError extends Error {
  readonly variables: AuthEnvironmentVariable[];

  constructor(result: Extract<AuthConfigurationResult, { ok: false }>) {
    super(result.message);
    this.name = "AuthConfigurationError";
    this.variables = result.variables;
  }
}

export function requireAuthConfiguration(
  environment: AuthEnvironment = process.env,
) {
  const result = inspectAuthConfiguration(environment);
  if (!result.ok) throw new AuthConfigurationError(result);
  return result.configuration;
}
