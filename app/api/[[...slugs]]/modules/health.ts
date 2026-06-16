import { Elysia } from "elysia";

/**
 * GET /api/health
 *
 * Public liveness probe. No auth required.
 */
export const healthModule = new Elysia({ prefix: "/health" }).get(
    "/",
    () => ({ status: "ok" })
);
