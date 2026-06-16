# Module: LINE

## Purpose

Integrate with the LINE ecosystem: LINE Login, LINE Mini App (LIFF), and LINE Messaging API chatbot.

## Current State

Not implemented end-to-end. The `users.line_user_id` column exists, but there is no LINE OAuth, LIFF, or webhook code in the runtime.

## Responsibilities

- LINE Login OAuth flow
- LIFF context detection inside LINE Mini App
- LINE Messaging API webhook handling
- Natural-language expense creation from chat messages
- Chat-based report queries and push notifications

## Boundaries

- Auth flows must map LINE identity to the provider-neutral identity model
- Webhook handlers must verify LINE signatures before processing
- Chat-created expenses should be tagged with source = `line`

## Related Files (future)

- `app/api/[[...slugs]]/modules/line.ts` (to be created)
- `lib/server/services/line.ts` (to be created)
- LINE SDK / LIFF client code

## Linked PBIs

- PBI 2.1 — LINE Login & Identity Mapping
- PBI 2.2 — LINE Mini App Entry
- PBI 2.3 — LINE Messaging API / Chatbot

## Open Questions

- Should LINE auth replace email/password, or coexist?
- Which LINE channel credentials and environment variables are required?
