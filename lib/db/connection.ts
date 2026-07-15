import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

function getDatabaseConfig() {
  const url = process.env.TURSO_DATABASE_URL?.trim();
  const authToken = process.env.TURSO_AUTH_TOKEN?.trim();

  if (url) {
    if (url.startsWith("file:")) {
      if (process.env.NODE_ENV === "production") {
        throw new Error(
          "TURSO_DATABASE_URL must reference a hosted database in production.",
        );
      }
      return { url, authToken: undefined };
    }
    if (!authToken) {
      throw new Error(
        "TURSO_AUTH_TOKEN is required for a hosted Turso database.",
      );
    }
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

let database: ReturnType<typeof drizzle<typeof schema>> | undefined;

export function getDatabase() {
  if (database) return database;

  database =
    globalForDatabase.blogDatabase ??
    drizzle(createClient(getDatabaseConfig()), { schema });

  if (process.env.NODE_ENV !== "production") {
    globalForDatabase.blogDatabase = database;
  }

  return database;
}
