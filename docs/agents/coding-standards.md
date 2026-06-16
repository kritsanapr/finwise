# Finwise Coding Standards

## TypeScript

- Follow `tsconfig.json` strictly.
- The repo enables `strict`, `noUncheckedIndexedAccess`, `noImplicitReturns`, and `exactOptionalPropertyTypes`.
- Handle nullable and optional values explicitly.
- Prefer typed helpers and inferred types from Zod and Drizzle.
- Avoid `any`. If a temporary cast is unavoidable, keep it local and explain why.

## React And Next.js

- Server Components are the default.
- Add `"use client"` only for interactive leaf components where necessary.
- Keep page files thin when possible: fetch on the server, pass plain props down.
- Use `redirect()` from `next/navigation` for server-side auth redirects.
- Do not move server queries into the client just to simplify code.

## Forms And Validation

- Use `react-hook-form` plus `zodResolver` for interactive forms.
- Put reusable validation in `lib/validations/`.
- Keep validation schema names aligned with the feature, for example `expenseSchema`.
- Validate before database writes and before calling external services.

## Database And Data Safety

- Import DB primitives from `@/lib/db`.
- Import tables and inferred types from `@/database/schema`.
- Reuse existing enums/constants for category values where possible.
- Respect ownership checks: filter records by the authenticated user before read/write/update/delete.
- Preserve timestamp updates such as `updatedAt` on mutations.

## Supabase Usage

- In server code, always `await createClient()` from `@/lib/supabase/server`.
- In client code, use `createClient()` from `@/lib/supabase/client`.
- Do not expose service-role behavior to the client.
- Financial documents should be treated as sensitive data even if helper code currently returns public URLs.

## Styling And Components

- Prefer existing shadcn/ui primitives in `components/ui/`.
- Keep forms and cards touch-friendly for mobile.
- Reuse theme tokens and semantic color classes instead of hard-coded values.
- Maintain the current visual style unless the task explicitly asks for a redesign.
- Use motion sparingly and purposefully; follow existing Framer Motion patterns.

## File Placement

- `app/` for routes, layouts, and route handlers
- `components/ui/` for reusable low-level UI primitives
- `components/<feature>/` for feature UI
- `lib/services/` for integrations and side-effectful helpers
- `lib/validations/` for Zod schemas
- `database/` for schema and schema docs

## Documentation Discipline

- If you introduce a new architectural pattern, update the relevant guide in `docs/agents/`.
- If code contradicts existing docs, prefer fixing the docs in the same change when feasible.

## Verification

Run the smallest meaningful verification for the change:

- `npm run lint` for general code quality
- feature-specific manual verification for auth, uploads, and form flows
- targeted script checks for DB-related changes when applicable

If verification is skipped, say exactly what was not run.
