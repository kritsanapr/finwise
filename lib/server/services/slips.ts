import { db } from "@/lib/db";
import { bankSlips, type BankSlip, type User } from "@/database/schema";
import {
    generateStoragePath,
    uploadToSupabaseStorage,
} from "@/lib/services/upload";
import {
    extractBankSlip,
    type BankSlipExtraction,
} from "@/lib/services/ai-extract";

/**
 * Bank slip upload service.
 *
 * Mirrors the receipts service but writes to the `bank_slips` table and
 * uses the `bank-slips` storage bucket. The extracted transfer fields are
 * treated as user-assistive, not guaranteed truth — see
 * `docs/agents/domain-rules.md`.
 */

export const SLIPS_AI_MODEL = "google/gemini-2.0-flash-lite";
const SLIPS_BUCKET = "bank-slips";

export interface UploadBankSlipResult {
    slip: BankSlip;
    extracted: BankSlipExtraction;
    publicUrl: string;
}

export async function uploadBankSlip(
    user: User,
    file: File
): Promise<UploadBankSlipResult> {
    const storagePath = generateStoragePath(user.id, file.name);
    const { publicUrl } = await uploadToSupabaseStorage(
        file,
        SLIPS_BUCKET,
        storagePath
    );

    const extracted = await extractBankSlip(publicUrl);

    const [slip] = await db
        .insert(bankSlips)
        .values({
            userId: user.id,
            storagePath,
            publicUrl,
            fileName: file.name,
            mimeType: file.type,
            fileSize: file.size,
            uploadStatus: "uploaded",
            bankName: extracted.bankName,
            transferRef: extracted.transferRef,
            senderAccount: extracted.senderAccount,
            receiverAccount: extracted.receiverAccount,
            receiverName: extracted.receiverName,
            transferAmount: extracted.transferAmount,
            transferDate: extracted.transferDate
                ? new Date(extracted.transferDate)
                : null,
            aiModel: SLIPS_AI_MODEL,
        })
        .returning();

    if (!slip) {
        throw new Error("Failed to persist bank slip");
    }

    return { slip, extracted, publicUrl };
}
