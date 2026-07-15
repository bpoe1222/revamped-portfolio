import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

function getDatabaseConfig() {
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (url) {
    return { url, authToken };
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("TURSO_DATABASE_URL is required in production.");
  }

  return { url: "file:./.data/blog.db", authToken: undefined };
}

const globalForDatabase = globalThis as unknown as {
  blogDatabase?: ReturnType<typeof drizzle<typeof schema>>;
};

export const db =
  globalForDatabase.blogDatabase ??
  drizzle(createClient(getDatabaseConfig()), { schema });

if (process.env.NODE_ENV !== "production") {
  globalForDatabase.blogDatabase = db;
}
