/**
 * lib/supabase/client.ts
 *
 * Browser-side Supabase client for FinWise.
 *
 * USE THIS IN:
 *   - Client Components (`"use client"`)
 *   - Browser-side event handlers
 *   - Any code that runs in the user's browser
 *
 * DO NOT USE THIS IN:
 *   - Server Components (use lib/supabase/server.ts instead)
 *   - Route Handlers      (use lib/supabase/server.ts instead)
 *   - Server Actions      (use lib/supabase/server.ts instead)
 *
 * SINGLETON PATTERN:
 * `createBrowserClient` is memoized internally by @supabase/ssr —
 * calling `createClient()` multiple times in the same browser session
 * returns the same client instance. No extra singleton guard needed.
 *
 * USAGE:
 *   import { createClient } from "@/lib/supabase/client"
 *   const supabase = createClient()
 *   const { data, error } = await supabase.auth.getUser()
 */

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

// ─── Env Validation ───────────────────────────────────────────────────────────

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
        "[lib/supabase/client] Missing environment variables.\n" +
        "  NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be set.\n" +
        "  These are safe to expose — they are public keys for the browser client."
    );
}

// ─── Type ─────────────────────────────────────────────────────────────────────

/** Typed Supabase client instance (browser). */
export type BrowserSupabaseClient = SupabaseClient;

// ─── Factory ──────────────────────────────────────────────────────────────────

/**
 * Creates (or returns the memoized) browser Supabase client.
 *
 * @returns A typed Supabase client for use in browser/client contexts.
 *
 * @example
 * ```tsx
 * "use client"
 * import { createClient } from "@/lib/supabase/client"
 *
 * export function SignOutButton() {
 *   const supabase = createClient()
 *   return <button onClick={() => supabase.auth.signOut()}>Sign out</button>
 * }
 * ```
 */
export function createClient(): BrowserSupabaseClient {
    return createBrowserClient(supabaseUrl!, supabaseAnonKey!);
}
