import { Elysia } from "elysia";
import { ApiAuthError } from "@/lib/server/auth/current-user";

/**
 * Finwise API error envelope shape. All error responses use this shape
 * so the client can rely on `error` being a string and `issues` being
 * optional validation details.
 */
export interface ApiErrorBody {
    error: string;
    issues?: unknown;
}

/**
 * Centralized error handler for the Finwise Elysia API.
 *
 * Mounted at the root. Translates known error shapes into predictable
 * JSON responses:
 *
 * - `ApiAuthError`           -> 401 { error }
 * - `VALIDATION`             -> 400 { error, issues }
 * - `NOT_FOUND`              -> 404 { error }
 * - `PARSE`                  -> 400 { error }
 * - Everything else          -> 500 { error: "Internal Server Error" }
 */
export const errorHandler = new Elysia({ name: "error-handler" }).onError(
    ({ code, error, set }) => {
        if (error instanceof ApiAuthError) {
            set.status = error.status;
            return { error: error.message } satisfies ApiErrorBody;
        }

        if (code === "VALIDATION") {
            set.status = 400;
            return {
                error: "Validation failed",
                issues: error.all ?? error.message,
            } satisfies ApiErrorBody;
        }

        if (code === "NOT_FOUND") {
            set.status = 404;
            return { error: "Not found" } satisfies ApiErrorBody;
        }

        if (code === "PARSE") {
            set.status = 400;
            return { error: "Invalid request" } satisfies ApiErrorBody;
        }

        if (code === "INTERNAL_SERVER_ERROR") {
            // Log so we don't lose the original cause.
            console.error("[api] internal server error:", error);
            set.status = 500;
            return {
                error: "Internal Server Error",
            } satisfies ApiErrorBody;
        }

        // Unknown errors -> 500 with a sanitized message.
        console.error("[api] unhandled error:", error);
        set.status = 500;
        return { error: "Internal Server Error" } satisfies ApiErrorBody;
    }
);
