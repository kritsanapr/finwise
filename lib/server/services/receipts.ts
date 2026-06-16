import { db } from "@/lib/db";
import { receipts, type Receipt, type User } from "@/database/schema";
import {
    generateStoragePath,
    uploadToSupabaseStorage,
} from "@/lib/services/upload";
import { extractReceipt, type ReceiptExtraction } from "@/lib/services/ai-extract";

/**
 * Receipt upload service.
 *
 * Orchestrates Supabase Storage upload, AI vision extraction, and the
 * `receipts` row insert. The extracted fields are treated as untrusted
 * AI output and may be null.
 */

export const RECEIPTS_AI_MODEL = "google/gemini-2.0-flash-lite";
const RECEIPTS_BUCKET = "receipts";

export interface UploadReceiptResult {
    receipt: Receipt;
    extracted: ReceiptExtraction;
    publicUrl: string;
}

export async function uploadReceipt(
    user: User,
    file: File
): Promise<UploadReceiptResult> {
    const storagePath = generateStoragePath(user.id, file.name);
    const { publicUrl } = await uploadToSupabaseStorage(
        file,
        RECEIPTS_BUCKET,
        storagePath
    );

    const extracted = await extractReceipt(publicUrl);

    const [receipt] = await db
        .insert(receipts)
        .values({
            userId: user.id,
            storagePath,
            fileName: file.name,
            mimeType: file.type,
            fileSize: file.size,
            extractedMerchant: extracted.merchant,
            extractedDate: extracted.date ? new Date(extracted.date) : null,
            extractedAmount: extracted.amount,
            extractedItems: extracted.items,
            aiModel: RECEIPTS_AI_MODEL,
        })
        .returning();

    if (!receipt) {
        throw new Error("Failed to persist receipt");
    }

    return { receipt, extracted, publicUrl };
}
