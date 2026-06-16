# Project Overview

## What Finwise Is Today

Finwise is currently a mobile-first expense tracking application built with:

- Next.js 16 App Router
- React 19
- Tailwind CSS v4
- shadcn/ui
- Supabase Auth and Storage
- Drizzle ORM with PostgreSQL
- Elysia mounted through a catch-all Next route handler

The implemented product surface is narrower than the long-term requirements. The current runtime supports:

- Email/password authentication through Supabase
- Dashboard summaries and charts
- Manual expense entry
- Receipt upload and AI extraction
- Thai bank slip upload and AI extraction

These areas are described in planning documents but are not fully implemented end-to-end in the runtime code:

- LINE Login
- LINE Mini App identity mapping
- LINE webhook or chat-driven flows
- Offline sync with IndexedDB or local storage
- Production AI training pipeline

## Project Layout

### Application

- `app/`
  - App Router routes, layouts, and route handlers
- `components/`
  - Feature UI and shared UI primitives
- `lib/`
  - Database client, Supabase helpers, validations, and service integrations
- `database/`
  - Drizzle schema and database design documents

### Documentation

- `docs/agents/`
  - Internal implementation guidance
- `docs/project/`
  - Project-facing runtime and setup documentation
- `docs/migrations/`
  - Migration workflow and schema-evolution notes
- `specs/`
  - Product intent and aspirational requirements

## Runtime Architecture

### Routing

- `app/page.tsx` redirects to `/dashboard`
- `app/(auth)/` contains authentication screens
- `app/(app)/` contains authenticated product screens
- `app/api/[[...slugs]]/route.ts` exposes the main Elysia API under `/api/*`
- `app/api/auth/signup/route.ts` is a standalone Next route handler

### Data Flow

- Server Components handle authenticated reads and server-side queries by default
- Client Components are used for forms, uploads, animations, and browser-only behavior
- Drizzle is the database access layer
- Supabase Storage is used for uploaded receipt and bank slip files

## Related Documents

- `setup.md`
- `../migrations/README.md`
- `../../database/SCHEMA.md`
- `../../database/DB_DESIGN.md`
- `../../specs/requirements.md`
