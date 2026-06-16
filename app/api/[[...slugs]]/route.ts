import { Elysia } from "elysia";
import { errorHandler } from "./plugins/error";
import { dashboardModule } from "./modules/dashboard";
import { expensesModule } from "./modules/expenses";
import { healthModule } from "./modules/health";
import { receiptsModule } from "./modules/receipts";
import { slipsModule } from "./modules/slips";

/**
 * Finwise API root.
 *
 * Each feature is implemented as an Elysia sub-app under
 * `app/api/[[...slugs]]/modules/` and composed here. Auth, validation,
 * and error responses are standardized through the shared plugins.
 */
export const app = new Elysia({ prefix: "/api" })
    .use(errorHandler)
    .use(healthModule)
    .use(expensesModule)
    .use(dashboardModule)
    .use(receiptsModule)
    .use(slipsModule);

export type App = typeof app;

const handle = app.compile().fetch;
export const GET = handle;
export const POST = handle;
export const PUT = handle;
export const DELETE = handle;
export const PATCH = handle;
