# Module: Dashboard

## Purpose

Display summary statistics, charts, and quick actions for the signed-in user.

## Current State

- Entry point at `app/(app)/dashboard/page.tsx`
- `components/dashboard/StatsCards.tsx`
- `components/dashboard/TrendChart.tsx`
- `components/dashboard/CategoryDonutChart.tsx`
- Elysia module `app/api/[[...slugs]]/modules/dashboard.ts`
- Service `lib/server/services/dashboard.ts`

## Responsibilities

- Aggregate expenses by period and category
- Render mobile-first charts and stat cards
- Provide entry points to add expenses, receipts, and slips
- Support date-range and category filters

## Boundaries

- Read-only aggregations
- Does not own expense mutations
- Consumes data from the Expense and Receipt/Bank Slip modules

## Related Files

- `app/(app)/dashboard/page.tsx`
- `components/dashboard/**`
- `app/api/[[...slugs]]/modules/dashboard.ts`
- `lib/server/services/dashboard.ts`
- `database/schema.ts` (`expenses` table)

## Linked PBIs

- PBI 1.4 — Dashboard & Reporting Foundation
- PBI 2.3 — LINE Messaging API / Chatbot (report queries)

## Open Questions

- Should Dashboard and Spending be merged into one module, or kept separate?
- Do we need real-time updates, or is server-rendered data sufficient?
