/**
 * lib/db/seed.ts
 *
 * Development seed script for FinWise.
 *
 * Inserts a predictable set of test data so developers can start the app
 * with meaningful content without manual data entry.
 *
 * SAFETY GUARDS:
 *   - Refuses to run in production (NODE_ENV check)
 *   - All inserts run inside a single transaction — either all succeed or none do
 *   - Uses `onConflictDoNothing()` so re-running is safe (idempotent)
 *
 * USAGE:
 *   npm run db:seed
 *
 * TO ADD MORE SEED DATA:
 *   Add inserts inside the `db.transaction(async (tx) => { ... })` block below.
 *   Always use `tx.*` inside a transaction, not the top-level `db.*`.
 */

import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { users, expenses, bankSlips } from "@/database/schema";

// ─── Guard: Production check ──────────────────────────────────────────────────

if (process.env.NODE_ENV === "production") {
    console.error("[seed] ❌ Refusing to seed in production. Set NODE_ENV=development.");
    process.exit(1);
}

// ─── Connection ───────────────────────────────────────────────────────────────

const connectionString = process.env.DATABASE_DIRECT_URL ?? process.env.DATABASE_URL;

if (!connectionString) {
    console.error("[seed] ❌ DATABASE_URL or DATABASE_DIRECT_URL is not set.");
    process.exit(1);
}

const client = postgres(connectionString, { max: 1, prepare: false });
const db = drizzle(client);

// ─── Seed Data ────────────────────────────────────────────────────────────────

/** Static UUIDs so re-running the seed always produces the same IDs */
const SEED_USER_ID = "00000000-0000-0000-0000-000000000001";
const SEED_EXPENSE_IDS = [
    "00000000-0000-0000-0000-000000000010",
    "00000000-0000-0000-0000-000000000011",
    "00000000-0000-0000-0000-000000000012",
    "00000000-0000-0000-0000-000000000013",
    "00000000-0000-0000-0000-000000000014",
] as const;

async function seed(): Promise<void> {
    const startedAt = Date.now();
    console.log(`[seed] 🌱 Starting seed — ${new Date().toISOString()}`);

    await db.transaction(async (tx) => {
        // ── 1. Dev user (LINE account placeholder) ──────────────────────────────
        await tx
            .insert(users)
            .values({
                id: SEED_USER_ID,
                lineUserId: "Udev000000000000000000000000001",
                displayName: "Dev User",
                pictureUrl: null,
            })
            .onConflictDoNothing();
        console.log("[seed]   ✓ users");

        // ── 2. Expense records across different categories ──────────────────────
        await tx
            .insert(expenses)
            .values([
                {
                    id: SEED_EXPENSE_IDS[0],
                    userId: SEED_USER_ID,
                    amount: "850.00",
                    category: "electricity",
                    description: "ค่าไฟเดือนเมษายน",
                    expenseDate: new Date("2026-04-01T09:00:00Z"),
                },
                {
                    id: SEED_EXPENSE_IDS[1],
                    userId: SEED_USER_ID,
                    amount: "320.00",
                    category: "water",
                    description: "ค่าน้ำเดือนเมษายน",
                    expenseDate: new Date("2026-04-03T09:00:00Z"),
                },
                {
                    id: SEED_EXPENSE_IDS[2],
                    userId: SEED_USER_ID,
                    amount: "599.00",
                    category: "phone",
                    description: "ค่าโทรศัพท์ True Move",
                    expenseDate: new Date("2026-04-05T09:00:00Z"),
                },
                {
                    id: SEED_EXPENSE_IDS[3],
                    userId: SEED_USER_ID,
                    amount: "245.00",
                    category: "food",
                    description: "อาหารกลางวัน",
                    expenseDate: new Date("2026-04-10T12:00:00Z"),
                },
                {
                    id: SEED_EXPENSE_IDS[4],
                    userId: SEED_USER_ID,
                    amount: "1500.00",
                    category: "transfer",
                    description: "โอนค่าห้องเดือนเมษายน",
                    expenseDate: new Date("2026-04-01T08:00:00Z"),
                },
            ])
            .onConflictDoNothing();
        console.log("[seed]   ✓ expenses");

        // ── 3. Bank slip linked to the transfer expense ──────────────────────────
        await tx
            .insert(bankSlips)
            .values({
                id: "00000000-0000-0000-0000-000000000020",
                userId: SEED_USER_ID,
                expenseId: SEED_EXPENSE_IDS[4],
                bucketName: "bank-slips",
                // Placeholder path — replace with a real Supabase Storage path
                storagePath: `${SEED_USER_ID}/2026/04/00000000-0000-0000-0000-000000000020.jpg`,
                publicUrl: null,
                fileName: "slip_april_rent.jpg",
                mimeType: "image/jpeg",
                fileSize: 102400, // 100 KB placeholder
                uploadStatus: "uploaded",
                bankName: "KBank",
                transferRef: "REF26040100001",
                senderAccount: "***-4-56789-0",
                receiverAccount: "***-1-23456-7",
                receiverName: "นายสมชาย ใจดี",
                transferAmount: "1500.00",
                transferDate: new Date("2026-04-01T08:00:00Z"),
                isVerified: false,
            })
            .onConflictDoNothing();
        console.log("[seed]   ✓ bank_slips");
    });

    const elapsed = Date.now() - startedAt;
    console.log(`[seed] ✅ Seed complete in ${elapsed}ms`);
}

// ─── Run ──────────────────────────────────────────────────────────────────────

seed()
    .catch((err) => {
        console.error("[seed] ❌ Seed failed:", err);
        process.exit(1);
    })
    .finally(async () => {
        await client.end();
        console.log("[seed] 🔌 Connection closed");
    });
