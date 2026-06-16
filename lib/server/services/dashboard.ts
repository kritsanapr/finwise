import { and, eq, gte, lte, sql, sum } from "drizzle-orm";
import { db } from "@/lib/db";
import { expenses, type User } from "@/database/schema";

/**
 * Dashboard aggregation service.
 *
 * Period buckets are resolved in JS for the period filter; the monthly
 * and weekly trend series are computed via Postgres `extract(month ...)`
 * and `to_char(... 'YYYY-MM-DD')` respectively. The runtime schema stores
 * amounts as decimal strings, so the totals are returned as strings.
 */

export type DashboardPeriod = "week" | "month" | "year";

export interface CategoryTotal {
    category: string;
    total: string | null;
}

export interface MonthlyTrendPoint {
    month: number;
    total: string | null;
}

export interface WeeklyTrendPoint {
    day: string;
    total: string | null;
}

export interface DashboardStats {
    periodTotal: string;
    transactionCount: number;
    categoryTotals: CategoryTotal[];
    monthlyTrend: MonthlyTrendPoint[];
    weeklyTrend: WeeklyTrendPoint[];
}

function startOfYear(now: Date): Date {
    return new Date(now.getFullYear(), 0, 1);
}

function startOfMonth(now: Date): Date {
    return new Date(now.getFullYear(), now.getMonth(), 1);
}

function startOfWeek(now: Date): Date {
    const start = new Date(now);
    start.setDate(now.getDate() - now.getDay());
    start.setHours(0, 0, 0, 0);
    return start;
}

function startOfLastSevenDays(now: Date): Date {
    const start = new Date(now);
    start.setDate(now.getDate() - 6);
    start.setHours(0, 0, 0, 0);
    return start;
}

function resolvePeriodRange(
    period: DashboardPeriod
): { start: Date; end: Date } {
    const now = new Date();
    const end = now;
    if (period === "week") {
        return { start: startOfWeek(now), end };
    }
    if (period === "year") {
        return { start: startOfYear(now), end };
    }
    return { start: startOfMonth(now), end };
}

export async function getDashboardStats(
    user: User,
    period: DashboardPeriod = "month"
): Promise<DashboardStats> {
    const now = new Date();
    const { start: periodStart, end: periodEnd } = resolvePeriodRange(period);

    const userScope = eq(expenses.userId, user.id);
    const periodScope = and(
        gte(expenses.expenseDate, periodStart),
        lte(expenses.expenseDate, periodEnd)
    );

    // Total for the selected period
    const [periodTotals] = await db
        .select({ total: sum(expenses.amount) })
        .from(expenses)
        .where(and(userScope, periodScope));

    // By category for the period
    const categoryTotals = await db
        .select({
            category: expenses.category,
            total: sum(expenses.amount),
        })
        .from(expenses)
        .where(and(userScope, periodScope))
        .groupBy(expenses.category);

    // Count for the period
    const [countResult] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(expenses)
        .where(and(userScope, periodScope));

    // Monthly trend — current year, sum by month
    const monthlyTrend = await db
        .select({
            month: sql<number>`extract(month from ${expenses.expenseDate})::int`,
            total: sum(expenses.amount),
        })
        .from(expenses)
        .where(and(userScope, gte(expenses.expenseDate, startOfYear(now))))
        .groupBy(sql`extract(month from ${expenses.expenseDate})`);

    // Weekly trend — last 7 days, sum by day
    const weekStart = startOfLastSevenDays(now);
    const weeklyTrend = await db
        .select({
            day: sql<string>`to_char(${expenses.expenseDate}, 'YYYY-MM-DD')`,
            total: sum(expenses.amount),
        })
        .from(expenses)
        .where(and(userScope, gte(expenses.expenseDate, weekStart)))
        .groupBy(sql`to_char(${expenses.expenseDate}, 'YYYY-MM-DD')`);

    return {
        periodTotal: periodTotals?.total ?? "0",
        transactionCount: countResult?.count ?? 0,
        categoryTotals,
        monthlyTrend,
        weeklyTrend,
    };
}
