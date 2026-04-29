/**
 * lib/supabase/server.ts
 *
 * Server-side Supabase client for FinWise.
 *
 * USE THIS IN:
 *   - Server Components  (RSC — files without "use client")
 *   - Route Handlers     (app/api/[[...slugs]]/route.ts)
 *   - Server Actions     (functions with "use server")
 *   - Middleware         (already handled by lib/supabase/middleware.ts)
 *
 * DO NOT USE THIS IN:
 *   - Client Components (use lib/supabase/client.ts instead)
 *
 * HOW IT WORKS:
 * `createServerClient` from @supabase/ssr reads/writes auth cookies via the
 * Next.js `cookies()` API. This ensures the user's session is correctly
 * persisted and refreshed on every server request.
 *
 * IMPORTANT — `cookies()` is async in Next.js 15+:
 * Always `await createClient()` before using the returned instance.
 *
 * USAGE:
 *   import { createClient } from "@/lib/supabase/server"
 *   const supabase = await createClient()
 *   const { data: { user } } = await supabase.auth.getUser()
 */

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { SupabaseClient } from "@supabase/supabase-js";

// ─── Env Validation ───────────────────────────────────────────────────────────

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
        "[lib/supabase/server] Missing environment variables.\n" +
        "  NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be set."
    );
}

// ─── Type ─────────────────────────────────────────────────────────────────────

/** Typed Supabase client instance (server). */
export type ServerSupabaseClient = SupabaseClient;

// ─── Factory ──────────────────────────────────────────────────────────────────

/**
 * Creates a server-side Supabase client that reads/writes cookies via
 * the Next.js `cookies()` API to maintain the user's auth session.
 *
 * Must be awaited — `cookies()` is async in Next.js 15+.
 *
 * @returns A typed Supabase client for use in server contexts.
 *
 * @example
 * ```ts
 * // In a Server Component:
 * import { createClient } from "@/lib/supabase/server"
 *
 * export default async function Dashboard() {
 *   const supabase = await createClient()
 *   const { data: { user } } = await supabase.auth.getUser()
 *   if (!user) redirect("/login")
 *   // ...
 * }
 * ```
 *
 * @example
 * ```ts
 * // In a Route Handler:
 * import { createClient } from "@/lib/supabase/server"
 * import { NextResponse } from "next/server"
 *
 * export async function GET() {
 *   const supabase = await createClient()
 *   const { data: { user } } = await supabase.auth.getUser()
 *   if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
 *   // ...
 * }
 * ```
 */
export async function createClient(): Promise<ServerSupabaseClient> {
    // `cookies()` must be awaited in Next.js 15+
    const cookieStore = await cookies();

    return createServerClient(supabaseUrl!, supabaseAnonKey!, {
        cookies: {
            /**
             * Read all cookies from the current request.
             * Used by Supabase to retrieve the user's session tokens.
             */
            getAll() {
                return cookieStore.getAll();
            },
            /**
             * Write cookies to the response.
             * Used by Supabase to persist refreshed session tokens.
             *
             * Note: In Server Components, `cookieStore.set()` will throw because
             * Server Components cannot set response cookies. This is expected and safe
             * — session refresh happens in middleware (lib/supabase/middleware.ts).
             */
            setAll(cookiesToSet) {
                try {
                    cookiesToSet.forEach(({ name, value, options }) => {
                        cookieStore.set(name, value, options);
                    });
                } catch {
                    // Server Component — ignore the write. Session refresh is handled
                    // by middleware before the Server Component renders.
                }
            },
        },
    });
}
