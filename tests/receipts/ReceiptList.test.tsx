import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ReceiptList } from "@/components/receipts/ReceiptList";
import type { ReceiptWithPreview } from "@/types/finance";

function createReceipt(id: string): ReceiptWithPreview {
  return {
    id,
    userId: "user-1",
    expenseId: null,
    filePath: `${id}.jpg`,
    fileName: `${id}.jpg`,
    fileType: "image/jpeg",
    fileSize: 65 * 1024,
    status: "uploaded",
    ocrStatus: "pending",
    ocrText: null,
    extractedAmountInCents: null,
    extractedDate: null,
    extractedRecipient: null,
    ocrConfidence: null,
    processedAt: null,
    createdAt: "2026-06-19T21:31:00.000Z",
    updatedAt: "2026-06-19T21:31:00.000Z",
    previewUrl: null,
  };
}

describe("ReceiptList", () => {
  it("desabilita todos os botoes de leitura enquanto um OCR esta em andamento", () => {
    render(
      <ReceiptList
        onReadReceipt={vi.fn()}
        readingReceiptId="receipt-1"
        receipts={[createReceipt("receipt-1"), createReceipt("receipt-2")]}
      />,
    );

    expect(screen.getByRole("button", { name: "Lendo..." })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Ler comprovante" })).toBeDisabled();
  });
});
