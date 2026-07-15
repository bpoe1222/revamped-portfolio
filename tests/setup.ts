import { existsSync, mkdirSync, rmSync } from "node:fs";
import "@testing-library/jest-dom/vitest";

mkdirSync(".data", { recursive: true });
for (const suffix of ["", "-shm", "-wal"]) {
  const path = `.data/blog.test.db${suffix}`;
  if (existsSync(path)) rmSync(path);
}
process.env.TURSO_DATABASE_URL = "file:./.data/blog.test.db";
process.env.TURSO_AUTH_TOKEN = "";
