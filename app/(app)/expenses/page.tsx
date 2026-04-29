import Link from "next/link";
import { PlusIcon } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { expenses, users } from "@/database/schema";
import { eq, desc } from "drizzle-orm";
import { Button } from "@/components/ui/button";
import { ExpenseCard } from "@/components/expenses/ExpenseCard";

async function getDbUser(authUserId: string, email?: string | null) {
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

export default async function ExpensesPage() {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) return null;

  const dbUser = await getDbUser(authUser.id, authUser.email);

  const rows = await db
    .select()
    .from(expenses)
    .where(eq(expenses.userId, dbUser.id))
    .orderBy(desc(expenses.expenseDate))
    .limit(50);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Expenses</h2>
        <Link href="/expenses/new">
          <Button size="sm">
            <PlusIcon data-icon="inline-start" />
            Add
          </Button>
        </Link>
      </div>

      {rows.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <span className="text-4xl">💸</span>
          <p className="text-sm font-medium">No expenses yet</p>
          <p className="text-xs text-muted-foreground">
            Tap &ldquo;Add&rdquo; to record your first expense
          </p>
          <Link href="/expenses/new">
            <Button size="sm">
              <PlusIcon data-icon="inline-start" />
              Add expense
            </Button>
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {rows.map((expense, i) => (
            <ExpenseCard key={expense.id} expense={expense} index={i} />
          ))}
        </div>
      )}

      {/* FAB */}
      <Link href="/expenses/new" className="fixed bottom-20 right-4">
        <Button size="icon-lg" className="rounded-full shadow-lg">
          <PlusIcon />
        </Button>
      </Link>
    </div>
  );
}
