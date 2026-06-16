# Module: Expense

## Purpose

Core expense tracking domain. Handles creation, editing, categorization, and listing of personal expenses.

## Current State

Implemented in the runtime:

- Manual expense entry via `app/(app)/expenses/new/page.tsx` and `components/expenses/ExpenseForm.tsx`
- Expense list, detail, and edit screens under `app/(app)/expenses/`
- Elysia module `app/api/[[...slugs]]/modules/expenses.ts`
- Service layer `lib/server/services/expenses.ts`
- Zod validation in `lib/validations/expense.ts`

Categories are currently free-text but constrained by `EXPENSE_CATEGORIES` constants.

## Responsibilities

- CRUD operations for expenses
- Category assignment and validation
- Ownership enforcement per authenticated user
- Date and amount formatting consistent with Thai Baht (฿)

## Boundaries

- Accepts validated input from the React form (Zod) and the API (TypeBox)
- Persists only through `lib/server/services/expenses.ts`
- Each expense belongs to exactly one user

## Related Files

- `app/(app)/expenses/**`
- `components/expenses/**`
- `app/api/[[...slugs]]/modules/expenses.ts`
- `lib/server/services/expenses.ts`
- `lib/validations/expense.ts`
- `database/schema.ts` (`expenses` table)

## Linked PBIs

- PBI 1.2 — Expense Management Polish
- PBI 1.3 — Receipt & Bank Slip Workflows (auto-linking)
- PBI 2.3 — LINE Messaging API / Chatbot
- PBI 3.1 / 3.2 — Offline storage and sync

## Open Questions

- Should category governance move to a database table (`expense_categories`) or stay as code constants?
- Do we need recurring expenses for launch, or post-MVP?
