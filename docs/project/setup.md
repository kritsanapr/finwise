# Project Setup

## Local Development

Install dependencies and start the Next.js dev server:

```bash
pnpm install
pnpm dev
```

The app runs at `http://localhost:3000` by default.

## Required Environment

The runtime and migration scripts rely on Supabase/Postgres connection strings.

### Runtime Database

- `DATABASE_URL`
  - Used by `lib/db/index.ts`
  - Expected to be the Supabase transaction pooler connection string

### Migration Database

- `DATABASE_DIRECT_URL`
  - Preferred by `lib/db/migrate.ts`
  - Should point to the direct Postgres connection, not the transaction pooler

If `DATABASE_DIRECT_URL` is not set, the migration runner falls back to `DATABASE_URL` and warns that DDL may fail when the pooler is used.

## Main Scripts

- `pnpm dev`
  - Start local development
- `pnpm build`
  - Build the Next.js app
- `pnpm lint`
  - Run ESLint
- `pnpm db:generate`
  - Generate Drizzle migration SQL from `database/schema.ts`
- `pnpm db:migrate`
  - Run Drizzle CLI migrations
- `pnpm db:migrate:run`
  - Run the programmatic migration runner in `lib/db/migrate.ts`
- `pnpm db:push`
  - Push schema state directly with Drizzle
- `pnpm db:seed`
  - Seed the database

## Related Documents

- `../migrations/README.md`
- `../../database/SCHEMA.md`
- `../../database/DB_DESIGN.md`
