import { Elysia } from "elysia";
import { authPlugin } from "../plugins/auth";
import { dashboardStatsQuery } from "@/lib/server/validation/schemas";
import { getDashboardStats } from "@/lib/server/services/dashboard";

/**
 * Dashboard API
 *
 * - GET /api/dashboard/stats   Aggregated stats for the dashboard UI
 */
export const dashboardModule = new Elysia({ prefix: "/dashboard" })
    .use(authPlugin)
    .get(
        "/stats",
        ({ dbUser, query }) =>
            getDashboardStats(dbUser, query.period ?? "month"),
        { query: dashboardStatsQuery }
    );
