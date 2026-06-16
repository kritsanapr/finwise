# Module: Bank Slip

## Purpose

Handle upload, storage, and AI extraction of Thai bank transfer slips (`สลิปธนาคาร`).

## Current State

- Upload screen at `app/(app)/slips/page.tsx`
- Elysia module `app/api/[[...slugs]]/modules/slips.ts`
- Service `lib/server/services/slips.ts`
- Files stored in Supabase Storage `bank-slips` bucket
- Extracted fields include bank name, transfer reference, sender/receiver accounts, amount, and transfer date
- `is_verified` flag exists but UI workflow is minimal

## Responsibilities

- Accept transfer slip image uploads
- Store files privately in Supabase Storage
- Extract transfer details via AI
- Support manual verification by the user
- Auto-create or auto-link a `transfer` expense

## Boundaries

- Slip data is user-assistive, not guaranteed truth
- Verification status must be explicit (`is_verified`)
- Storage should use signed URLs, not public URLs

## Related Files

- `app/(app)/slips/page.tsx`
- `app/api/[[...slugs]]/modules/slips.ts`
- `lib/server/services/slips.ts`
- `lib/services/upload.ts`
- `lib/services/ai-extract.ts`
- `database/schema.ts` (`bank_slips` table)

## Linked PBIs

- PBI 1.3 — Receipt & Bank Slip Workflows
- PBI 4.1 — AI Training & Extraction Pipeline

## Open Questions

- Should verification trigger automatic expense creation, or require explicit user confirmation?
- Should the `public_url` column be deprecated in favor of signed URLs?
