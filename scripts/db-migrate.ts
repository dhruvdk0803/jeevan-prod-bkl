/**
 * Applies pending migrations from ./drizzle.
 *
 * `npm run build` runs this first. With no DATABASE_URL (a local build) it
 * skips quietly — local dev migrates its PGlite database on first connection.
 */
import { openDb } from "./db";

async function main() {
  const hasUrl = Boolean(process.env.DATABASE_URL || process.env.POSTGRES_URL);
  if (!hasUrl && process.argv.includes("--if-configured")) {
    console.log("[db:migrate] DATABASE_URL not set — skipping.");
    return;
  }
  const { migrate, close, kind } = await openDb();
  await migrate();
  await close();
  console.log(`[db:migrate] ${kind}: migrations applied.`);
}

main().catch((err) => {
  console.error("[db:migrate] failed:", err);
  process.exit(1);
});
