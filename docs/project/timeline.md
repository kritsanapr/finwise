# Finwise Project Timeline

Product backlog timeline organized by **Phase → PBI → Module → Task checklist**.

> This timeline bridges the current runtime (email/password auth, manual expenses, receipt/slip upload, dashboard) and the aspirational product surface described in `specs/requirements.md`.
>
> Module-level details live in [`modules/`](./modules/).
>
> Estimates are relative story points (SP) and calendar-week ranges. Treat them as planning placeholders to be refined per sprint.

---

## Legend

| Term | Meaning |
|---|---|
| **PBI** | Product Backlog Item — a shippable feature goal |
| **Module** | Functional area of the codebase (auth, expense, receipt, etc.) |
| **Task** | A concrete, checkable work item |
| **SP** | Story Points — relative estimate per PBI |

---

## Phase 1 — MVP Hardening

**Goal:** Stabilize the existing runtime, close schema drift, and polish core flows before adding external integrations.

**Duration:** Weeks 1–4  
**Total PBIs:** 4  
**Estimated effort:** ~41 SP

### PBI 1.1 — Auth & Identity Hardening

**Goal:** Make identity provider-neutral and safe for both email/password and LINE login.

**Est. 2 weeks | ~13 SP**

#### Module: Auth
- [ ] Task 1.1.1: Audit current Supabase auth against the Better Auth aspiration in `specs/requirements.md`
- [ ] Task 1.1.2: Design provider-neutral identity model (migrate away from `line_user_id` as the sole subject)
- [ ] Task 1.1.3: Implement identity resolution path with backward-compatible backfill
- [ ] Task 1.1.4: Add profile management UI (display name, avatar, account linking)

#### Module: Database
- [ ] Task 1.1.5: Add additive migration for provider identity table or normalized `provider_id`
- [ ] Task 1.1.6: Backfill existing users before tightening unique constraints
- [ ] Task 1.1.7: Update `database/SCHEMA.md` and `database/DB_DESIGN.md`

---

### PBI 1.2 — Expense Management Polish

**Goal:** Move from free-text categories to governed categories and add recurring/bulk support.

**Est. 1.5 weeks | ~10 SP**

#### Module: Expense
- [ ] Task 1.2.1: Introduce `expense_categories` lookup table seeded from `lib/validations/expense.ts`
- [ ] Task 1.2.2: Migrate free-text `expenses.category` to category IDs with data backfill
- [ ] Task 1.2.3: Add recurring expense support (frequency, next due date, end condition)
- [ ] Task 1.2.4: Add bulk delete and bulk category update in the expenses list

#### Module: Database
- [ ] Task 1.2.5: Write additive category migration and reporting query updates

---

### PBI 1.3 — Receipt & Bank Slip Workflows

**Goal:** Link uploads to expenses and let users verify or correct AI extraction output.

**Est. 1.5 weeks | ~11 SP**

#### Module: Receipt
- [ ] Task 1.3.1: Build receipt gallery / list screen
- [ ] Task 1.3.2: Add receipt-to-expense linking flow
- [ ] Task 1.3.3: Allow manual correction of extracted merchant, date, amount, and line items
- [ ] Task 1.3.4: Replace `getPublicUrl` usage with signed-URL helper for private storage

#### Module: Bank Slip
- [ ] Task 1.3.5: Add slip verification workflow and `is_verified` toggle in the UI
- [ ] Task 1.3.6: Auto-create or auto-link a `transfer` expense from verified slip data
- [ ] Task 1.3.7: Align slip image access with private bucket policy

#### Module: Storage
- [ ] Task 1.3.8: Enforce private bucket policies and document access rules

---

### PBI 1.4 — Dashboard & Reporting Foundation

**Goal:** Add filtering, export, and basic insights on top of the current dashboard.

**Est. 1 week | ~7 SP**

#### Module: Dashboard
- [ ] Task 1.4.1: Add date-range and category filters to dashboard stats
- [ ] Task 1.4.2: Add CSV export for expenses
- [ ] Task 1.4.3: Add simple spending insights (e.g., month-over-month change, top category)

---

## Phase 2 — LINE Ecosystem Integration

**Goal:** Enable LINE Login, LINE Mini App entry, and chatbot-driven expense logging.

**Duration:** Weeks 5–8  
**Total PBIs:** 3  
**Estimated effort:** ~34 SP

### PBI 2.1 — LINE Login & Identity Mapping

**Goal:** Users can sign in with LINE and map to a local user row without breaking existing accounts.

**Est. 1.5 weeks | ~10 SP**

#### Module: Auth
- [ ] Task 2.1.1: Configure LINE Login channel and environment credentials
- [ ] Task 2.1.2: Implement LINE OAuth callback handler
- [ ] Task 2.1.3: Map LINE `sub` to provider-neutral identity
- [ ] Task 2.1.4: Support both LINE-only and legacy email/password accounts

#### Module: Database
- [ ] Task 2.1.5: Add unique provider identity constraints and migration

---

### PBI 2.2 — LINE Mini App Entry

**Goal:** The app renders correctly inside the LINE Mini App and receives LIFF context.

**Est. 1.5 weeks | ~10 SP**

#### Module: LINE
- [ ] Task 2.2.1: Add LIFF SDK initialization
- [ ] Task 2.2.2: Detect Mini App context and adjust routing / chrome
- [ ] Task 2.2.3: Pass LINE identity token to backend on API calls
- [ ] Task 2.2.4: Document shortcut menu / rich menu configuration

#### Module: UI
- [ ] Task 2.2.5: Optimize layout for LINE in-app browser viewport constraints

---

### PBI 2.3 — LINE Messaging API / Chatbot

**Goal:** Users can log expenses and request reports via LINE chat.

**Est. 2 weeks | ~14 SP**

#### Module: LINE
- [ ] Task 2.3.1: Configure LINE Messaging API webhook endpoint
- [ ] Task 2.3.2: Verify webhook signature and parse incoming messages
- [ ] Task 2.3.3: Implement expense creation from Thai natural language (e.g., "ค่าน้ำ 500")
- [ ] Task 2.3.4: Implement report queries from chat (e.g., "ดูรายงานเดือนนี้")
- [ ] Task 2.3.5: Add push notification templates for reminders and alerts

#### Module: API
- [ ] Task 2.3.6: Add chat-originated expense endpoint with LINE source tag

---

## Phase 3 — Offline Mode & Sync

**Goal:** Core features work without connectivity and sync safely when the device comes back online.

**Duration:** Weeks 9–12  
**Total PBIs:** 3  
**Estimated effort:** ~28 SP

### PBI 3.1 — Local Storage Layer

**Goal:** Persist expenses, receipts, and slips locally with a structured client-side store.

**Est. 1.5 weeks | ~11 SP**

#### Module: Offline / Storage
- [ ] Task 3.1.1: Select and configure IndexedDB wrapper (e.g., `idb` or `dexie`)
- [ ] Task 3.1.2: Create local schema mirroring server entities
- [ ] Task 3.1.3: Cache user-created expenses with a pending-sync status
- [ ] Task 3.1.4: Cache uploaded file blobs in an upload queue

#### Module: PWA
- [ ] Task 3.1.5: Add service worker shell and offline fallback page

---

### PBI 3.2 — Background Sync Engine

**Goal:** Automatically push local changes when connectivity returns.

**Est. 1.5 weeks | ~10 SP**

#### Module: Offline / Storage
- [ ] Task 3.2.1: Implement upload queue processor for expenses and files
- [ ] Task 3.2.2: Retry failed uploads with exponential backoff
- [ ] Task 3.2.3: Show sync status indicator in the app chrome
- [ ] Task 3.2.4: Handle background fetch for large file uploads

#### Module: API
- [ ] Task 3.2.5: Add idempotency keys to expense and upload mutation endpoints

---

### PBI 3.3 — Conflict Resolution

**Goal:** Handle concurrent edits across multiple devices gracefully.

**Est. 1 week | ~7 SP**

#### Module: Offline / Storage
- [ ] Task 3.3.1: Define conflict resolution strategy (last-write-wins or manual merge)
- [ ] Task 3.3.2: Add server-timestamp comparison on sync
- [ ] Task 3.3.3: Build conflict review UI for ambiguous cases

---

## Phase 4 — AI Scale & DevOps

**Goal:** Improve extraction accuracy, productionize AI feedback loops, and automate deployment.

**Duration:** Weeks 13–16  
**Total PBIs:** 3  
**Estimated effort:** ~28 SP

### PBI 4.1 — AI Training & Extraction Pipeline

**Goal:** Use accumulated receipt data to improve extraction accuracy and route low-confidence results to review.

**Est. 2 weeks | ~13 SP**

#### Module: AI
- [ ] Task 4.1.1: Build feedback loop for corrected extraction results
- [ ] Task 4.1.2: Store training samples with ground-truth labels
- [ ] Task 4.1.3: Evaluate Openrouter models and prompt strategies for receipt/slip extraction
- [ ] Task 4.1.4: Add confidence scores and low-confidence review queue

#### Module: Receipt / Bank Slip
- [ ] Task 4.1.5: Route low-confidence extractions to manual review screen

---

### PBI 4.2 — Dockerized Local Development

**Goal:** Provide a reproducible local environment for new contributors.

**Est. 1 week | ~6 SP**

#### Module: DevOps
- [ ] Task 4.2.1: Add `Dockerfile` for the Next.js app
- [ ] Task 4.2.2: Add `docker-compose.yml` with Postgres and local Supabase-like services
- [ ] Task 4.2.3: Update `docs/project/setup.md` with Docker instructions

---

### PBI 4.3 — CI/CD & Deployment Automation

**Goal:** Automate lint/typecheck, tests, builds, migrations, and deployments.

**Est. 1.5 weeks | ~9 SP**

#### Module: DevOps
- [ ] Task 4.3.1: Add GitHub Actions workflow for lint, typecheck, and tests
- [ ] Task 4.3.2: Add GitHub Actions workflow for build and production deploy
- [ ] Task 4.3.3: Add preview deployments for pull requests
- [ ] Task 4.3.4: Add a controlled database migration job in CI/CD

#### Module: Testing
- [ ] Task 4.3.5: Add critical-path E2E tests (auth, expense CRUD, receipt/slip upload)

---

## Cross-Cutting Concerns

These items should be revisited in every phase rather than deferred to the end:

- **Security:** keep storage private, validate all AI output, never log sensitive payloads
- **Auth boundary:** always resolve the current user server-side before database mutations
- **Documentation drift:** update `database/SCHEMA.md`, `database/DB_DESIGN.md`, and `docs/project/overview.md` whenever runtime behavior changes
- **Mobile-first:** verify every new screen on a narrow viewport before marking a PBI done

---

## Related Documents

- `overview.md`
- `setup.md`
- `../migrations/roadmap.md`
- `../../specs/requirements.md`
- `../../database/SCHEMA.md`
- `../../database/DB_DESIGN.md`
