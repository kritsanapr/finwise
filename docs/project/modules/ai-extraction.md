# Module: AI Extraction

## Purpose

Extract structured data from receipt and bank slip images using external models, and continuously improve extraction quality.

## Current State

- Service `lib/services/ai-extract.ts` handles model calls
- Receipt and slip modules call the service after upload
- Current schema stores extracted fields and `ai_model`

## Responsibilities

- Send images to Openrouter / foundation models for OCR
- Parse and validate model output defensively
- Store extraction results with nullable fields for uncertain data
- Collect user corrections to improve future extraction
- Add confidence scores and route low-confidence results to review

## Boundaries

- Model output is untrusted until reviewed
- Extraction helpers must be server-only
- No fabricated values; use null-safe fallbacks

## Related Files

- `lib/services/ai-extract.ts`
- `lib/server/services/receipts.ts`
- `lib/server/services/slips.ts`
- `database/schema.ts` (`receipts`, `bank_slips`)

## Linked PBIs

- PBI 1.3 — Receipt & Bank Slip Workflows
- PBI 4.1 — AI Training & Extraction Pipeline

## Open Questions

- Should the training pipeline run on a schedule, or only on-demand?
- How do we store and version training samples?
