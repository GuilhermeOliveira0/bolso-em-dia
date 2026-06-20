import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import type { Receipt } from "@/types/finance";

export type CreateReceiptMetadataInput = {
  id: string;
  filePath: string;
  fileName: string;
  fileType: Receipt["fileType"];
  fileSize: number;
};

export type CreateReceiptMetadataResult =
  | { ok: true; receipt: Receipt }
  | { ok: false; message: string };

export interface ReceiptRepository {
  listByUser(userId: string): Promise<Receipt[]>;
  createMetadata(
    userId: string,
    input: CreateReceiptMetadataInput,
  ): Promise<CreateReceiptMetadataResult>;
}

const RECEIPT_COLUMNS =
  "id,user_id,expense_id,file_path,file_name,file_type,file_size,status,created_at,updated_at";

function mapReceiptRow(row: Database["public"]["Tables"]["receipts"]["Row"]): Receipt {
  return {
    id: row.id,
    userId: row.user_id,
    expenseId: row.expense_id,
    filePath: row.file_path,
    fileName: row.file_name,
    fileType: row.file_type,
    fileSize: row.file_size,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export class SupabaseReceiptRepository implements ReceiptRepository {
  constructor(private readonly supabase: SupabaseClient<Database>) {}

  async listByUser(userId: string): Promise<Receipt[]> {
    if (!userId) {
      return [];
    }

    const { data, error } = await this.supabase
      .from("receipts")
      .select(RECEIPT_COLUMNS)
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error("Não foi possível listar seus comprovantes agora.");
    }

    return (data ?? []).map(mapReceiptRow);
  }

  async createMetadata(
    userId: string,
    input: CreateReceiptMetadataInput,
  ): Promise<CreateReceiptMetadataResult> {
    if (!userId) {
      return { ok: false, message: "Entre na sua conta antes de enviar comprovantes." };
    }

    const now = new Date().toISOString();
    const { data, error } = await this.supabase
      .from("receipts")
      .insert({
        id: input.id,
        user_id: userId,
        expense_id: null,
        file_path: input.filePath,
        file_name: input.fileName,
        file_type: input.fileType,
        file_size: input.fileSize,
        status: "uploaded",
        created_at: now,
        updated_at: now,
      })
      .select(RECEIPT_COLUMNS)
      .single();

    if (error || !data) {
      return {
        ok: false,
        message: "Não foi possível salvar o comprovante. Verifique a configuração do banco.",
      };
    }

    return { ok: true, receipt: mapReceiptRow(data) };
  }
}
