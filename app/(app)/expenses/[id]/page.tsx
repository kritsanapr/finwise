import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { expenses, users } from "@/database/schema";
import { eq, and } from "drizzle-orm";
import { Card, CardContent } from "@/components/ui/card";
import { ExpenseForm } from "@/components/expenses/ExpenseForm";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditExpensePage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) return null;

  const [dbUser] = await db
    .select()
    .from(users)
    .where(eq(users.lineUserId, authUser.id))
    .limit(1);

  if (!dbUser) notFound();

  const [expense] = await db
    .select()
    .from(expenses)
    .where(and(eq(expenses.id, id), eq(expenses.userId, dbUser.id)))
    .limit(1);

  if (!expense) notFound();

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold">Edit Expense</h2>
      <Card>
        <CardContent>
          <ExpenseForm expense={expense} />
        </CardContent>
      </Card>
    </div>
  );
}
