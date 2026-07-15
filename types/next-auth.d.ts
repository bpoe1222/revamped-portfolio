import "next-auth";

declare module "next-auth" {
  interface Session {
    user?: {
      name?: string | null;
      email?: string | null;
      image?: string | null;
      adminId?: string;
      role?: "admin";
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    providerAccountId?: string;
  }
}
