/**
 * lib/db/migrate.ts
 *
 * Programmatic migration runner for FinWise.
 *
 * WHY THIS FILE EXISTS ALONGSIDE `drizzle-kit migrate`?
 * `drizzle-kit migrate` is a CLI dev tool. This script is for:
 *   - Docker entrypoints  (`CMD ["node", "lib/db/migrate.js"]`)
 *   - GitHub Actions CI   (`npm run db:migrate:run`)
 *   - Any environment where you need to run migrations programmatically
 *     before starting the Next.js server.
 *
 * CONNECTION NOTE:
 * Uses the DIRECT connection (port 5432), NOT the Transaction Pooler.
 * DDL statements (CREATE TABLE, ALTER TABLE, etc.) are not supported through
 * pgBouncer in Transaction mode. Set DATABASE_DIRECT_URL in .env.local to the
 * direct connection string from Supabase Project Settings → Database.
 *
 * USAGE:
 *   npm run db:migrate:run
 */

import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

// ─── Env Validation ──────────────────────────────────────────────────────────

// Prefer DATABASE_DIRECT_URL (direct connection) for migrations.
// Fall back to DATABASE_URL if the direct URL is not set, but log a warning.
const connectionString = process.env.DATABASE_DIRECT_URL ?? process.env.DATABASE_URL;

if (!connectionString) {
    console.error(
        "\n[migrate] ❌ No database connection string found.\n" +
        "  Set DATABASE_DIRECT_URL (recommended) or DATABASE_URL in .env.local.\n" +
        "  Use the DIRECT connection URL from Supabase (port 5432), not the pooler.\n"
    );
    process.exit(1);
}

if (!process.env.DATABASE_DIRECT_URL) {
    console.warn(
        "[migrate] ⚠️  DATABASE_DIRECT_URL is not set — falling back to DATABASE_URL.\n" +
        "  Migrations may fail if DATABASE_URL points to the Transaction Pooler (port 6543).\n" +
        "  Set DATABASE_DIRECT_URL to the direct connection URL (port 5432) to be safe.\n"
    );
}

// ─── Migration Runner ────────────────────────────────────────────────────────

async function runMigrations(): Promise<void> {
    const startedAt = Date.now();
    console.log(`[migrate] 🚀 Starting migrations — ${new Date().toISOString()}`);

    // Use max:1 — migrations run sequentially, a single connection is enough
    const client = postgres(connectionString!, { max: 1, prepare: false });
    const db = drizzle(client);

    try {
        await migrate(db, {
            migrationsFolder: "./drizzle",
            migrationsTable: "__drizzle_migrations",
        });

        const elapsed = Date.now() - startedAt;
        console.log(`[migrate] ✅ Migrations complete in ${elapsed}ms`);
    } catch (err) {
        console.error("[migrate] ❌ Migration failed:", err);
        process.exit(1);
    } finally {
        // Always close the dedicated migration connection
        await client.end();
        console.log("[migrate] 🔌 Connection closed");
    }
}

// Run immediately when this script is executed
void runMigrations();
