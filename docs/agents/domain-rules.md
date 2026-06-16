# Finwise Domain And Data Rules

## Domain Model

The implemented core entities are:

- `users`
- `expenses`
- `receipts`
- `bank_slips`

Refer to:

- `database/schema.ts` for exact field types and constraints
- `database/SCHEMA.md` for narrative documentation

## Product Reality Versus Intent

The app is aimed at personal expense tracking around receipts and transfer slips, but the codebase currently implements a narrower slice:

- Email/password auth through Supabase
- Expense CRUD
- Dashboard summaries
- Receipt upload and extraction
- Bank slip upload and extraction

Do not assume the app already has:

- Real LINE identity mapping
- Offline synchronization
- Production-ready OCR confidence handling
- Full reconciliation between receipts, slips, and expenses

## User Identity Rules

- The current code maps authenticated Supabase users into the local `users` table.
- `lineUserId` is currently used as a placeholder identity key for the authenticated user ID.
- Do not redesign identity semantics casually. If adding real LINE auth, document the migration path first.

## Expense Rules

- Expense categories must come from the shared category constants in `lib/validations/expense.ts`.
- Amounts are stored as decimal strings in many current flows.
- Every expense belongs to exactly one application user.
- Any mutation to expenses must enforce ownership by the authenticated user.

## Receipt Rules

- Receipts represent merchant receipts and may exist before or without full expense normalization.
- Receipt extraction is AI-assisted and should be treated as untrusted input until reviewed or validated.
- Store extraction output with nullable fields when certainty is low instead of fabricating values.

## Bank Slip Rules

- Bank slips represent Thai transfer proof documents.
- Extracted transfer details are user-assistive, not guaranteed truth.
- Transfer-linked expenses should usually use the `transfer` category.
- Verification status matters. Prefer explicit flags over implied certainty.

## Sensitive Data Rules

This app handles personal financial data. Treat the following as sensitive:

- Receipt images
- Bank slip images
- Account references
- Expense history
- Auth-linked identity data

When changing data flows:

- Minimize exposure to the client
- Avoid logging sensitive payloads
- Avoid making private document storage public by default

## AI Extraction Rules

- External model output must be parsed defensively.
- Keep extraction helpers isolated in `lib/services/ai-extract.ts` or adjacent server-only modules.
- Never trust model output shape without validation or null-safe fallback behavior.
- If expanding extraction fields, update the TypeScript interfaces and any persistence logic together.

## Documentation Drift To Watch

Current docs and code differ in some places. Be careful with these:

- Requirements mention LINE auth, Better Auth, Docker, GitHub Actions, and offline mode, but those are not fully represented in the current runtime code.
- `database/SCHEMA.md` includes `transport`, while the shared category constants currently do not.
- Storage docs recommend private buckets, while helper code currently uses `getPublicUrl`.

If you touch one of these areas, either reconcile the implementation or update the docs so the mismatch is explicit.
