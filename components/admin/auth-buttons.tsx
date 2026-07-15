"use client";

import { signIn, signOut } from "next-auth/react";

export function LoginButton() {
  return (
    <button
      className="admin-primary"
      onClick={() => signIn("github", { callbackUrl: "/admin/blog" })}
    >
      Continue with GitHub
    </button>
  );
}

export function SignOutButton() {
  return (
    <button
      className="admin-link-button"
      onClick={() => signOut({ callbackUrl: "/" })}
    >
      Sign out
    </button>
  );
}
