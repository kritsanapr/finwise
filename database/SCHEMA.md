# Database Schema — FinWise

> **Stack:** PostgreSQL (Supabase) · Drizzle ORM · Supabase File Storage  
> **File:** `database/schema.ts`

---

## Table of Contents

1. [Overview — Entity Relationships](#1-overview--entity-relationships)
2. [Table: `users`](#2-table-users)
3. [Table: `expenses`](#3-table-expenses)
4. [Table: `receipts`](#4-table-receipts)
5. [Table: `bank_slips`](#5-table-bank_slips-สลิปธนาคาร)
6. [Supabase File Storage — Bucket Layout](#6-supabase-file-storage--bucket-layout)
7. [Category Reference](#7-category-reference)
8. [Upload Status Reference](#8-upload-status-reference)

---

## 1. Overview — Entity Relationships

```
users (LINE account)
  │
  ├──< expenses          One user → many expenses
  │        │
  │        ├── receipts  One expense → one receipt (store receipt / ใบเสร็จ)
  │        └── bank_slips One expense → one bank slip (สลิปธนาคาร)
  │
  ├──< receipts          One user → many receipts (regardless of expense linkage)
  └──< bank_slips        One user → many bank slips (regardless of expense linkage)
```

```
┌──────────┐       ┌──────────────┐       ┌──────────────────┐
│  users   │──────<│   expenses   │>──────│    receipts      │
└──────────┘       └──────────────┘       └──────────────────┘
      │                   │
      │                   │               ┌──────────────────┐
      └───────────────────>───────────────│   bank_slips     │
                                          └──────────────────┘
```

---

## 2. Table: `users`

> Stores LINE user accounts. Created automatically on first login via LINE OAuth.

| Column | Type | Nullable | Default | Description |
|---|---|---|---|---|
| `id` | UUID | ❌ | `gen_random_uuid()` | Primary key |
| `line_user_id` | TEXT | ❌ | — | LINE user ID (unique) — used for auth |
| `display_name` | TEXT | ✅ | — | Display name from LINE profile |
| `picture_url` | TEXT | ✅ | — | Profile picture URL from LINE |
| `created_at` | TIMESTAMP | ❌ | `now()` | Record creation time |
| `updated_at` | TIMESTAMP | ❌ | `now()` | Last update time |

**Constraints**
- `line_user_id` is `UNIQUE` — one LINE account = one FinWise account
- Deleting a user **cascades** to all their `expenses`, `receipts`, and `bank_slips`

---

## 3. Table: `expenses`

> The core record of every expense entry, whether logged manually, via LINE chat, or from a receipt/slip scan.

| Column | Type | Nullable | Default | Description |
|---|---|---|---|---|
| `id` | UUID | ❌ | `gen_random_uuid()` | Primary key |
| `user_id` | UUID | ❌ | — | → `users.id` (FK) |
| `amount` | DECIMAL(10,2) | ❌ | — | Amount in Thai Baht (฿) |
| `category` | TEXT | ❌ | — | Expense category — see [Category Reference](#7-category-reference) |
| `description` | TEXT | ✅ | — | Free-text note about the expense |
| `expense_date` | TIMESTAMP | ❌ | — | When the expense occurred |
| `receipt_id` | UUID | ✅ | — | → `receipts.id` (FK) — linked store receipt |
| `created_at` | TIMESTAMP | ❌ | `now()` | Record creation time |
| `updated_at` | TIMESTAMP | ❌ | `now()` | Last update time |

**Constraints**
- `user_id` → `users.id` ON DELETE **CASCADE** — expense deleted with user
- `receipt_id` → `receipts.id` ON DELETE **SET NULL** — receipt can be deleted independently

---

## 4. Table: `receipts`

> Stores **store receipts / ใบเสร็จร้านค้า** uploaded to Supabase Storage (bucket: `receipts`).  
> AI extracts structured data from the receipt image automatically.

| Column | Type | Nullable | Default | Description |
|---|---|---|---|---|
| `id` | UUID | ❌ | `gen_random_uuid()` | Primary key |
| `user_id` | UUID | ❌ | — | → `users.id` (FK) |
| `storage_path` | TEXT | ❌ | — | Supabase Storage path — see [Bucket Layout](#6-supabase-file-storage--bucket-layout) |
| `file_name` | TEXT | ✅ | — | Original filename from the device |
| `mime_type` | TEXT | ✅ | — | `image/jpeg` · `image/png` · `image/webp` · `application/pdf` |
| `file_size` | INTEGER | ✅ | — | File size in bytes |
| `extracted_merchant` | TEXT | ✅ | — | 🤖 AI: Store / merchant name |
| `extracted_date` | TIMESTAMP | ✅ | — | 🤖 AI: Purchase date shown on receipt |
| `extracted_amount` | DECIMAL(10,2) | ✅ | — | 🤖 AI: Total amount on receipt (฿) |
| `extracted_items` | TEXT | ✅ | — | 🤖 AI: Line items as JSON string |
| `ai_model` | TEXT | ✅ | — | AI model used for OCR (e.g. `openrouter/...`) |
| `created_at` | TIMESTAMP | ❌ | `now()` | Record creation time |
| `updated_at` | TIMESTAMP | ❌ | `now()` | Last update time |

**Constraints**
- `user_id` → `users.id` ON DELETE **CASCADE**

**`extracted_items` JSON shape**
```json
[
  { "name": "กาแฟ", "qty": 1, "price": 65.00 },
  { "name": "เค้ก",  "qty": 2, "price": 120.00 }
]
```

---

## 5. Table: `bank_slips` (สลิปธนาคาร)

> Stores **Thai bank transfer slips / สลิปโอนเงิน** uploaded to Supabase Storage (bucket: `bank-slips`).  
> Tracks both the raw file in Supabase Storage and the AI-extracted transfer details.

| Column | Type | Nullable | Default | Description |
|---|---|---|---|---|
| `id` | UUID | ❌ | `gen_random_uuid()` | Primary key |
| `user_id` | UUID | ❌ | — | → `users.id` (FK) |
| `expense_id` | UUID | ✅ | — | → `expenses.id` (FK) — linked expense entry |
| **— Supabase Storage —** | | | | |
| `bucket_name` | TEXT | ❌ | `'bank-slips'` | Supabase Storage bucket name |
| `storage_path` | TEXT | ❌ | — | Full path inside the bucket — see [Bucket Layout](#6-supabase-file-storage--bucket-layout) |
| `public_url` | TEXT | ✅ | — | Supabase public or signed URL for display |
| `file_name` | TEXT | ✅ | — | Original filename from the device |
| `mime_type` | TEXT | ✅ | — | `image/jpeg` · `image/png` · `image/webp` |
| `file_size` | INTEGER | ✅ | — | File size in bytes |
| `upload_status` | TEXT | ❌ | `'pending'` | Upload lifecycle — see [Upload Status Reference](#8-upload-status-reference) |
| **— AI-extracted slip data —** | | | | |
| `bank_name` | TEXT | ✅ | — | 🤖 AI: Bank name — e.g. `SCB` `KBank` `BBL` `KTB` `TMB` |
| `transfer_ref` | TEXT | ✅ | — | 🤖 AI: Reference / transaction number on the slip |
| `sender_account` | TEXT | ✅ | — | 🤖 AI: Masked sender account — e.g. `***1234` |
| `receiver_account` | TEXT | ✅ | — | 🤖 AI: Masked receiver account |
| `receiver_name` | TEXT | ✅ | — | 🤖 AI: Receiver name as shown on slip |
| `transfer_amount` | DECIMAL(10,2) | ✅ | — | 🤖 AI: Amount transferred (฿) |
| `transfer_date` | TIMESTAMP | ✅ | — | 🤖 AI: Date/time shown on the slip |
| `is_verified` | BOOLEAN | ❌ | `false` | Manual verification flag — set `true` after user confirms |
| `ai_model` | TEXT | ✅ | — | AI model used for extraction (e.g. `openrouter/...`) |
| `created_at` | TIMESTAMP | ❌ | `now()` | Record creation time |
| `updated_at` | TIMESTAMP | ❌ | `now()` | Last update time |

**Constraints**
- `user_id` → `users.id` ON DELETE **CASCADE**
- `expense_id` → `expenses.id` ON DELETE **SET NULL** — slip survives even if expense is deleted

---

## 6. Supabase File Storage — Bucket Layout

Two separate buckets keep store receipts and bank slips isolated.

```
Supabase Storage
│
├── receipts/                        ← Bucket: store receipts / ใบเสร็จ
│   └── {userId}/
│       └── {year}/
│           └── {month}/
│               └── {receiptId}.jpg  ← e.g. receipts/abc123/2026/04/xyz789.jpg
│
└── bank-slips/                      ← Bucket: Thai bank slips / สลิปธนาคาร
    └── {userId}/
        └── {year}/
            └── {month}/
                └── {slipId}.jpg     ← e.g. bank-slips/abc123/2026/04/def456.jpg
```

**Bucket settings (recommended)**

| Setting | `receipts` | `bank-slips` |
|---|---|---|
| Access | **Private** (signed URLs) | **Private** (signed URLs) |
| Max file size | 10 MB | 5 MB |
| Allowed MIME types | `image/*`, `application/pdf` | `image/*` |
| Signed URL expiry | 1 hour | 1 hour |

> ⚠️ Never make these buckets public — they contain personal financial documents.

---

## 7. Category Reference

Values stored in `expenses.category`:

| Value | Thai Label | Description |
|---|---|---|
| `water` | ค่าน้ำ | Water bill |
| `electricity` | ค่าไฟ | Electricity bill |
| `phone` | ค่าโทรศัพท์ | Phone / internet bill |
| `food` | ค่าอาหาร | Food & beverages |
| `transport` | ค่าเดินทาง | Transportation |
| `transfer` | โอนเงิน | Bank transfer (linked to `bank_slips`) |
| `other` | อื่นๆ | Anything else |

---

## 8. Upload Status Reference

Values stored in `bank_slips.upload_status`:

| Value | Meaning |
|---|---|
| `pending` | File is queued — not yet sent to Supabase Storage |
| `uploaded` | File is successfully stored in Supabase Storage |
| `failed` | Upload failed — `storage_path` may be incomplete |
