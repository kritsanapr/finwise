# Module: Spending

## Purpose

Aggregated spending analysis and insights. Distinct from the raw `Expense` module in that it focuses on reporting, trends, and behavioral summaries rather than individual transaction CRUD.

## Current State

Partially covered by the Dashboard module today:

- `components/dashboard/StatsCards.tsx`
- `components/dashboard/TrendChart.tsx`
- `components/dashboard/CategoryDonutChart.tsx`
- `lib/server/services/dashboard.ts`

There is no standalone "Spending" service yet.

## Responsibilities

- Aggregate expenses into time-series and category views
- Provide spending insights (month-over-month, top categories, anomalies)
- Support date-range and category filters
- Export summarized reports (CSV, and later PDF)

## Boundaries

- Read-only aggregations over the `expenses` table
- Does not mutate expense data
- May consume receipt/slip data for source verification but does not own it

## Related Files

- `app/(app)/dashboard/page.tsx`
- `components/dashboard/**`
- `lib/server/services/dashboard.ts`
- `database/schema.ts` (`expenses`, `receipts`, `bank_slips`)

## Linked PBIs

- PBI 1.4 — Dashboard & Reporting Foundation
- PBI 4.1 — AI Training & Extraction Pipeline (anomaly detection inputs)

## Open Questions

- Should Spending be a separate Elysia module (`/api/spending/**`) or remain under `/api/dashboard/stats`?
- Do we need budget-vs-actual tracking in this module?
