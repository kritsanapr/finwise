# Finwise

Finwise is a mobile-first expense tracking app built with Next.js 16, React 19, Supabase, Drizzle, and Elysia.

The current runtime application supports:

- Supabase authentication
- Manual expense entry
- Dashboard summaries and charts
- Receipt upload with AI extraction
- Thai bank slip upload with AI extraction

Some requirements in `specs/requirements.md` describe planned capabilities that are not fully implemented yet, including LINE-native auth flows, offline sync, and broader AI pipeline work.

## Documentation

Project documentation now lives under [`docs/`](docs/README.md).

Recommended starting points:

- [`docs/README.md`](docs/README.md)
- [`docs/project/overview.md`](docs/project/overview.md)
- [`docs/project/setup.md`](docs/project/setup.md)
- [`docs/migrations/README.md`](docs/migrations/README.md)

## Development

Install dependencies and start the dev server:

```bash
pnpm install
pnpm dev
```

The app runs at [http://localhost:3000](http://localhost:3000).

## Database

Schema source of truth:

- `database/schema.ts`

Migration scripts:

- `pnpm db:generate`
- `pnpm db:migrate`
- `pnpm db:migrate:run`

See [`docs/migrations/README.md`](docs/migrations/README.md) for the current workflow and connection rules.
