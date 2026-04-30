// import "dotenv/config";
// import { defineConfig } from "drizzle-kit";

// export default defineConfig({
//   // Output directory for generated migration SQL files
//   out: "./drizzle",
//   // Drizzle schema file (single source of truth for all tables)
//   schema: "./database/schema.ts",
//   dialect: "postgresql",
//   dbCredentials: {
//     // Use the DIRECT connection (port 5432) for migrations and Studio.
//     // The Transaction pooler (port 6543) does not support DDL statements.
//     url: process.env.DATABASE_URL ?? process.env.DATABASE_URL!,
//   },
//   // Print every SQL statement that will be executed
//   verbose: true,
//   // Abort push/migrate if any destructive changes are detected (safe default)
//   strict: true,
//   migrations: {
//     // Dedicated table to track which migrations have been applied
//     table: "__drizzle_migrations",
//     schema: "public",
//   },
// });


import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config({ path: ".env.local", override: true });

console.log("DATABASE_URL =", process.env.DATABASE_URL?.replace(/:([^:@]+)@/, ":****@"));

export default defineConfig({
  schema: "./database/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
    ssl: false,
  },
});