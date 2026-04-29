import { z } from "zod";

export const EXPENSE_CATEGORIES = [
    "water",
    "electricity",
    "phone",
    "food",
    "transfer",
    "other",
] as const;

export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];

export const CATEGORY_LABELS: Record<ExpenseCategory, string> = {
    water: "Water",
    electricity: "Electricity",
    phone: "Phone",
    food: "Food",
    transfer: "Transfer",
    other: "Other",
};

export const CATEGORY_EMOJIS: Record<ExpenseCategory, string> = {
    water: "💧",
    electricity: "⚡",
    phone: "📱",
    food: "🍽️",
    transfer: "💸",
    other: "📋",
};

export const expenseSchema = z.object({
    amount: z
        .string()
        .min(1, "Amount is required")
        .refine(
            (val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0,
            "Amount must be a positive number"
        ),
    category: z.enum(EXPENSE_CATEGORIES, {
        error: "Please select a category",
    }),
    description: z
        .string()
        .max(255, "Description must be 255 characters or less")
        .optional(),
    expenseDate: z.string().min(1, "Date is required"),
});

export type ExpenseFormData = z.infer<typeof expenseSchema>;
