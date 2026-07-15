import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import {
  AuthConfigurationError,
  inspectAuthConfiguration,
  requireAuthConfiguration,
  type AuthEnvironment,
} from "@/lib/auth-config";

const validEnvironment = {
  NEXTAUTH_URL: "http://localhost:3000",
  NEXTAUTH_SECRET: "unit-test-session-secret-that-is-long-enough",
  GITHUB_ID: "unit-test-github-client-id",
  GITHUB_SECRET: "unit-test-github-client-secret",
  ADMIN_GITHUB_ID: "12345678",
} satisfies AuthEnvironment;

describe("GitHub authentication configuration", () => {
  it("reports every missing authentication variable without exposing values", () => {
    const result = inspectAuthConfiguration({});

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.variables).toEqual([
      "NEXTAUTH_URL",
      "NEXTAUTH_SECRET",
      "GITHUB_ID",
      "GITHUB_SECRET",
      "ADMIN_GITHUB_ID",
      "ADMIN_EMAIL",
    ]);
  });

  it("rejects the local-placeholder value that produced the broken OAuth URL", () => {
    const result = inspectAuthConfiguration({
      ...validEnvironment,
      GITHUB_ID: "local-placeholder",
    });

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.variables).toContain("GITHUB_ID");
    expect(result.message).not.toContain("local-placeholder");
  });

  it("accepts a valid local origin and immutable GitHub allowlist ID", () => {
    const result = inspectAuthConfiguration(validEnvironment);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.configuration.nextAuthUrl).toBe("http://localhost:3000");
    expect(result.configuration.adminGithubId).toBe("12345678");
  });

  it("requires an administrator ID or a valid email allowlist", () => {
    const result = inspectAuthConfiguration({
      ...validEnvironment,
      ADMIN_GITHUB_ID: "",
    });

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.variables).toEqual(["ADMIN_GITHUB_ID", "ADMIN_EMAIL"]);
  });

  it("accepts a normalized email allowlist when an ID is unavailable", () => {
    const result = inspectAuthConfiguration({
      ...validEnvironment,
      ADMIN_GITHUB_ID: "",
      ADMIN_EMAIL: "Admin@Example.com",
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.configuration.adminEmail).toBe("admin@example.com");
  });

  it("throws a safe configuration error before creating an OAuth provider", () => {
    expect(() =>
      requireAuthConfiguration({
        ...validEnvironment,
        GITHUB_SECRET: "replace-with-a-secret",
      }),
    ).toThrow(AuthConfigurationError);
  });
});
