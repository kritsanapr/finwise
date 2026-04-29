import { Elysia, t } from "elysia";
import { db } from "@/lib/db";
import { expenses, receipts, bankSlips, users, type User } from "@/database/schema";
import { eq, desc, and, gte, lte, sql, sum } from "drizzle-orm";
import { createClient } from "@/lib/supabase/server";
import { uploadToSupabaseStorage, generateStoragePath } from "@/lib/services/upload";
import { extractReceipt, extractBankSlip } from "@/lib/services/ai-extract";

// ─── Auth Helper ──────────────────────────────────────────────────────────────

async function getAuthUser() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    return user;
}

/**
 * Ensure a user record exists in our custom users table.
 * Creates one on first login (using auth UUID as lineUserId placeholder).
 */
async function getOrCreateDbUser(authUserId: string, email?: string | null): Promise<User> {
    const existing = await db
        .select()
        .from(users)
        .where(eq(users.lineUserId, authUserId))
        .limit(1);

    if (existing.length > 0) return existing[0]!;

    const [created] = await db
        .insert(users)
        .values({
            lineUserId: authUserId,
            displayName: email?.split("@")[0] ?? "User",
        })
        .returning();

    return created!;
}

// ─── App ──────────────────────────────────────────────────────────────────────

export const app = new Elysia({ prefix: "/api" })

    // ── Health ──────────────────────────────────────────────────────────────────
    .get("/health", () => ({ status: "ok" }))

    // ── Expenses ────────────────────────────────────────────────────────────────
    .get(
        "/expenses",
        async ({ query, set }) => {
            const authUser = await getAuthUser();
            if (!authUser) {
                set.status = 401;
                return { error: "Unauthorized" };
            }
            const dbUser = await getOrCreateDbUser(authUser.id, authUser.email);

            const conditions = [eq(expenses.userId, dbUser.id)];

            if (query.category) {
                conditions.push(eq(expenses.category, query.category));
            }
            if (query.from) {
                conditions.push(gte(expenses.expenseDate, new Date(query.from)));
            }
            if (query.to) {
                conditions.push(lte(expenses.expenseDate, new Date(query.to)));
            }

            const rows = await db
                .select()
                .from(expenses)
                .where(and(...conditions))
                .orderBy(desc(expenses.expenseDate))
                .limit(Number(query.limit ?? 50))
                .offset(Number(query.offset ?? 0));

            return rows;
        },
        {
            query: t.Object({
                category: t.Optional(t.String()),
                from: t.Optional(t.String()),
                to: t.Optional(t.String()),
                limit: t.Optional(t.String()),
                offset: t.Optional(t.String()),
            }),
        }
    )

    .post(
        "/expenses",
        async ({ body, set }) => {
            const authUser = await getAuthUser();
            if (!authUser) {
                set.status = 401;
                return { error: "Unauthorized" };
            }
            const dbUser = await getOrCreateDbUser(authUser.id, authUser.email);

            const [created] = await db
                .insert(expenses)
                .values({
                    userId: dbUser.id,
                    amount: body.amount,
                    category: body.category,
                    description: body.description ?? null,
                    expenseDate: new Date(body.expenseDate),
                })
                .returning();

            set.status = 201;
            return created;
        },
        {
            body: t.Object({
                amount: t.String(),
                category: t.String(),
                description: t.Optional(t.String()),
                expenseDate: t.String(),
            }),
        }
    )

    .put(
        "/expenses/:id",
        async ({ params, body, set }) => {
            const authUser = await getAuthUser();
            if (!authUser) {
                set.status = 401;
                return { error: "Unauthorized" };
            }
            const dbUser = await getOrCreateDbUser(authUser.id, authUser.email);

            const [updated] = await db
                .update(expenses)
                .set({
                    amount: body.amount,
                    category: body.category,
                    description: body.description ?? null,
                    expenseDate: new Date(body.expenseDate),
                    updatedAt: new Date(),
                })
                .where(
                    and(eq(expenses.id, params.id), eq(expenses.userId, dbUser.id))
                )
                .returning();

            if (!updated) {
                set.status = 404;
                return { error: "Expense not found" };
            }

            return updated;
        },
        {
            body: t.Object({
                amount: t.String(),
                category: t.String(),
                description: t.Optional(t.String()),
                expenseDate: t.String(),
            }),
        }
    )

    .delete("/expenses/:id", async ({ params, set }) => {
        const authUser = await getAuthUser();
        if (!authUser) {
            set.status = 401;
            return { error: "Unauthorized" };
        }
        const dbUser = await getOrCreateDbUser(authUser.id, authUser.email);

        const [deleted] = await db
            .delete(expenses)
            .where(
                and(eq(expenses.id, params.id), eq(expenses.userId, dbUser.id))
            )
            .returning();

        if (!deleted) {
            set.status = 404;
            return { error: "Expense not found" };
        }

        return { success: true };
    })

    // ── Dashboard Stats ──────────────────────────────────────────────────────────
    .get("/dashboard/stats", async ({ query, set }) => {
        const authUser = await getAuthUser();
        if (!authUser) {
            set.status = 401;
            return { error: "Unauthorized" };
        }
        const dbUser = await getOrCreateDbUser(authUser.id, authUser.email);

        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        startOfWeek.setHours(0, 0, 0, 0);

        const period = query.period ?? "month";
        let periodStart: Date;
        let periodEnd = now;

        if (period === "week") {
            periodStart = startOfWeek;
        } else if (period === "year") {
            periodStart = new Date(now.getFullYear(), 0, 1);
        } else {
            periodStart = startOfMonth;
        }

        // Total for the selected period
        const [periodTotals] = await db
            .select({ total: sum(expenses.amount) })
            .from(expenses)
            .where(
                and(
                    eq(expenses.userId, dbUser.id),
                    gte(expenses.expenseDate, periodStart),
                    lte(expenses.expenseDate, periodEnd)
                )
            );

        // By category for the period
        const categoryTotals = await db
            .select({
                category: expenses.category,
                total: sum(expenses.amount),
            })
            .from(expenses)
            .where(
                and(
                    eq(expenses.userId, dbUser.id),
                    gte(expenses.expenseDate, periodStart),
                    lte(expenses.expenseDate, periodEnd)
                )
            )
            .groupBy(expenses.category);

        // Count for the period
        const [countResult] = await db
            .select({ count: sql<number>`count(*)::int` })
            .from(expenses)
            .where(
                and(
                    eq(expenses.userId, dbUser.id),
                    gte(expenses.expenseDate, periodStart),
                    lte(expenses.expenseDate, periodEnd)
                )
            );

        // Monthly trend — current year, sum by month
        const monthlyTrend = await db
            .select({
                month: sql<number>`extract(month from ${expenses.expenseDate})::int`,
                total: sum(expenses.amount),
            })
            .from(expenses)
            .where(
                and(
                    eq(expenses.userId, dbUser.id),
                    gte(expenses.expenseDate, new Date(now.getFullYear(), 0, 1))
                )
            )
            .groupBy(sql`extract(month from ${expenses.expenseDate})`);

        // Weekly trend — last 7 days, sum by day
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - 6);
        weekStart.setHours(0, 0, 0, 0);

        const weeklyTrend = await db
            .select({
                day: sql<string>`to_char(${expenses.expenseDate}, 'YYYY-MM-DD')`,
                total: sum(expenses.amount),
            })
            .from(expenses)
            .where(
                and(
                    eq(expenses.userId, dbUser.id),
                    gte(expenses.expenseDate, weekStart)
                )
            )
            .groupBy(sql`to_char(${expenses.expenseDate}, 'YYYY-MM-DD')`);

        return {
            periodTotal: periodTotals!.total ?? "0",
            transactionCount: countResult!.count ?? 0,
            categoryTotals,
            monthlyTrend,
            weeklyTrend,
        };
    },
        {
            query: t.Object({
                period: t.Optional(t.Union([t.Literal("week"), t.Literal("month"), t.Literal("year")])),
            }),
        })

    // ── Receipts Upload ──────────────────────────────────────────────────────────
    .post(
        "/receipts/upload",
        async ({ body, set }) => {
            const authUser = await getAuthUser();
            if (!authUser) {
                set.status = 401;
                return { error: "Unauthorized" };
            }
            const dbUser = await getOrCreateDbUser(authUser.id, authUser.email);

            const file = body.file as File;
            const storagePath = generateStoragePath(dbUser.id, file.name);

            const { publicUrl } = await uploadToSupabaseStorage(
                file,
                "receipts",
                storagePath
            );

            // AI extraction
            const extracted = await extractReceipt(publicUrl);

            // Save to DB
            const [receipt] = await db
                .insert(receipts)
                .values({
                    userId: dbUser.id,
                    storagePath,
                    fileName: file.name,
                    mimeType: file.type,
                    fileSize: file.size,
                    extractedMerchant: extracted.merchant,
                    extractedDate: extracted.date ? new Date(extracted.date) : null,
                    extractedAmount: extracted.amount,
                    extractedItems: extracted.items,
                    aiModel: "google/gemini-2.0-flash-lite",
                })
                .returning();

            set.status = 201;
            return { receipt, extracted, publicUrl };
        },
        {
            body: t.Object({
                file: t.File({ type: ["image/jpeg", "image/png", "image/webp"] }),
            }),
        }
    )

    // ── Bank Slips Upload ────────────────────────────────────────────────────────
    .post(
        "/slips/upload",
        async ({ body, set }) => {
            const authUser = await getAuthUser();
            if (!authUser) {
                set.status = 401;
                return { error: "Unauthorized" };
            }
            const dbUser = await getOrCreateDbUser(authUser.id, authUser.email);

            const file = body.file as File;
            const storagePath = generateStoragePath(dbUser.id, file.name);

            const { publicUrl } = await uploadToSupabaseStorage(
                file,
                "bank-slips",
                storagePath
            );

            // AI extraction
            const extracted = await extractBankSlip(publicUrl);

            // Save to DB
            const [slip] = await db
                .insert(bankSlips)
                .values({
                    userId: dbUser.id,
                    storagePath,
                    publicUrl,
                    fileName: file.name,
                    mimeType: file.type,
                    fileSize: file.size,
                    uploadStatus: "uploaded",
                    bankName: extracted.bankName,
                    transferRef: extracted.transferRef,
                    senderAccount: extracted.senderAccount,
                    receiverAccount: extracted.receiverAccount,
                    receiverName: extracted.receiverName,
                    transferAmount: extracted.transferAmount,
                    transferDate: extracted.transferDate
                        ? new Date(extracted.transferDate)
                        : null,
                    aiModel: "google/gemini-2.0-flash-lite",
                })
                .returning();

            set.status = 201;
            return { slip, extracted, publicUrl };
        },
        {
            body: t.Object({
                file: t.File({ type: ["image/jpeg", "image/png", "image/webp"] }),
            }),
        }
    );

export type App = typeof app;

const handle = app.compile().fetch;
export const GET = handle;
export const POST = handle;
export const PUT = handle;
export const DELETE = handle;
export const PATCH = handle;
