"use server";

import { revalidatePath } from "next/cache";
import type { CreateExpenseResult } from "@/lib/expenses/expense-repository";
import { formatCentsToCurrency } from "@/lib/expenses/money";
import { getAuthenticatedUser } from "@/lib/auth/session";
import { RECEIPT_BUCKET } from "@/lib/receipts/receipt-file-schema";
import { runReceiptImageOcr } from "@/lib/receipts/receipt-ocr-service";
import {
  classifyExpense,
  type ExpenseClassificationConfidence,
} from "@/lib/expenses/expense-classifier";
import { createServerExpenseRepository } from "@/lib/expenses/server-expense-repository";
import { createServerReceiptRepository } from "@/lib/receipts/server-receipt-repository";
import { createClient } from "@/lib/supabase/server";
import type { ExpenseDraft } from "@/types/finance";

export type ReceiptOcrReviewDraft = ExpenseDraft & {
  receiptId: string;
  recipient: string;
};

export type ReceiptClassificationSuggestion = {
  confidence: ExpenseClassificationConfidence;
  matchedKeyword: string;
  reason: string;
};

export type ReceiptOcrReview = ReceiptOcrReviewDraft & {
  confidence: number;
  fieldsNeedReview: Array<"amount" | "date" | "recipient">;
  classificationSuggestion: ReceiptClassificationSuggestion;
};

export type ProcessReceiptOcrResult =
  | { ok: true; message: string; review: ReceiptOcrReview }
  | { ok: false; message: string };

function createEmptyReview(receiptId: string): ReceiptOcrReview {
  return {
    receiptId,
    amount: "",
    date: new Date().toISOString().slice(0, 10),
    recipient: "",
    description: "",
    categoryId: "",
    expenseTypeId: "",
    paymentMethod: "",
    confidence: 0,
    fieldsNeedReview: ["amount", "date", "recipient"],
    classificationSuggestion: {
      confidence: "low",
      matchedKeyword: "",
      reason: "Não encontramos uma palavra-chave confiável. Revise manualmente.",
    },
  };
}

function buildReviewFromOcr(
  receiptId: string,
  amountInCents: number | null,
  date: string | null,
  recipient: string | null,
  confidence: number | null,
  fieldsNeedReview: ReceiptOcrReview["fieldsNeedReview"],
  ocrText: string,
): ReceiptOcrReview {
  const description = recipient ? `Pix para ${recipient}` : "";
  const classification = classifyExpense({
    recipient,
    description,
    ocrText,
  });
  const hasReliableSuggestion = classification.confidence !== "low";

  return {
    ...createEmptyReview(receiptId),
    amount: amountInCents ? formatCentsToCurrency(amountInCents).replace("R$", "").trim() : "",
    date: date || new Date().toISOString().slice(0, 10),
    recipient: recipient || "",
    description,
    categoryId: hasReliableSuggestion ? classification.suggestedCategory : "",
    expenseTypeId: hasReliableSuggestion ? classification.suggestedType : "",
    confidence: confidence ?? 0,
    fieldsNeedReview,
    classificationSuggestion: {
      confidence: classification.confidence,
      matchedKeyword: classification.matchedKeyword,
      reason: classification.reason,
    },
  };
}

export async function processReceiptOcrAction(
  receiptId: string,
): Promise<ProcessReceiptOcrResult> {
  const session = await getAuthenticatedUser();

  if (!session.ok) {
    return { ok: false, message: session.message };
  }

  const receiptRepository = await createServerReceiptRepository();
  const receipt = await receiptRepository.findByUser(session.user.id, receiptId);

  if (!receipt) {
    return { ok: false, message: "Comprovante não encontrado para a sua conta." };
  }

  const startedAt = new Date().toISOString();
  const processingResult = await receiptRepository.updateOcrResult(session.user.id, receipt.id, {
    status: "processing",
    ocrStatus: "processing",
    ocrText: receipt.ocrText ?? null,
    extractedAmountInCents: receipt.extractedAmountInCents ?? null,
    extractedDate: receipt.extractedDate ?? null,
    extractedRecipient: receipt.extractedRecipient ?? null,
    ocrConfidence: receipt.ocrConfidence ?? null,
    processedAt: startedAt,
  });

  if (!processingResult.ok) {
    return { ok: false, message: processingResult.message };
  }

  const supabase = await createClient();
  const { data: file, error: downloadError } = await supabase.storage
    .from(RECEIPT_BUCKET)
    .download(receipt.filePath);

  if (downloadError || !file) {
    await receiptRepository.updateOcrResult(session.user.id, receipt.id, {
      status: "failed",
      ocrStatus: "failed",
      ocrText: null,
      extractedAmountInCents: null,
      extractedDate: null,
      extractedRecipient: null,
      ocrConfidence: 0,
      processedAt: new Date().toISOString(),
    });

    return {
      ok: true,
      message: "Não foi possível baixar o comprovante. Preencha a revisão manualmente.",
      review: createEmptyReview(receipt.id),
    };
  }

  const imageBuffer = Buffer.from(await file.arrayBuffer());
  const ocrResult = await runReceiptImageOcr(imageBuffer);

  if (!ocrResult.ok) {
    await receiptRepository.updateOcrResult(session.user.id, receipt.id, {
      status: "failed",
      ocrStatus: "failed",
      ocrText: null,
      extractedAmountInCents: null,
      extractedDate: null,
      extractedRecipient: null,
      ocrConfidence: 0,
      processedAt: new Date().toISOString(),
    });

    return {
      ok: true,
      message: ocrResult.message,
      review: createEmptyReview(receipt.id),
    };
  }

  const parsed = ocrResult.result;
  const updateResult = await receiptRepository.updateOcrResult(session.user.id, receipt.id, {
    status: "processed",
    ocrStatus: "processed",
    ocrText: parsed.normalizedText.slice(0, 4000),
    extractedAmountInCents: parsed.amountInCents,
    extractedDate: parsed.date || null,
    extractedRecipient: parsed.recipient || null,
    ocrConfidence: parsed.confidence,
    processedAt: new Date().toISOString(),
  });

  if (!updateResult.ok) {
    return { ok: false, message: updateResult.message };
  }

  return {
    ok: true,
    message: "Leitura concluída. Revise os dados antes de salvar.",
    review: buildReviewFromOcr(
      receipt.id,
      parsed.amountInCents,
      parsed.date || null,
      parsed.recipient || null,
      parsed.confidence,
      parsed.fieldsNeedReview,
      parsed.normalizedText,
    ),
  };
}

export async function confirmReceiptExpenseAction(
  review: ReceiptOcrReviewDraft,
): Promise<CreateExpenseResult> {
  const session = await getAuthenticatedUser();

  if (!session.ok) {
    return { ok: false, errors: { amount: session.message } };
  }

  const receiptRepository = await createServerReceiptRepository();
  const receipt = await receiptRepository.findByUser(session.user.id, review.receiptId);

  if (!receipt) {
    return { ok: false, errors: { amount: "Comprovante não encontrado para a sua conta." } };
  }

  const expenseRepository = await createServerExpenseRepository();
  const description = review.description.trim() || review.recipient.trim();
  const result = await expenseRepository.createFromReceipt(
    session.user.id,
    {
      amount: review.amount,
      date: review.date,
      description,
      categoryId: review.categoryId,
      expenseTypeId: review.expenseTypeId,
      paymentMethod: review.paymentMethod,
    },
    receipt.id,
  );

  if (!result.ok) {
    return result;
  }

  await receiptRepository.linkExpense(session.user.id, receipt.id, result.expense.id);

  revalidatePath("/lancamentos");
  revalidatePath("/extrato");
  revalidatePath("/dashboard");
  revalidatePath("/comprovantes");

  return result;
}
