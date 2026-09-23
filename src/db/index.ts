import "server-only";
import path from "node:path";
import { drizzle as drizzlePg, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

/**
 * Database access — one Drizzle API, two drivers.
 *
 * - `DATABASE_URL` (or `POSTGRES_URL`, which the Vercel/Neon integration sets)
 *   → real Postgres via postgres.js. This is what production runs on.
 * - No URL during `next dev` → an embedded PGlite database persisted under
 *   `.data/pglite`, migrated automatically on first use. Zero setup locally.
 * - No URL anywhere else (e.g. `next build` on a machine without a database)
 *   → `DatabaseUnavailableError`. Public read helpers in `lib/cms/public.ts`
 *   catch it and fall back to empty content so the marketing site still builds
 *   and renders; the admin shows a "database not configured" screen.
 *
 * PGlite is single-process, which is exactly why it's dev-only: `next build`
 * prerenders across several worker processes that would fight over the files.
 */

export type Db = PostgresJsDatabase<typeof schema>;

export class DatabaseUnavailableError extends Error {
  constructor() {
    super(
      "No database configured. Set DATABASE_URL (Postgres) — see .env.example. " +
        "Local `next dev` falls back to an embedded PGlite database automatically.",
    );
    this.name = "DatabaseUnavailableError";
  }
}

const globalForDb = globalThis as unknown as { __jpDb?: Promise<Db> };

export const databaseUrl = () => process.env.DATABASE_URL || process.env.POSTGRES_URL || "";

const shouldUseLocalPglite = () => !databaseUrl() && process.env.NODE_ENV === "development";

export const isDatabaseConfigured = () => Boolean(databaseUrl()) || shouldUseLocalPglite();

async function connect(): Promise<Db> {
  const url = databaseUrl();
  if (url) {
    const client = postgres(url, {
      // Serverless-friendly: a small pool per lambda, and no prepared statements
      // so it also works behind PgBouncer/Neon's pooled endpoint.
      max: Number(process.env.DATABASE_POOL_MAX ?? 5),
      prepare: false,
      idle_timeout: 20,
      connect_timeout: 10,
    });
    return drizzlePg(client, { schema });
  }

  if (shouldUseLocalPglite()) {
    const { PGlite } = await import("@electric-sql/pglite");
    const { drizzle } = await import("drizzle-orm/pglite");
    const { migrate } = await import("drizzle-orm/pglite/migrator");
    const dir = path.join(process.cwd(), ".data", "pglite");
    const client = new PGlite(dir);
    const db = drizzle(client, { schema });
    await migrate(db, { migrationsFolder: path.join(process.cwd(), "drizzle") });
    // The query-builder API is identical across the pg drivers; only the
    // driver-specific result metadata differs, which this codebase never reads.
    return db as unknown as Db;
  }

  throw new DatabaseUnavailableError();
}

/** Returns the shared Drizzle client. Throws `DatabaseUnavailableError` if none. */
export function getDb(): Promise<Db> {
  if (!isDatabaseConfigured()) return Promise.reject(new DatabaseUnavailableError());
  if (!globalForDb.__jpDb) {
    globalForDb.__jpDb = connect().catch((err) => {
      globalForDb.__jpDb = undefined; // allow a retry on the next request
      throw err;
    });
  }
  return globalForDb.__jpDb;
}

export { schema };
