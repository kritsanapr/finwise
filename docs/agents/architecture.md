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

The repo currently uses **Elysia inside Next Route Handlers** as the main API layer.

Keep these principles:

- Extend `app/api/[[...slugs]]/route.ts` for most app API additions
- Keep auth enforcement inside handlers
- Return predictable JSON payloads
- Co-locate request validation with handler logic or shared Zod schemas

### Secondary Pattern

Use standalone `app/api/**/route.ts` files only when:

- The endpoint is intentionally isolated
- Elysia integration is a poor fit
- The endpoint has framework-specific needs

Current example:

- `app/api/auth/signup/route.ts`

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
