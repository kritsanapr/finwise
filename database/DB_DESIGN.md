# Finwise Database Design

เอกสารนี้สรุป **ฐานข้อมูลที่ควรใช้สำหรับ MVP ตอนนี้** และ **แนวทางเผื่อ scale / AI integration ใน phase ถัดไป** โดยแยกออกจาก `database/schema.ts` ที่เป็น current runtime schema ของโปรเจกต์

## เป้าหมาย MVP

MVP ตอนนี้ควรรองรับ 4 เรื่องก่อน:

1. บันทึกรายจ่าย
2. จัดหมวดหมู่รายจ่าย
3. สรุปว่าเงินออกไปกับอะไรบ้าง
4. เปิดทางให้ต่อ AI scan receipt / slip ใน phase ถัดไปโดยไม่ต้องรื้อ schema หลัก

## หลักคิดในการออกแบบ

- เก็บ `expense` เป็นแกนกลางของระบบ
- แยก `category` ออกเป็นตาราง ไม่ hardcode เป็น text ยาว ๆ ตลอดไป
- summary ระดับ dashboard ใน MVP ควร query จาก transaction จริงก่อน
- ถ้าปริมาณข้อมูลโต ค่อยเพิ่ม aggregate table หรือ materialized view
- เรื่อง AI ให้แยกเป็น document/extraction concern ไม่ปนกับ transaction หลักเกินไป

## ปัญหาของ schema ปัจจุบัน

schema ตอนนี้ใช้งานได้ระดับหนึ่ง แต่มีข้อจำกัดสำหรับการโตต่อ:

- `expenses.category` เป็น `text` ทำให้ควบคุม taxonomy ยาก
- `receipts` และ `bank_slips` ซ้ำกันด้าน file metadata
- `users.line_user_id` ยังเป็นชื่อที่ผูกกับ LINE มากเกินไป ทั้งที่ runtime ตอนนี้ใช้ Supabase auth
- ยังไม่มี index strategy ที่ชัดสำหรับ query summary
- summary ยัง group by raw text category ตรง ๆ ถ้าชื่อ category เปลี่ยนจะกระทบย้อนหลัง

## แบบที่แนะนำสำหรับ MVP

ตารางที่ควรมีจริงใน MVP:

1. `users`
2. `expense_categories`
3. `expenses`
4. `expense_documents` (optional แต่แนะนำให้เตรียมไว้ตั้งแต่ตอนนี้)

### 1. users

ใช้สำหรับเจ้าของข้อมูลรายจ่าย

| column | type | note |
|---|---|---|
| `id` | uuid pk | internal user id |
| `auth_provider` | text | `supabase`, `line`, `google` |
| `auth_subject` | text | id จาก provider |
| `display_name` | text | ชื่อผู้ใช้ |
| `picture_url` | text nullable | รูปโปรไฟล์ |
| `default_currency_code` | char(3) | เช่น `THB` |
| `created_at` | timestamp | |
| `updated_at` | timestamp | |

**constraint ที่สำคัญ**

- unique (`auth_provider`, `auth_subject`)

เหตุผล:

- ตอนนี้ใช้ Supabase auth
- อนาคตถ้าจะเพิ่ม LINE Login จะไม่ต้องย้าย schema ใหญ่

### 2. expense_categories

ห้ามให้ category เป็นแค่ text ลอย ๆ ถ้าจะทำ reporting จริงจัง

| column | type | note |
|---|---|---|
| `id` | uuid pk | |
| `code` | text unique | เช่น `food`, `transport`, `utilities_water` |
| `name_th` | text | ชื่อไทย |
| `name_en` | text nullable | ชื่ออังกฤษ |
| `icon` | text nullable | emoji หรือ icon key |
| `color` | text nullable | ใช้กับ chart |
| `parent_id` | uuid nullable fk self | รองรับ nested category |
| `kind` | text | `system` / `custom` |
| `owner_user_id` | uuid nullable | ถ้าเป็น custom category ของ user |
| `sort_order` | integer | |
| `is_active` | boolean | |
| `created_at` | timestamp | |
| `updated_at` | timestamp | |

**constraint ที่สำคัญ**

- system category: `owner_user_id` เป็น null
- custom category: (`owner_user_id`, `code`) ควร unique

หมวดหมู่ตั้งต้นสำหรับ MVP:

- `food`
- `transport`
- `housing`
- `utilities_water`
- `utilities_electricity`
- `phone_internet`
- `shopping`
- `healthcare`
- `education`
- `entertainment`
- `transfer`
- `other`

เหตุผล:

- reporting จะนิ่งกว่า text freeform
- เปลี่ยน label หรือสีได้โดยไม่กระทบ transaction ย้อนหลัง
- รองรับ subcategory ได้ในอนาคต

### 3. expenses

นี่คือตาราง transaction หลัก

| column | type | note |
|---|---|---|
| `id` | uuid pk | |
| `user_id` | uuid fk | เจ้าของรายการ |
| `category_id` | uuid fk | อ้างอิง `expense_categories.id` |
| `amount_minor` | bigint | เก็บเป็น satang/stang แทน decimal |
| `currency_code` | char(3) | MVP ใช้ `THB` เป็นหลัก |
| `description` | text nullable | note ของ user |
| `merchant_name` | text nullable | ร้าน/ปลายทาง |
| `source_type` | text | `manual`, `receipt_scan`, `bank_slip`, `import`, `chat` |
| `status` | text | `draft`, `confirmed`, `archived` |
| `occurred_at` | timestamp | วันที่ใช้เงินจริง |
| `recorded_at` | timestamp | วันที่บันทึกเข้าระบบ |
| `document_id` | uuid nullable fk | link ไปเอกสารต้นทาง |
| `ai_confidence` | numeric nullable | เผื่อ phase AI |
| `metadata_json` | jsonb nullable | ข้อมูลเฉพาะกรณี |
| `created_at` | timestamp | |
| `updated_at` | timestamp | |

**เหตุผลที่แนะนำ `amount_minor`**

- สรุปยอดเร็วและปลอดภัยกว่า decimal string
- ลดปัญหา precision
- เหมาะกับงาน aggregate และ analytics

ถ้าต้องการแสดง `123.45` ค่อยแปลงที่ application layer

### 4. expense_documents

MVP จะยังไม่ต้องใช้เต็มระบบก็ได้ แต่ควรเผื่อ table นี้ไว้เพื่อไม่ให้ receipt/slip แตก schema คนละแบบ

| column | type | note |
|---|---|---|
| `id` | uuid pk | |
| `user_id` | uuid fk | |
| `document_type` | text | `receipt`, `bank_slip`, `invoice`, `attachment` |
| `storage_bucket` | text | |
| `storage_path` | text | |
| `file_name` | text nullable | |
| `mime_type` | text nullable | |
| `file_size_bytes` | integer nullable | |
| `checksum` | text nullable | dedupe ได้ในอนาคต |
| `upload_status` | text | `pending`, `uploaded`, `failed` |
| `visibility` | text | `private`, `signed` |
| `created_at` | timestamp | |
| `updated_at` | timestamp | |

เหตุผล:

- รองรับ receipt และ slip ด้วย table เดียว
- ลดการซ้ำของ metadata
- phase AI จะต่อ extraction job ได้ง่าย

## ความสัมพันธ์หลัก

```text
users
  ├─< expense_categories (custom categories)
  ├─< expenses
  └─< expense_documents

expense_categories
  └─< expenses

expense_documents
  └─< expenses
```

## Summary / Portfolio ที่ MVP ต้องตอบได้

คำว่า portfolio ในที่นี้ สำหรับ MVP ควรหมายถึง “ภาพรวมรายจ่าย” ไม่ใช่ investment portfolio

สิ่งที่ต้อง query ได้ทันที:

1. ยอดใช้จ่ายรวมรายวัน / รายสัปดาห์ / รายเดือน
2. ยอดใช้จ่ายแยกตามหมวดหมู่
3. top spending categories
4. trend ย้อนหลัง 6-12 เดือน
5. สัดส่วนการใช้จ่าย เช่น food 35%, transport 20%

query pattern หลัก:

- `sum(amount_minor)` by `user_id` + date range
- `sum(amount_minor)` group by `category_id`
- monthly trend group by `date_trunc('month', occurred_at)`

## Index ที่ควรมีตั้งแต่ MVP

บน `expenses`

- index (`user_id`, `occurred_at` desc)
- index (`user_id`, `category_id`, `occurred_at` desc)
- index (`document_id`)

บน `expense_categories`

- unique (`code`) สำหรับ system categories
- unique (`owner_user_id`, `code`) สำหรับ custom categories

บน `expense_documents`

- index (`user_id`, `document_type`, `created_at` desc)
- unique (`storage_bucket`, `storage_path`)

## สิ่งที่ “ยังไม่ต้อง” ทำใน MVP

- budget table
- recurring expense scheduler
- merchant normalization table
- split transaction หลายหมวดใน 1 รายการ
- aggregate table รายวัน/รายเดือน
- AI job queue

ทั้งหมดนี้ยังไม่จำเป็นถ้าปริมาณข้อมูลยังเล็ก

## Phase 2: สิ่งที่ควรเพิ่มเมื่อเริ่มต่อ AI

เมื่อต้องการ scan receipt / slip จริงจัง แนะนำเพิ่ม:

1. `document_extraction_jobs`
2. `document_extraction_results`
3. optional `merchants`

### document_extraction_jobs

| column | type | note |
|---|---|---|
| `id` | uuid pk | |
| `document_id` | uuid fk | |
| `model_provider` | text | `openrouter`, `openai`, `gemini` |
| `model_name` | text | |
| `job_status` | text | `queued`, `processing`, `completed`, `failed` |
| `attempt_count` | integer | |
| `requested_at` | timestamp | |
| `completed_at` | timestamp nullable | |
| `error_message` | text nullable | |

### document_extraction_results

| column | type | note |
|---|---|---|
| `id` | uuid pk | |
| `job_id` | uuid fk | |
| `document_id` | uuid fk | |
| `expense_id` | uuid nullable fk | ถ้าสร้าง expense แล้ว |
| `raw_output_json` | jsonb | response ดิบจาก model |
| `normalized_output_json` | jsonb | หลัง map แล้ว |
| `confidence_score` | numeric nullable | |
| `is_user_confirmed` | boolean | ให้ user review |
| `created_at` | timestamp | |

เหตุผล:

- แยก raw AI output ออกจาก transaction จริง
- audit ได้ว่า model อ่านอะไรมา
- rerun extraction ได้โดยไม่แตะ expense เดิม

## Phase 3: เมื่อข้อมูลโตและ query หนักขึ้น

ถ้าผู้ใช้เยอะขึ้นหรือ transaction เยอะขึ้น ให้เพิ่ม:

1. `expense_daily_aggregates`
2. `expense_monthly_aggregates`
3. materialized view สำหรับ dashboard

### expense_monthly_aggregates

| column | type | note |
|---|---|---|
| `user_id` | uuid | |
| `year_month` | date | เดือนอ้างอิง |
| `category_id` | uuid | |
| `total_amount_minor` | bigint | |
| `expense_count` | integer | |
| `updated_at` | timestamp | |

primary key:

- (`user_id`, `year_month`, `category_id`)

ใช้เมื่อ:

- dashboard เริ่มช้า
- ต้อง render analytics บ่อย
- มี export/reporting หนัก

## Recommendation สรุป

ถ้าจะทำให้ “ถูกทิศ” ตอนนี้โดยไม่ over-engineer:

### ทำตอนนี้เลย

1. ใช้ `expenses` เป็น transaction table หลัก
2. แยก `expense_categories` ออกมา
3. เปลี่ยนแนวคิด category จาก raw text เป็น foreign key
4. เพิ่ม `source_type`, `status`, `merchant_name`, `currency_code`
5. ออกแบบ file ให้ไปทาง `expense_documents`
6. ทำ index สำหรับ summary query ตั้งแต่แรก

### ทำทีหลัง

1. extraction jobs/results
2. aggregate tables
3. merchant normalization
4. budget / recurring / split expense

## Proposed MVP ERD

```text
users
  id PK
  auth_provider
  auth_subject

expense_categories
  id PK
  code
  parent_id FK -> expense_categories.id
  owner_user_id FK -> users.id

expense_documents
  id PK
  user_id FK -> users.id
  document_type
  storage_bucket
  storage_path

expenses
  id PK
  user_id FK -> users.id
  category_id FK -> expense_categories.id
  document_id FK -> expense_documents.id NULL
  amount_minor
  currency_code
  source_type
  occurred_at
```

## คำแนะนำสำหรับ repo นี้โดยตรง

ถ้าจะ refactor schema ในโปรเจกต์นี้จริง ควรทำเป็นลำดับ:

1. เพิ่ม `expense_categories` table
2. seed system categories
3. เพิ่ม `category_id` ใน `expenses`
4. backfill จาก `expenses.category`
5. ปรับ query dashboard ให้ group by `category_id`
6. ค่อยลบ `expenses.category` เดิมภายหลัง
7. phase ถัดไปค่อยรวม `receipts` และ `bank_slips` ไปสู่ `expense_documents`

วิธีนี้ปลอดภัยกว่า rewrite ทีเดียวทั้งระบบ
