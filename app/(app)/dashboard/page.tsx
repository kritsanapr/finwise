import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { expenses, users } from "@/database/schema";
import { eq, and, gte, lte, sum, sql } from "drizzle-orm";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { CategoryDonutChart } from "@/components/dashboard/CategoryDonutChart";
import { TrendChart } from "@/components/dashboard/TrendChart";

async function getOrCreateUser(authUserId: string, email?: string | null) {
  const existing = await db
    .select()
    .from(users)
    .where(eq(users.lineUserId, authUserId))
    .limit(1);
  if (existing.length > 0) return existing[0]!;
  const [created] = await db
    .insert(users)
    .values({ lineUserId: authUserId, displayName: email?.split("@")[0] ?? "User" })
    .returning();
  return created!;
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) return null;

  const dbUser = await getOrCreateUser(authUser.id, authUser.email);
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  const [monthTotal] = await db
    .select({ total: sum(expenses.amount) })
    .from(expenses)
    .where(and(eq(expenses.userId, dbUser.id), gte(expenses.expenseDate, startOfMonth)));

  const [weekTotal] = await db
    .select({ total: sum(expenses.amount) })
    .from(expenses)
    .where(and(eq(expenses.userId, dbUser.id), gte(expenses.expenseDate, startOfWeek)));

  const [txCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(expenses)
    .where(and(eq(expenses.userId, dbUser.id), gte(expenses.expenseDate, startOfMonth)));

  const categoryTotals = await db
    .select({ category: expenses.category, total: sum(expenses.amount) })
    .from(expenses)
    .where(and(eq(expenses.userId, dbUser.id), gte(expenses.expenseDate, startOfMonth)))
    .groupBy(expenses.category);

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

  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - 6);
  weekStart.setHours(0, 0, 0, 0);

  const weeklyTrend = await db
    .select({
      day: sql<string>`to_char(${expenses.expenseDate}, 'YYYY-MM-DD')`,
      total: sum(expenses.amount),
    })
    .from(expenses)
    .where(and(eq(expenses.userId, dbUser.id), gte(expenses.expenseDate, weekStart)))
    .groupBy(sql`to_char(${expenses.expenseDate}, 'YYYY-MM-DD')`);

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold">Dashboard</h2>

      <StatsCards
        periodTotal={monthTotal!.total ?? "0"}
        weeklyTotal={weekTotal!.total ?? "0"}
        transactionCount={txCount!.count ?? 0}
      />

      <CategoryDonutChart data={categoryTotals} />

      <TrendChart monthly={monthlyTrend} weekly={weeklyTrend} />
    </div>
  );
}
