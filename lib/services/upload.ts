import { createClient } from "@/lib/supabase/server";

/**
 * Upload a file to Supabase Storage.
 * Returns the public URL of the uploaded file.
 */
export async function uploadToSupabaseStorage(
    file: File,
    bucket: string,
    storagePath: string
): Promise<{ publicUrl: string; storagePath: string }> {
    const supabase = await createClient();

    const { error } = await supabase.storage
        .from(bucket)
        .upload(storagePath, file, {
            cacheControl: "3600",
            upsert: false,
        });

    if (error) {
        throw new Error(`Upload failed: ${error.message}`);
    }

    const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(storagePath);

    return {
        publicUrl: urlData.publicUrl,
        storagePath,
    };
}

/**
 * Generate a unique storage path for a file.
 * Format: {userId}/{year}/{month}/{uuid}.{ext}
 */
export function generateStoragePath(
    userId: string,
    fileName: string
): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const uuid = crypto.randomUUID();
    const ext = fileName.split(".").pop() ?? "jpg";
    return `${userId}/${year}/${month}/${uuid}.${ext}`;
}
