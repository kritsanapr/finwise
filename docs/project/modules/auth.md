# Module: Auth

## Purpose

Authenticate users and resolve them to a local `users` record for all protected operations.

## Current State

- Runtime auth uses Supabase Auth with email/password
- `app/(auth)/login/page.tsx` handles login UI
- `app/api/auth/signup/route.ts` is a standalone admin signup route
- Elysia `authPlugin` (`app/api/[[...slugs]]/plugins/auth.ts`) resolves `{ authUser, dbUser }`
- `lib/server/auth/current-user.ts` provides `getAuthUser`, `getOrCreateDbUser`, `requireUser`

Identity currently relies on `line_user_id` in the `users` table, even for email/password users.

## Responsibilities

- Login / logout / session refresh
- User resolution and creation on first auth
- Enforcing authentication on protected API routes
- Supporting multiple identity providers (email/password, LINE)

## Boundaries

- Server-side auth only in Server Components, Route Handlers, and Elysia plugins
- Browser-side auth only in Client Components via `lib/supabase/client.ts`
- Never import server-only utilities into Client Components

## Related Files

- `app/(auth)/**`
- `app/api/auth/signup/route.ts`
- `app/api/[[...slugs]]/plugins/auth.ts`
- `lib/server/auth/current-user.ts`
- `lib/supabase/server.ts`
- `lib/supabase/client.ts`
- `lib/supabase/middleware.ts`
- `database/schema.ts` (`users` table)

## Linked PBIs

- PBI 1.1 — Auth & Identity Hardening
- PBI 2.1 — LINE Login & Identity Mapping
- PBI 2.2 — LINE Mini App Entry

## Open Questions

- Should the project migrate to Better Auth, or stay on Supabase Auth?
- How should existing `line_user_id` rows be backfilled during identity normalization?
