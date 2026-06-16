import { t } from "elysia";
import { EXPENSE_CATEGORIES } from "@/lib/validations/expense";

/**
 * TypeBox schemas for Finwise HTTP API inputs.
 *
 * These mirror the Zod schemas in `lib/validations/api.ts` and are used
 * directly by Elysia handlers via `body:` / `query:` validators.
 *
 * Keep the two in sync when changing a request shape. The Zod schemas
 * are the source of truth for the React form layer; these TypeBox
 * schemas are the source of truth for the HTTP layer.
 */

// ─── Expenses ────────────────────────────────────────────────────────────────

export const expenseListQuery = t.Object({
    category: t.Optional(t.UnionEnum(EXPENSE_CATEGORIES)),
    from: t.Optional(t.String()),
    to: t.Optional(t.String()),
    limit: t.Optional(t.String()),
    offset: t.Optional(t.String()),
});

export const expenseCreateBody = t.Object({
    amount: t.String(),
    category: t.UnionEnum(EXPENSE_CATEGORIES),
    description: t.Optional(t.String()),
    expenseDate: t.String(),
});

export const expenseUpdateBody = t.Object({
    amount: t.String(),
    category: t.UnionEnum(EXPENSE_CATEGORIES),
    description: t.Optional(t.String()),
    expenseDate: t.String(),
});

// ─── Dashboard ───────────────────────────────────────────────────────────────

export const dashboardStatsQuery = t.Object({
    period: t.Optional(
        t.Union([t.Literal("week"), t.Literal("month"), t.Literal("year")])
    ),
});

// ─── Uploads ─────────────────────────────────────────────────────────────────

export const imageUploadBody = t.Object({
    file: t.File({ type: ["image/jpeg", "image/png", "image/webp"] }),
});
