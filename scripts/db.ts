/**
 * Standalone DB connection for CLI scripts (migrate, admin:create).
 *
 * Uses DATABASE_URL when set; otherwise opens the local PGlite database at
 * .data/pglite — stop `npm run dev` first, PGlite is single-process.
 */
import path from "node:path";
import postgres from "postgres";
import { drizzle as drizzlePg } from "drizzle-orm/postgres-js";
import { migrate as migratePg } from "drizzle-orm/postgres-js/migrator";
import * as schema from "../src/db/schema";

const migrationsFolder = path.join(process.cwd(), "drizzle");

export async function openDb() {
  const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (url) {
    const client = postgres(url, { max: 1, prepare: false });
    const db = drizzlePg(client, { schema });
    return {
      db,
      kind: "postgres" as const,
      migrate: () => migratePg(db, { migrationsFolder }),
      close: () => client.end(),
    };
  }
  const { PGlite } = await import("@electric-sql/pglite");
  const { drizzle } = await import("drizzle-orm/pglite");
  const { migrate } = await import("drizzle-orm/pglite/migrator");
  const client = new PGlite(path.join(process.cwd(), ".data", "pglite"));
  const db = drizzle(client, { schema });
  return {
    db: db as unknown as typeof db & ReturnType<typeof drizzlePg<typeof schema>>,
    kind: "pglite" as const,
    migrate: () => migrate(db, { migrationsFolder }),
    close: () => client.close(),
  };
}
