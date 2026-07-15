import NextAuth from "next-auth";
import type { NextRequest } from "next/server";
import { getAuthOptions } from "@/lib/auth";
import { AuthConfigurationError } from "@/lib/auth-config";

type AuthRouteContext = {
  params: Promise<{ nextauth: string[] }>;
};

async function handler(request: NextRequest, context: AuthRouteContext) {
  try {
    const nextAuthHandler = NextAuth(getAuthOptions());
    return await nextAuthHandler(request, context);
  } catch (error) {
    if (!(error instanceof AuthConfigurationError)) throw error;

    console.error(error.message);
    return Response.json(
      {
        error: "GitHub authentication is not configured.",
        variables: error.variables,
        action:
          "Set valid server-only values in .env.local or the deployment environment, then restart the application.",
      },
      {
        status: 503,
        headers: { "Cache-Control": "no-store" },
      },
    );
  }
}

export { handler as GET, handler as POST };
