import { createReceiptPreviewUrl } from "@/lib/receipts/receipt-storage";
import { createClient } from "@/lib/supabase/server";
import type { Receipt, ReceiptWithPreview } from "@/types/finance";

export async function buildReceiptsWithPreview(
  receipts: Receipt[],
): Promise<ReceiptWithPreview[]> {
  const supabase = await createClient();

  return Promise.all(
    receipts.map(async (receipt) => ({
      ...receipt,
      previewUrl: await createReceiptPreviewUrl(supabase, receipt.filePath),
    })),
  );
}
