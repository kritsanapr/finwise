import { z } from "zod";
import { EXPENSE_CATEGORIES } from "./expense";

/**
 * Shared Zod schemas for Finwise HTTP API inputs.
 *
 * These schemas are the single source of truth for both the Elysia handlers
 * (via the Zod-to-TypeBox bridge) and any future client-side callers.
 *
 * Form-level validation (used by react-hook-form) lives in `lib/validations/expense.ts`
 * and reuses the same category constants.
 */

// ─── Primitives ──────────────────────────────────────────────────────────────

const dateString = z
    .string()
    .min(1, "Date is required")
    .refine((v) => !Number.isNaN(Date.parse(v)), "Invalid date");

const amountString = z
    .string()
    .min(1, "Amount is required")
    .refine(
        (val) => !Number.isNaN(parseFloat(val)) && parseFloat(val) > 0,
        "Amount must be a positive number"
    );

const categoryEnum = z.enum(EXPENSE_CATEGORIES, {
    error: "Please select a category",
});

const limitString = z
    .string()
    .optional()
    .transform((v) => (v ? parseInt(v, 10) : undefined))
    .refine((n) => n === undefined || (!Number.isNaN(n) && n > 0), {
        message: "Limit must be a positive integer",
    });

const offsetString = z
    .string()
    .optional()
    .transform((v) => (v ? parseInt(v, 10) : undefined))
    .refine((n) => n === undefined || (!Number.isNaN(n) && n >= 0), {
        message: "Offset must be a non-negative integer",
    });

// ─── Expenses ────────────────────────────────────────────────────────────────

export const expenseListQuerySchema = z.object({
    category: categoryEnum.optional(),
    from: z.string().optional(),
    to: z.string().optional(),
    limit: limitString,
    offset: offsetString,
});

export const expenseCreateBodySchema = z.object({
    amount: amountString,
    category: categoryEnum,
    description: z.string().max(255).optional(),
    expenseDate: dateString,
});

export const expenseUpdateBodySchema = z.object({
    amount: amountString,
    category: categoryEnum,
    description: z.string().max(255).optional(),
    expenseDate: dateString,
});

// ─── Dashboard ───────────────────────────────────────────────────────────────

export const dashboardStatsQuerySchema = z.object({
    period: z.enum(["week", "month", "year"]).optional(),
});

// ─── Uploads ─────────────────────────────────────────────────────────────────

export const IMAGE_MIME_TYPES = [
    "image/jpeg",
    "image/png",
    "image/webp",
] as const;

export const imageUploadBodySchema = z.object({
    file: z
        .instanceof(File)
        .refine(
            (f) =>
                (IMAGE_MIME_TYPES as readonly string[]).includes(f.type),
            "File must be JPEG, PNG, or WebP"
        ),
});

// ─── Inferred Types ──────────────────────────────────────────────────────────

export type ExpenseListQuery = z.infer<typeof expenseListQuerySchema>;
export type ExpenseCreateBody = z.infer<typeof expenseCreateBodySchema>;
export type ExpenseUpdateBody = z.infer<typeof expenseUpdateBodySchema>;
export type DashboardStatsQuery = z.infer<typeof dashboardStatsQuerySchema>;
export type ImageUploadBody = z.infer<typeof imageUploadBodySchema>;
