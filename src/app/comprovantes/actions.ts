"use server";

import { revalidatePath } from "next/cache";
import { getAuthenticatedUser } from "@/lib/auth/session";
import { RECEIPT_BUCKET, validateReceiptFile } from "@/lib/receipts/receipt-file-schema";
import { createServerReceiptRepository } from "@/lib/receipts/server-receipt-repository";
import { buildReceiptFilePath } from "@/lib/receipts/receipt-storage";
import { createClient } from "@/lib/supabase/server";

export type UploadReceiptResult =
  | { ok: true; message: string }
  | { ok: false; message: string };

function createReceiptId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `receipt-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export async function uploadReceiptAction(formData: FormData): Promise<UploadReceiptResult> {
  const session = await getAuthenticatedUser();

  if (!session.ok) {
    return { ok: false, message: session.message };
  }

  const validation = validateReceiptFile(formData.get("receipt"));

  if (!validation.ok) {
    return validation;
  }

  const supabase = await createClient();
  const receiptId = createReceiptId();
  const filePath = buildReceiptFilePath(
    session.user.id,
    receiptId,
    validation.safeFileName,
  );

  const { error: uploadError } = await supabase.storage
    .from(RECEIPT_BUCKET)
    .upload(filePath, validation.file, {
      contentType: validation.fileType,
      upsert: false,
    });

  if (uploadError) {
    return {
      ok: false,
      message: "Não foi possível enviar o comprovante. Verifique o Storage do Supabase.",
    };
  }

  const repository = await createServerReceiptRepository();
  const result = await repository.createMetadata(session.user.id, {
    id: receiptId,
    filePath,
    fileName: validation.safeFileName,
    fileType: validation.fileType,
    fileSize: validation.file.size,
  });

  if (!result.ok) {
    await supabase.storage.from(RECEIPT_BUCKET).remove([filePath]);
    return result;
  }

  revalidatePath("/comprovantes");
  revalidatePath("/lancamentos");

  return { ok: true, message: "Comprovante enviado com segurança." };
}
