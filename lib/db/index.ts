/**
 * lib/db/index.ts
 *
 * Drizzle ORM singleton for the FinWise application.
 *
 * WHY A SINGLETON?
 * Next.js hot-reload in development re-imports modules on every file change.
 * Without a singleton guard, each reload would open a new postgres connection
 * pool, quickly exhausting the Supabase connection limit.
 *
 * CONNECTION STRING:
 * Use the Supabase Transaction Pooler URL (port 6543) for this runtime client.
 * Set `prepare: false` — prepared statements are not supported in pooler mode.
 * For migrations, use the DIRECT connection (port 5432) — see lib/db/migrate.ts.
 *
 * USAGE (Server Component / Route Handler / Server Action):
 *   import { db } from "@/lib/db"
 *   const rows = await db.select().from(users).where(eq(users.id, id))
 */

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@/database/schema";

// ─── Type Exports ────────────────────────────────────────────────────────────

/** Fully-typed Drizzle instance inferred from the project schema. */
export type DB = ReturnType<typeof drizzle<typeof schema>>;

// ─── Env Validation ──────────────────────────────────────────────────────────

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    throw new Error(
        "[lib/db] DATABASE_URL is not set.\n" +
        "Add it to .env.local — use the Transaction Pooler URL from Supabase " +
        "(Project Settings → Database → Connection string → Transaction pooler, port 6543)."
    );
}

// ─── Singleton Pattern ───────────────────────────────────────────────────────

/**
 * Extend the global object with a typed slot for the DB instance.
 * This prevents multiple connections during Next.js hot-reload in development.
 */
declare global {
    // eslint-disable-next-line no-var
    var __finwise_db: DB | undefined;
}

/**
 * Create the postgres-js client.
 * `prepare: false` is REQUIRED for Supabase Transaction pooler mode.
 */
function createDrizzleClient(): DB {
    const client = postgres(connectionString!, {
        prepare: false,
        // Limit idle connections; Supabase free tier has a low connection cap
        max: 10,
        idle_timeout: 20,
        connect_timeout: 10,
    });

    return drizzle(client, {
        schema,
        // Enable Drizzle query logger in development for visibility
        logger: process.env.NODE_ENV === "development",
    });
}

/**
 * Singleton Drizzle database instance.
 *
 * - In production: created once per serverless function cold start.
 * - In development: reused across hot-reloads via `globalThis`.
 */
export const db: DB =
    globalThis.__finwise_db ?? (globalThis.__finwise_db = createDrizzleClient());

// Re-export schema types for convenient imports elsewhere
export * from "@/database/schema";
