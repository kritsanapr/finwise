import { Elysia } from "elysia";
import { authPlugin } from "../plugins/auth";
import { imageUploadBody } from "@/lib/server/validation/schemas";
import { uploadBankSlip } from "@/lib/server/services/slips";

/**
 * Bank slips API
 *
 * - POST /api/slips/upload   Upload a Thai bank slip image, run AI
 *                            extraction, and persist the result.
 */
export const slipsModule = new Elysia({ prefix: "/slips" })
    .use(authPlugin)
    .post(
        "/upload",
        ({ dbUser, body, set }) => {
            const result = uploadBankSlip(dbUser, body.file);
            set.status = 201;
            return result;
        },
        { body: imageUploadBody }
    );
