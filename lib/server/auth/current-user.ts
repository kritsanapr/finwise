import { eq } from "drizzle-orm";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { users, type User } from "@/database/schema";

/**
 * Server-only auth helpers for the Finwise API.
 *
 * The current code maps authenticated Supabase users into the local `users`
 * table. `lineUserId` is used as a placeholder identity key for the
 * authenticated user id. See `docs/agents/domain-rules.md` for context.
 */

export interface AuthUser {
    id: string;
    email: string | null | undefined;
}

/**
 * Resolve the currently signed-in Supabase user, or `null` if unauthenticated.
 */
export async function getAuthUser(): Promise<AuthUser | null> {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;
    return { id: user.id, email: user.email };
}

/**
 * Ensure a row exists in the local `users` table for the given auth user.
 * Returns the existing row if one is already present, otherwise inserts
 * a new row keyed by the Supabase user id and returns it.
 */
export async function getOrCreateDbUser(
    authUserId: string,
    email?: string | null
): Promise<User> {
    const existing = await db
        .select()
        .from(users)
        .where(eq(users.lineUserId, authUserId))
        .limit(1);

    if (existing.length > 0) return existing[0]!;

    const [created] = await db
        .insert(users)
        .values({
            lineUserId: authUserId,
            displayName: email?.split("@")[0] ?? "User",
        })
        .returning();

    if (!created) {
        throw new Error("Failed to create local user record");
    }
    return created;
}

/**
 * Resolve both the Supabase auth user and the local DB user in one call.
 * Throws if the request is unauthenticated.
 */
export async function requireUser(): Promise<{ authUser: AuthUser; dbUser: User }> {
    const authUser = await getAuthUser();
    if (!authUser) {
        throw new ApiAuthError("Unauthorized");
    }
    const dbUser = await getOrCreateDbUser(authUser.id, authUser.email);
    return { authUser, dbUser };
}

/**
 * Marker error for unauthenticated requests. The error plugin in
 * `app/api/[[...slugs]]/plugins/error.ts` translates this into HTTP 401.
 */
export class ApiAuthError extends Error {
    public readonly code = "UNAUTHORIZED" as const;
    public readonly status = 401 as const;
    constructor(message: string = "Unauthorized") {
        super(message);
        this.name = "ApiAuthError";
    }
}
