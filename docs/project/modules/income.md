# Module: Income

> ⚠️ **Aspirational / Not implemented.** This module is not represented in the current runtime or schema.

## Purpose

Track personal income sources so the app can show net cash flow (income minus expenses) over time.

## Current State

Not implemented. The current schema only tracks expenses. Adding income would require:

- New `income` table in `database/schema.ts`
- New validation schemas
- New UI screens and API module
- Updates to Dashboard/Spending reports to show net flow

## Responsibilities

- CRUD for income entries (source, amount, date, note)
- Categorize income (salary, freelance, investment, other)
- Expose income totals for net-cash-flow reporting

## Boundaries

- Owned by the authenticated user
- Read by Dashboard/Spending modules for aggregation

## Related Files (future)

- `app/(app)/income/**`
- `app/api/[[...slugs]]/modules/income.ts`
- `lib/server/services/income.ts`
- `database/schema.ts` (`income` table)

## Linked PBIs

- None yet. Add to a future phase if product scope expands beyond expense tracking.

## Open Questions

- Is income tracking required for the MVP, or is it post-MVP scope?
- Should income support receipt/upload proof, or only manual entry?
