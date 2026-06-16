# Migration Roadmap

This document tracks likely schema-evolution work derived from the gap between the current runtime schema and the broader product requirements.

Nothing in this file should be treated as already implemented.

## Known Pressure Points

### Identity Model

Current state:

- `users.line_user_id` stores the authenticated subject
- runtime auth is Supabase-based

Likely migration path:

- introduce a provider-neutral auth identity model
- rename or replace `line_user_id`
- backfill existing rows before making new constraints mandatory

### Expense Categories

Current state:

- `expenses.category` is free text constrained in application code

Likely migration path:

- introduce an `expense_categories` table
- backfill category references from current text values
- migrate reporting queries to category IDs

### Uploaded Document Modeling

Current state:

- `receipts` and `bank_slips` store overlapping file metadata separately

Likely migration path:

- evaluate a shared document table
- move common storage fields into that table
- preserve receipt- and slip-specific extracted fields separately if needed

### Storage Privacy

Current state:

- project documentation recommends private storage
- helper behavior should be reviewed against that expectation before tightening access rules

Likely migration path:

- align bucket policy and URL generation strategy
- migrate callers away from assumptions about public URLs

## Guardrails For Future Migrations

- Treat `database/schema.ts` as the implementation source of truth
- Write additive migrations first when data backfills are required
- Document runtime behavior changes in `docs/project/`
- Update `database/SCHEMA.md` after schema changes land
