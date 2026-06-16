# Finwise Documentation

This directory is the project-facing documentation hub for Finwise.

## Structure

- `agents/`
  - Internal implementation guidance for coding agents working in this repository.
- `project/`
  - Product and architecture documentation for the current runtime application.
- `migrations/`
  - Database migration workflow and schema-evolution planning.

## Recommended Reading Order

1. `project/overview.md`
2. `project/timeline.md`
3. `project/setup.md`
4. `migrations/README.md`
5. `../database/SCHEMA.md`
6. `../database/DB_DESIGN.md`

## Current Source Of Truth

When documentation disagrees, use this order:

1. Runtime code in `app/`, `components/`, `lib/`, and `database/`
2. `database/schema.ts`
3. `database/SCHEMA.md`
4. `package.json`
5. `specs/requirements.md`

The documents in this folder are intended to make those realities easier to navigate without restating aspirational requirements as if they already exist.
