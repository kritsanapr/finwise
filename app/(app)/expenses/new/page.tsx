import { ExpenseForm } from "@/components/expenses/ExpenseForm";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function NewExpensePage() {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold">New Expense</h2>
      <Card>
        <CardContent>
          <ExpenseForm />
        </CardContent>
      </Card>
    </div>
  );
}
