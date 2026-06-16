import { Elysia, status } from "elysia";
import { authPlugin } from "../plugins/auth";
import {
    expenseCreateBody,
    expenseListQuery,
    expenseUpdateBody,
} from "@/lib/server/validation/schemas";
import {
    createExpense,
    deleteExpense,
    listExpenses,
    updateExpense,
} from "@/lib/server/services/expenses";

/**
 * Expenses API
 *
 * - GET    /api/expenses        List expenses for the current user
 * - POST   /api/expenses        Create a new expense
 * - PUT    /api/expenses/:id    Update an existing expense
 * - DELETE /api/expenses/:id    Delete an expense
 *
 * All routes require an authenticated user; the auth plugin attaches
 * `dbUser` to the context. Ownership checks are enforced inside the
 * service layer.
 */
export const expensesModule = new Elysia({ prefix: "/expenses" })
    .use(authPlugin)
    .get(
        "/",
        ({ dbUser, query }) =>
            listExpenses(dbUser, {
                category: query.category,
                from: query.from,
                to: query.to,
                limit: query.limit ? parseInt(query.limit, 10) : undefined,
                offset: query.offset ? parseInt(query.offset, 10) : undefined,
            }),
        { query: expenseListQuery }
    )
    .post(
        "/",
        ({ dbUser, body, set }) => {
            const created = createExpense(dbUser, body);
            set.status = 201;
            return created;
        },
        { body: expenseCreateBody }
    )
    .put(
        "/:id",
        ({ dbUser, params, body }) => {
            const updated = updateExpense(dbUser, params.id, body);
            if (!updated) {
                throw status(404, "Expense not found");
            }
            return updated;
        },
        { body: expenseUpdateBody }
    )
    .delete("/:id", ({ dbUser, params }) => {
        const removed = deleteExpense(dbUser, params.id);
        if (!removed) {
            throw status(404, "Expense not found");
        }
        return { success: true };
    });
