import { Elysia } from "elysia";
import type { User } from "@/database/schema";
import { requireUser, type AuthUser } from "@/lib/server/auth/current-user";

/**
 * Finwise API auth plugin.
 *
 * Resolves the Supabase auth user once and ensures a matching row exists
 * in the local `users` table, attaching both as resolve context so route
 * handlers can simply read `ctx.authUser` and `ctx.dbUser` instead of
 * re-running the auth lookup.
 *
 * Uses `resolve` rather than `derive` because resolve runs at
 * beforeHandle (after validation) and preserves the typed contract end-
 * to-end. Throws `ApiAuthError` (handled by the error plugin) when the
 * request is unauthenticated.
 *
 * Declared with `as: 'scoped'` so the resolved fields flow into any
 * Elysia instance that `.use(authPlugin)` and its descendants.
 *
 * `name: 'auth'` lets multiple modules `.use(authPlugin)` without
 * duplicate execution — Elysia dedupes plugins by name.
 */
export const authPlugin = new Elysia({ name: "auth" }).resolve(
    { as: "scoped" },
    async (): Promise<{ authUser: AuthUser; dbUser: User }> => {
        return requireUser();
    }
);
