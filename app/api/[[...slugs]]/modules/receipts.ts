import { Elysia } from "elysia";
import { authPlugin } from "../plugins/auth";
import { imageUploadBody } from "@/lib/server/validation/schemas";
import { uploadReceipt } from "@/lib/server/services/receipts";

/**
 * Receipts API
 *
 * - POST /api/receipts/upload   Upload a receipt image, run AI
 *                              extraction, and persist the result.
 */
export const receiptsModule = new Elysia({ prefix: "/receipts" })
    .use(authPlugin)
    .post(
        "/upload",
        ({ dbUser, body, set }) => {
            const result = uploadReceipt(dbUser, body.file);
            set.status = 201;
            return result;
        },
        { body: imageUploadBody }
    );
