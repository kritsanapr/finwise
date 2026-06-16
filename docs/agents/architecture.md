# Finwise Architecture Guide

## Stack Snapshot

- Next.js `16.2.6`
- React `19.2.6`
- App Router only
- Tailwind CSS v4
- shadcn/ui with `base-nova` style and RSC enabled
- Supabase auth and storage
- Drizzle ORM with PostgreSQL
- Elysia mounted through a catch-all Next Route Handler
- Framer Motion for transitions and small UI animations
- Recharts for dashboard visualization

## Current Application Shape

### Routing

- `app/layout.tsx` defines global fonts, `ThemeProvider`, and `Toaster`
- `app/page.tsx` redirects to `/dashboard`
- `app/(auth)` contains unauthenticated screens
- `app/(app)` contains authenticated screens and shared app chrome
- `app/api/[[...slugs]]/route.ts` mounts the Elysia API under `/api/*`
- `app/api/auth/signup/route.ts` is a standalone Next Route Handler for admin signup

### Route Group Intent

- `(auth)` is for entry and authentication flow
- `(app)` is for signed-in product surfaces

Keep using route groups to share layouts without changing URLs.

## Rendering Model

### Server Components

Default to Server Components for:

- Page-level data fetching
- Auth checks
- Drizzle queries
- Secure environment variable access

Examples in the current codebase:

- `app/(app)/layout.tsx`
- `app/(app)/dashboard/page.tsx`
- `app/(app)/expenses/page.tsx`

### Client Components

Use Client Components only for:

- Forms
- Upload interactions
- Local UI state
- Framer Motion animations
- `next-themes` theme toggling
- Browser-side Supabase auth actions

Examples in the current codebase:

- `components/expenses/ExpenseForm.tsx`
- `components/upload/ImageUploader.tsx`
- `components/layout/Header.tsx`

## API Architecture

### Primary Pattern

The repo currently uses **Elysia inside Next Route Handlers** as the main API layer. The Elysia app is composed from focused sub-app modules with shared auth and error plugins.

Keep these principles:

- Extend `app/api/[[...slugs]]/route.ts` for most app API additions
- Add new features as a new module under `app/api/[[...slugs]]/modules/` and `.use(...)` it from `route.ts`
- Put reusable TypeBox request schemas under `lib/server/validation/`
- Put reusable Drizzle + business logic under `lib/server/services/`
- Return predictable JSON payloads — error responses use the `{ error, issues? }` shape produced by the error plugin
- Validate request inputs with TypeBox (Elysia) at the HTTP boundary, and with Zod (`lib/validations/`) at the form boundary

### Elysia Module Layout

```
app/api/[[...slugs]]/
├── route.ts                          # thin assembler, mounts plugins + modules
├── plugins/
│   ├── auth.ts                       # authPlugin: resolve { authUser, dbUser }
│   └── error.ts                      # errorHandler: standardized JSON errors
└── modules/
    ├── health.ts                     # GET /health
    ├── expenses.ts                   # GET/POST/PUT/DELETE /expenses
    ├── dashboard.ts                  # GET /dashboard/stats
    ├── receipts.ts                   # POST /receipts/upload
    └── slips.ts                      # POST /slips/upload

lib/server/
├── auth/current-user.ts              # getAuthUser, getOrCreateDbUser, requireUser, ApiAuthError
├── services/                         # plain async Drizzle functions, ownership-aware
│   ├── expenses.ts                   # listExpenses, createExpense, updateExpense, deleteExpense
│   ├── dashboard.ts                  # getDashboardStats
│   ├── receipts.ts                   # uploadReceipt
│   └── slips.ts                      # uploadBankSlip
└── validation/schemas.ts             # TypeBox schemas (Elysia HTTP boundary)

lib/validations/
├── expense.ts                        # Zod schemas for the React form (expenseSchema, EXPENSE_CATEGORIES)
└── api.ts                            # Zod schemas mirroring the TypeBox API shapes
```

When adding a new endpoint:

1. Add or extend a service function in `lib/server/services/`.
2. Add or extend the TypeBox schema in `lib/server/validation/schemas.ts` (and the Zod mirror in `lib/validations/api.ts` if it is a new shape).
3. Add the route to the appropriate module under `app/api/[[...slugs]]/modules/` and call the service.
4. Do not change `route.ts` unless you are wiring up a brand new module.

### Auth Plugin

`plugins/auth.ts` exposes `authPlugin = new Elysia({ name: "auth" }).resolve({ as: "scoped" }, ...)`. Any module that does `.use(authPlugin)` gets `{ authUser, dbUser }` on the request context. The plugin is scoped (`as: "scoped"`) so the typed context flows into the module's routes. Unauthenticated requests throw `ApiAuthError` (defined in `lib/server/auth/current-user.ts`), which the error plugin translates into HTTP 401.

### Error Plugin

`plugins/error.ts` mounts `.onError` at the root. It normalizes:

- `ApiAuthError` -> 401 `{ error }`
- Elysia `VALIDATION` -> 400 `{ error, issues }`
- Elysia `NOT_FOUND` -> 404 `{ error }`
- Elysia `PARSE` -> 400 `{ error }`
- everything else -> 500 `{ error: "Internal Server Error" }`

Handlers should prefer throwing `status(code, message)` or returning early, rather than manually writing `set.status = ...` and returning `{ error }`.

### Public API Surface

| Method | Path | Auth | Source |
| --- | --- | --- | --- |
| GET | `/api/health` | public | `modules/health.ts` |
| GET | `/api/expenses` | required | `modules/expenses.ts` |
| POST | `/api/expenses` | required | `modules/expenses.ts` |
| PUT | `/api/expenses/:id` | required | `modules/expenses.ts` |
| DELETE | `/api/expenses/:id` | required | `modules/expenses.ts` |
| GET | `/api/dashboard/stats` | required | `modules/dashboard.ts` |
| POST | `/api/receipts/upload` | required | `modules/receipts.ts` |
| POST | `/api/slips/upload` | required | `modules/slips.ts` |

`app/api/auth/signup/route.ts` is intentionally a standalone Next Route Handler (admin signup uses the service role key, not the user session) and is **not** mounted through Elysia. See the next section.

### Secondary Pattern

Use standalone `app/api/**/route.ts` files only when:

- The endpoint is intentionally isolated
- Elysia integration is a poor fit
- The endpoint has framework-specific needs (for example, it needs the Next.js `NextRequest`/`NextResponse` shape)

Current example:

- `app/api/auth/signup/route.ts` (admin signup via the Supabase service role)

## Data And Persistence Layers

### Database

- Schema source of truth: `database/schema.ts`
- Drizzle entrypoint: `lib/db/index.ts`
- Migrations and seed scripts live in `lib/db/`

Important constraints:

- `lib/db/index.ts` uses a singleton to avoid connection exhaustion during hot reload
- Runtime DB client expects `DATABASE_URL` transaction pooler settings
- Do not create ad hoc DB clients in feature files

### Supabase

- Server client: `lib/supabase/server.ts`
- Browser client: `lib/supabase/client.ts`
- Middleware/session helper: `lib/supabase/middleware.ts`
- File upload helper: `lib/services/upload.ts`

Preserve the client split. Never cross-import these incorrectly.

## Styling System

- Tailwind v4 is configured through `app/globals.css`
- Theme tokens are CSS variables
- shadcn/ui components live in `components/ui`
- Visual language is neutral, compact, and mobile-first

When adding UI:

- Reuse existing UI primitives first
- Prefer token-driven classes like `bg-background`, `text-muted-foreground`, `border-border`
- Match current spacing and card-based composition

## Known Architecture Gaps

These may be described in requirements but are not clearly implemented end-to-end yet:

- LINE Login and LINE Mini App integration
- LINE Messaging API and webhook flows
- Offline mode with IndexedDB/local sync
- Full production AI training pipeline
- End-to-end middleware/proxy wiring for auth refresh

Do not claim these exist unless you verify the exact code path first.
