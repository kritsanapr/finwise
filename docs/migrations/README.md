# Migration Documentation

This section documents how schema changes are managed in the current Finwise project.

## Current Migration Path

The current schema source of truth is:

- `database/schema.ts`

Migration artifacts currently live in:

- `drizzle/`

The repo currently contains one generated SQL migration:

- `drizzle/0000_clear_energizer.sql`

## Workflow

1. Update `database/schema.ts`
2. Generate migration SQL with `pnpm db:generate`
3. Review the SQL in `drizzle/`
4. Apply migrations with one of:
   - `pnpm db:migrate`
   - `pnpm db:migrate:run`

## Connection Rules

There are two different database connection modes in the repo:

- Runtime queries use `DATABASE_URL`
  - Configured in `lib/db/index.ts`
  - Intended for the Supabase transaction pooler
- Schema migrations should use `DATABASE_DIRECT_URL`
  - Configured in `lib/db/migrate.ts`
  - Intended for the direct Postgres connection for DDL work

## Current Schema Reality

The runtime schema currently models:

- `users`
- `expenses`
- `receipts`
- `bank_slips`

Important current-state notes:

- `users.line_user_id` is still the persisted identifier name even though runtime auth is Supabase-based
- `expenses.category` is stored as text
- receipt and bank slip metadata are split across separate tables
- storage guidance and helper behavior are not fully aligned yet

Those mismatches are documented because they affect migration planning.

## Migration Planning

Use `roadmap.md` for forward-looking schema evolution that has not been implemented yet.
