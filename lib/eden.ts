import { treaty } from "@elysiajs/eden";
import type { App } from "@/app/api/[[...slugs]]/route";

/**
 * Type-safe Eden Treaty client for the Elysia API.
 *
 * On the server (Server Components, Server Actions): directly calls Elysia
 * without going through the network layer.
 *
 * On the client (Client Components): calls via HTTP.
 */
export const api =
  typeof process !== "undefined" && process.env.NODE_ENV !== undefined
    ? treaty<App>(
        process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
      ).api
    : treaty<App>("localhost:3000").api;
