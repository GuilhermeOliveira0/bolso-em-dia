import type { SupabaseClient } from "@supabase/supabase-js";
import { RECEIPT_BUCKET } from "@/lib/receipts/receipt-file-schema";
import type { Database } from "@/types/database";

export function buildReceiptFilePath(
  userId: string,
  receiptId: string,
  safeFileName: string,
): string {
  return `${userId}/${receiptId}/${safeFileName}`;
}

export async function createReceiptPreviewUrl(
  supabase: SupabaseClient<Database>,
  filePath: string,
): Promise<string | null> {
  const { data, error } = await supabase.storage
    .from(RECEIPT_BUCKET)
    .createSignedUrl(filePath, 60 * 10);

  if (error || !data?.signedUrl) {
    return null;
  }

  return data.signedUrl;
}
