import { and, desc, eq, gte, lte, type SQL } from "drizzle-orm";
import { db } from "@/lib/db";
import { expenses, type Expense, type User } from "@/database/schema";
import type {
    ExpenseCreateBody,
    ExpenseListQuery,
    ExpenseUpdateBody,
} from "@/lib/validations/api";

/**
 * Expenses service.
 *
 * Plain async functions over Drizzle. All ownership filtering is applied
 * here so handlers never construct raw where-clauses against the
 * authenticated user.
 */

export interface ListExpensesOptions {
    category?: ExpenseListQuery["category"] | undefined;
    from?: string | undefined;
    to?: string | undefined;
    limit?: number | undefined;
    offset?: number | undefined;
}

export async function listExpenses(
    user: User,
    options: ListExpensesOptions = {}
): Promise<Expense[]> {
    const conditions: SQL[] = [eq(expenses.userId, user.id)];

    if (options.category) {
        conditions.push(eq(expenses.category, options.category));
    }
    if (options.from) {
        conditions.push(gte(expenses.expenseDate, new Date(options.from)));
    }
    if (options.to) {
        conditions.push(lte(expenses.expenseDate, new Date(options.to)));
    }

    return db
        .select()
        .from(expenses)
        .where(and(...conditions))
        .orderBy(desc(expenses.expenseDate))
        .limit(options.limit ?? 50)
        .offset(options.offset ?? 0);
}

export async function createExpense(
    user: User,
    body: ExpenseCreateBody
): Promise<Expense> {
    const [created] = await db
        .insert(expenses)
        .values({
            userId: user.id,
            amount: body.amount,
            category: body.category,
            description: body.description ?? null,
            expenseDate: new Date(body.expenseDate),
        })
        .returning();

    if (!created) {
        throw new Error("Failed to create expense");
    }
    return created;
}

export async function updateExpense(
    user: User,
    id: string,
    body: ExpenseUpdateBody
): Promise<Expense | null> {
    const [updated] = await db
        .update(expenses)
        .set({
            amount: body.amount,
            category: body.category,
            description: body.description ?? null,
            expenseDate: new Date(body.expenseDate),
            updatedAt: new Date(),
        })
        .where(and(eq(expenses.id, id), eq(expenses.userId, user.id)))
        .returning();

    return updated ?? null;
}

export async function deleteExpense(
    user: User,
    id: string
): Promise<boolean> {
    const [deleted] = await db
        .delete(expenses)
        .where(and(eq(expenses.id, id), eq(expenses.userId, user.id)))
        .returning();

    return Boolean(deleted);
}
