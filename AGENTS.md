# Finwise AI Coding Instructions

## Read This First

This repository uses **Next.js 16 App Router** with **React 19** and **Tailwind CSS v4**. Do not rely on generic Next.js knowledge.

Before changing framework-level behavior, read the relevant guide in `node_modules/next/dist/docs/`, especially:

- `01-app/01-getting-started/02-project-structure.md`
- `01-app/01-getting-started/05-server-and-client-components.md`
- `01-app/01-getting-started/15-route-handlers.md`
- `01-app/02-guides/upgrading/version-16.md`

Heed deprecations and current file conventions. Prefer App Router patterns only.

## Project Intent

Finwise is a mobile-first expense tracking app intended for LINE Mini App style workflows:

- Manual expense entry
- Receipt image upload and AI extraction
- Thai bank slip upload and AI extraction
- Dashboard analytics and charts
- Supabase-backed authentication, storage, and data persistence

Some goals in `specs/requirements.md` are aspirational and are **not fully implemented yet**. Do not assume offline mode, LINE login, webhook flows, or production AI training pipelines already exist unless you verify them in code first.

## Source Of Truth Order

When code and docs disagree, use this priority:

1. Actual runtime code in `app/`, `components/`, `lib/`, and `database/`
2. `database/schema.ts`
3. `database/SCHEMA.md`
4. `package.json`
5. `specs/requirements.md`

If you discover drift, preserve runtime correctness and update docs where appropriate.

## Mandatory Repo Rules

- Keep **Server Components** as the default. Add `"use client"` only when the component needs browser APIs, local state, effects, or event handlers.
- Never import server-only utilities into Client Components.
- Use `@/lib/supabase/server` only in Server Components, Route Handlers, or other server-only code.
- Use `@/lib/supabase/client` only in Client Components.
- Keep database access close to the server. Prefer querying Drizzle directly from Server Components or server-side handlers.
- Reuse and extend the existing Elysia API mounted at `app/api/[[...slugs]]/route.ts` unless there is a clear reason to add a separate Route Handler.
- Do not create a `page.tsx` and `route.ts` at the same route segment level.
- Validate user input with Zod in `lib/validations/` before persisting or mutating data.
- Preserve strict TypeScript. Do not weaken types with `any`, broad casts, or non-null assertions unless there is no better option and the reason is documented inline.
- Prefer existing aliases such as `@/components`, `@/lib`, and `@/database`.
- Keep UI mobile-first and consistent with the current shadcn/base-nova setup and CSS variable theme in `app/globals.css`.
- Respect existing user changes. Do not revert unrelated work.

## Implementation Guides

Use these local guides before making significant changes:

- [Architecture Guide](docs/agents/architecture.md)
- [Coding Standards](docs/agents/coding-standards.md)
- [Domain And Data Rules](docs/agents/domain-rules.md)

## Change Checklist

Before finishing a change, verify:

1. The server/client boundary is correct.
2. Auth-sensitive code checks the current user in a server-safe way.
3. Input validation matches the data model.
4. Styling follows existing tokens and mobile layout patterns.
5. New behavior matches implemented architecture, not only product aspirations.
6. Linting or targeted verification was run when feasible.
