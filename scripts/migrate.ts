import { mkdir } from "node:fs/promises";
import { migrate } from "drizzle-orm/libsql/migrator";

async function main() {
  if (!process.env.TURSO_DATABASE_URL)
    await mkdir(".data", { recursive: true });
  const { db } = await import("../lib/db/connection");
  await migrate(db, { migrationsFolder: "./drizzle" });
  console.log("Blog database migrations applied successfully.");
}

main().catch((error: unknown) => {
  console.error("Database migration failed", {
    errorName: error instanceof Error ? error.name : "UnknownError",
  });
  process.exitCode = 1;
});
