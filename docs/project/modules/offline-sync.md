# Module: Offline Sync

## Purpose

Allow users to create expenses and queue uploads while offline, then sync with the server when connectivity returns.

## Current State

Not implemented. There is no IndexedDB layer, service worker, or background sync.

## Responsibilities

- Persist pending expenses locally (IndexedDB)
- Queue file uploads locally
- Sync local data to the server in the background
- Show sync status in the UI
- Resolve conflicts from concurrent edits

## Boundaries

- Client-side module; interacts with server APIs only when online
- Must use idempotency keys to avoid duplicate server writes
- Must handle large file blobs efficiently

## Related Files (future)

- `lib/offline/**` (to be created)
- Service worker registration
- `app/api/[[...slugs]]/modules/*` mutation endpoints

## Linked PBIs

- PBI 3.1 — Local Storage Layer
- PBI 3.2 — Background Sync Engine
- PBI 3.3 — Conflict Resolution

## Open Questions

- Which IndexedDB wrapper should we use (`idb`, `dexie`, or native)?
- What is the conflict resolution policy: last-write-wins or manual merge?
