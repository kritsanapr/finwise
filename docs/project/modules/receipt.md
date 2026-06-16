# Module: Receipt

## Purpose

Handle upload, storage, and AI extraction of store receipts (`ใบเสร็จร้านค้า`).

## Current State

- Upload screen at `app/(app)/receipts/page.tsx`
- `components/upload/ImageUploader.tsx` and `components/upload/ExtractionResult.tsx`
- Elysia module `app/api/[[...slugs]]/modules/receipts.ts`
- Service `lib/server/services/receipts.ts`
- Files stored in Supabase Storage `receipts` bucket
- AI extraction stores merchant, date, amount, and line items in `database/schema.ts` (`receipts` table)

## Responsibilities

- Accept image uploads from camera or gallery
- Store files privately in Supabase Storage
- Run AI extraction on uploaded images
- Allow users to review and correct extraction results
- Link receipts to expense records

## Boundaries

- Extraction output is untrusted input until reviewed
- Storage must remain private (signed URLs)
- Receipts may exist independently of expenses, but can be linked to one expense

## Related Files

- `app/(app)/receipts/page.tsx`
- `components/upload/**`
- `app/api/[[...slugs]]/modules/receipts.ts`
- `lib/server/services/receipts.ts`
- `lib/services/upload.ts`
- `lib/services/ai-extract.ts`
- `database/schema.ts` (`receipts` table)

## Linked PBIs

- PBI 1.3 — Receipt & Bank Slip Workflows
- PBI 1.4 — Dashboard & Reporting Foundation
- PBI 4.1 — AI Training & Extraction Pipeline

## Open Questions

- Should the `receipts` and `bank_slips` storage models be unified into a shared document table?
- How do we handle low-confidence extraction results?
