import { execFileSync } from "node:child_process";
import path from "node:path";
import { databaseUrl } from "./constants";

export default function globalSetup() {
  const prismaCli = path.resolve(
    process.cwd(),
    "node_modules",
    "prisma",
    "build",
    "index.js"
  );

  execFileSync(process.execPath, [prismaCli, "db", "push"], {
    cwd: process.cwd(),
    env: { ...process.env, DATABASE_URL: databaseUrl },
    stdio: "inherit",
  });
}
