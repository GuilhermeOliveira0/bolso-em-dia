import { createClient } from "@/lib/supabase/server";
import { SupabaseReceiptRepository, type ReceiptRepository } from "./receipt-repository";

export async function createServerReceiptRepository(): Promise<ReceiptRepository> {
  return new SupabaseReceiptRepository(await createClient());
}
