# Module: Outcome

> ⚠️ **Aspirational / Not implemented as a standalone module.** Outcome is conceptually synonymous with expenses in the current product. This file documents whether a separate "outcome" abstraction is needed.

## Purpose

Represent cash outflows in a budgeting or cash-flow context. In Finwise, expenses already serve this role.

## Current State

Covered by the `Expense` module. Every expense is an outcome.

## Responsibilities (if split later)

- Distinguish committed/scheduled outflows from completed expenses
- Track transfer-out and bill-payment events separately from discretionary spending
- Feed net-cash-flow calculations alongside `Income`

## Boundaries

- If implemented, should reuse the `expenses` table or a closely related schema
- Must not duplicate the Expense module's CRUD responsibilities

## Related Files

- See `expense.md`

## Linked PBIs

- PBI 1.2 — Expense Management Polish
- Future: net-cash-flow reporting

## Open Questions

- Is a separate `Outcome` abstraction necessary, or should expenses simply gain a "type" or "status" field?
- Should transfers (currently linked to `bank_slips`) be treated as a distinct outcome type?
