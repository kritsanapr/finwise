"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash2Icon } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  CATEGORY_EMOJIS,
  CATEGORY_LABELS,
  type ExpenseCategory,
} from "@/lib/validations/expense";
import type { Expense } from "@/database/schema";

interface ExpenseCardProps {
  expense: Expense;
  index: number;
}

export function ExpenseCard({ expense, index }: ExpenseCardProps) {
  const router = useRouter();
  const category = expense.category as ExpenseCategory;

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!confirm("Delete this expense?")) return;

    const res = await fetch(`/api/expenses/${expense.id}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      toast.error("Failed to delete expense");
      return;
    }

    toast.success("Expense deleted");
    router.refresh();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.25 }}
    >
      <Link href={`/expenses/${expense.id}`}>
        <Card className="transition-all hover:ring-primary/30">
          <CardContent className="flex items-center gap-3">
            {/* Icon */}
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-lg">
              {CATEGORY_EMOJIS[category] ?? "📋"}
            </div>

            {/* Info */}
            <div className="flex flex-1 flex-col gap-0.5 min-w-0">
              <div className="flex items-center gap-2">
                <span className="truncate text-sm font-medium">
                  {expense.description || CATEGORY_LABELS[category] || expense.category}
                </span>
                <Badge variant="secondary" className="shrink-0 text-xs capitalize">
                  {CATEGORY_LABELS[category] || expense.category}
                </Badge>
              </div>
              <span className="text-xs text-muted-foreground">
                {format(new Date(expense.expenseDate), "MMM d, yyyy")}
              </span>
            </div>

            {/* Amount */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold">
                ฿{parseFloat(expense.amount).toLocaleString("th-TH", {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 2,
                })}
              </span>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={handleDelete}
                className="text-muted-foreground hover:text-destructive"
              >
                <Trash2Icon />
              </Button>
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}
