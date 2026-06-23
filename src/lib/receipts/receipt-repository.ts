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

export type UpdateReceiptOcrInput = {
  status: Receipt["status"];
  ocrText: string | null;
  extractedAmountInCents: number | null;
  extractedDate: string | null;
  extractedRecipient: string | null;
  ocrStatus: Receipt["ocrStatus"];
  ocrConfidence: number | null;
  processedAt: string;
};

export type UpdateReceiptResult =
  | { ok: true; receipt: Receipt }
  | { ok: false; message: string };

export interface ReceiptRepository {
  listByUser(userId: string): Promise<Receipt[]>;
  findByUser(userId: string, receiptId: string): Promise<Receipt | null>;
  createMetadata(
    userId: string,
    input: CreateReceiptMetadataInput,
  ): Promise<CreateReceiptMetadataResult>;
  updateOcrResult(
    userId: string,
    receiptId: string,
    input: UpdateReceiptOcrInput,
  ): Promise<UpdateReceiptResult>;
  linkExpense(userId: string, receiptId: string, expenseId: string): Promise<UpdateReceiptResult>;
}

const RECEIPT_COLUMNS =
  "id,user_id,expense_id,file_path,file_name,file_type,file_size,status,ocr_text,extracted_amount,extracted_date,extracted_recipient,ocr_status,ocr_confidence,processed_at,created_at,updated_at";

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
    ocrText: row.ocr_text,
    extractedAmountInCents: row.extracted_amount,
    extractedDate: row.extracted_date,
    extractedRecipient: row.extracted_recipient,
    ocrStatus: row.ocr_status,
    ocrConfidence: row.ocr_confidence,
    processedAt: row.processed_at,
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

  async findByUser(userId: string, receiptId: string): Promise<Receipt | null> {
    if (!userId || !receiptId) {
      return null;
    }

    const { data, error } = await this.supabase
      .from("receipts")
      .select(RECEIPT_COLUMNS)
      .eq("user_id", userId)
      .eq("id", receiptId)
      .maybeSingle();

    if (error) {
      throw new Error("Não foi possível buscar o comprovante agora.");
    }

    return data ? mapReceiptRow(data) : null;
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

  async updateOcrResult(
    userId: string,
    receiptId: string,
    input: UpdateReceiptOcrInput,
  ): Promise<UpdateReceiptResult> {
    if (!userId || !receiptId) {
      return { ok: false, message: "Entre na sua conta antes de ler comprovantes." };
    }

    const { data, error } = await this.supabase
      .from("receipts")
      .update({
        status: input.status,
        ocr_text: input.ocrText,
        extracted_amount: input.extractedAmountInCents,
        extracted_date: input.extractedDate,
        extracted_recipient: input.extractedRecipient,
        ocr_status: input.ocrStatus,
        ocr_confidence: input.ocrConfidence,
        processed_at: input.processedAt,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId)
      .eq("id", receiptId)
      .select(RECEIPT_COLUMNS)
      .single();

    if (error || !data) {
      return {
        ok: false,
        message: "Não foi possível salvar a leitura do comprovante. Verifique a migration de OCR.",
      };
    }

    return { ok: true, receipt: mapReceiptRow(data) };
  }

  async linkExpense(
    userId: string,
    receiptId: string,
    expenseId: string,
  ): Promise<UpdateReceiptResult> {
    if (!userId || !receiptId || !expenseId) {
      return { ok: false, message: "Não foi possível vincular o comprovante à despesa." };
    }

    const { data, error } = await this.supabase
      .from("receipts")
      .update({
        expense_id: expenseId,
        status: "reviewed",
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId)
      .eq("id", receiptId)
      .select(RECEIPT_COLUMNS)
      .single();

    if (error || !data) {
      return { ok: false, message: "A despesa foi salva, mas o comprovante não foi vinculado." };
    }

    return { ok: true, receipt: mapReceiptRow(data) };
  }
}
