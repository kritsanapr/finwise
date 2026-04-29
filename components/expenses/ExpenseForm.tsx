"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Loader2Icon, CalendarIcon, CheckIcon } from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";
import {
  expenseSchema,
  type ExpenseFormData,
  EXPENSE_CATEGORIES,
  CATEGORY_LABELS,
  CATEGORY_EMOJIS,
} from "@/lib/validations/expense";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import type { Expense } from "@/database/schema";

// Simple inline Calendar (native date input as fallback — no extra shadcn calendar dep needed)
function DatePicker({
  value,
  onChange,
  error = "",
}: {
  value: string;
  onChange: (val: string) => void;
  error?: string;
}) {
  const [open, setOpen] = useState(false);
  const displayDate = value ? format(new Date(value), "MMM d, yyyy") : "Pick a date";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className={cn(
          "flex h-8 w-full items-center justify-between rounded-lg border border-input bg-background px-2.5 text-sm transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          !value && "text-muted-foreground",
          error && "border-destructive"
        )}
      >
        {displayDate}
        <CalendarIcon className="size-4 text-muted-foreground" />
      </PopoverTrigger>
      <PopoverContent className="w-auto p-3" align="start">
        <input
          type="date"
          className="rounded-lg border border-input bg-background px-2.5 py-1.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          value={value}
          max={format(new Date(), "yyyy-MM-dd")}
          onChange={(e) => {
            onChange(e.target.value);
            setOpen(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );
}

const fieldVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, duration: 0.25 },
  }),
};

interface ExpenseFormProps {
  expense?: Expense;
  onSuccess?: () => void;
}

export function ExpenseForm({ expense, onSuccess }: ExpenseFormProps) {
  const router = useRouter();
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      amount: expense?.amount ?? "",
      category: (expense?.category as ExpenseFormData["category"]) ?? undefined,
      description: expense?.description ?? "",
      expenseDate: expense?.expenseDate
        ? format(new Date(expense.expenseDate), "yyyy-MM-dd")
        : format(new Date(), "yyyy-MM-dd"),
    },
  });

  const selectedCategory = watch("category");
  const selectedDate = watch("expenseDate");

  const onSubmit = async (data: ExpenseFormData) => {
    const url = expense ? `/api/expenses/${expense.id}` : "/api/expenses";
    const method = expense ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "Unknown error" }));
      toast.error(err.error ?? "Failed to save expense");
      return;
    }

    setSuccess(true);
    toast.success(expense ? "Expense updated!" : "Expense added!");
    setTimeout(() => {
      if (onSuccess) {
        onSuccess();
      } else {
        router.push("/expenses");
        router.refresh();
      }
    }, 600);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      {/* Amount */}
      <motion.div
        variants={fieldVariants}
        initial="hidden"
        animate="visible"
        custom={0}
        className="flex flex-col gap-1.5"
      >
        <Label htmlFor="amount">Amount (฿)</Label>
        <div className="relative">
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
            ฿
          </span>
          <Input
            id="amount"
            type="number"
            inputMode="decimal"
            step="0.01"
            placeholder="0.00"
            aria-invalid={!!errors.amount}
            className={cn("pl-6", errors.amount && "border-destructive")}
            {...register("amount")}
          />
        </div>
        {errors.amount && (
          <p className="text-xs text-destructive">{errors.amount.message}</p>
        )}
      </motion.div>

      {/* Category */}
      <motion.div
        variants={fieldVariants}
        initial="hidden"
        animate="visible"
        custom={1}
        className="flex flex-col gap-1.5"
      >
        <Label>Category</Label>
        <div className="grid grid-cols-3 gap-2">
          {EXPENSE_CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setValue("category", cat, { shouldValidate: true })}
              className={cn(
                "flex flex-col items-center gap-1 rounded-xl border px-2 py-2.5 text-xs font-medium transition-all",
                selectedCategory === cat
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-background text-muted-foreground hover:border-primary/50 hover:text-foreground"
              )}
            >
              <span className="text-lg">{CATEGORY_EMOJIS[cat]}</span>
              {CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>
        {errors.category && (
          <p className="text-xs text-destructive">{errors.category.message}</p>
        )}
      </motion.div>

      {/* Date */}
      <motion.div
        variants={fieldVariants}
        initial="hidden"
        animate="visible"
        custom={2}
        className="flex flex-col gap-1.5"
      >
        <Label>Date</Label>
        <DatePicker
          value={selectedDate}
          onChange={(v) => setValue("expenseDate", v, { shouldValidate: true })}
          error={errors.expenseDate?.message ?? ""}
        />
        {errors.expenseDate && (
          <p className="text-xs text-destructive">{errors.expenseDate.message}</p>
        )}
      </motion.div>

      {/* Description */}
      <motion.div
        variants={fieldVariants}
        initial="hidden"
        animate="visible"
        custom={3}
        className="flex flex-col gap-1.5"
      >
        <Label htmlFor="description">Description (optional)</Label>
        <Textarea
          id="description"
          placeholder="Add a note..."
          rows={2}
          aria-invalid={!!errors.description}
          className={cn(errors.description && "border-destructive")}
          {...register("description")}
        />
        {errors.description && (
          <p className="text-xs text-destructive">{errors.description.message}</p>
        )}
      </motion.div>

      {/* Submit */}
      <motion.div
        variants={fieldVariants}
        initial="hidden"
        animate="visible"
        custom={4}
        className="pt-1"
      >
        <Button
          type="submit"
          className="w-full"
          size="lg"
          disabled={isSubmitting || success}
        >
          {success ? (
            <CheckIcon data-icon="inline-start" className="text-green-500" />
          ) : isSubmitting ? (
            <Loader2Icon data-icon="inline-start" className="animate-spin" />
          ) : null}
          {success ? "Saved!" : expense ? "Update Expense" : "Add Expense"}
        </Button>
      </motion.div>
    </form>
  );
}
