import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  confirmReceiptExpenseAction,
  processReceiptOcrAction,
  type ReceiptOcrReview,
} from "@/app/lancamentos/actions";
import { createManualExpenseAction } from "@/app/gastos/actions";
import { LaunchpadApp } from "@/components/launchpad/LaunchpadApp";
import type { ReceiptWithPreview } from "@/types/finance";

const refresh = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh }),
}));

vi.mock("@/app/gastos/actions", () => ({
  createManualExpenseAction: vi.fn(),
}));

vi.mock("@/app/lancamentos/actions", () => ({
  confirmReceiptExpenseAction: vi.fn(),
  processReceiptOcrAction: vi.fn(),
}));

function createReceipt(id = "receipt-1"): ReceiptWithPreview {
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

function createReview(receiptId = "receipt-1"): ReceiptOcrReview {
  return {
    receiptId,
    amount: "",
    date: "2026-06-19",
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
      reason: "Revise manualmente.",
    },
  };
}

function renderLaunchpad() {
  render(
    <LaunchpadApp
      receipts={[createReceipt()]}
      user={{
        id: "user-1",
        email: "guilherme@example.com",
        name: "Guilherme",
      }}
    />,
  );
}

describe("LaunchpadApp OCR flow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(createManualExpenseAction).mockResolvedValue({
      ok: true,
      expense: {
        id: "expense-1",
        userId: "user-1",
        amountInCents: 1000,
        description: "Teste",
        date: "2026-06-19",
        categoryId: "mercado",
        expenseTypeId: "necessario",
        paymentMethod: "Pix",
        source: "manual",
        createdAt: "2026-06-19T21:31:00.000Z",
        updatedAt: "2026-06-19T21:31:00.000Z",
      },
    });
    vi.mocked(confirmReceiptExpenseAction).mockResolvedValue({
      ok: true,
      expense: {
        id: "expense-1",
        userId: "user-1",
        amountInCents: 1000,
        description: "Teste",
        date: "2026-06-19",
        categoryId: "mercado",
        expenseTypeId: "necessario",
        paymentMethod: "Pix",
        source: "ocr",
        createdAt: "2026-06-19T21:31:00.000Z",
        updatedAt: "2026-06-19T21:31:00.000Z",
      },
    });
  });

  it("abre revisao manual quando o OCR retorna falha controlada", async () => {
    vi.mocked(processReceiptOcrAction).mockResolvedValueOnce({
      ok: true,
      message: "Não conseguimos ler o comprovante agora. Você pode preencher manualmente.",
      review: createReview(),
    });

    renderLaunchpad();

    fireEvent.click(screen.getByRole("button", { name: "Ler comprovante" }));

    expect(screen.getByRole("button", { name: "Lendo..." })).toBeDisabled();
    expect(
      await screen.findByText("Não conseguimos ler o comprovante agora. Você pode preencher manualmente."),
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Revise antes de salvar" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Ler comprovante" })).toBeEnabled();
  });

  it("finaliza o loading e mostra erro quando a action rejeita", async () => {
    vi.mocked(processReceiptOcrAction).mockRejectedValueOnce(new Error("unexpected"));

    renderLaunchpad();

    fireEvent.click(screen.getByRole("button", { name: "Ler comprovante" }));

    expect(screen.getByRole("button", { name: "Lendo..." })).toBeDisabled();
    expect(
      await screen.findByText("Não conseguimos ler o comprovante agora. Você pode preencher manualmente."),
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Ler comprovante" })).toBeEnabled();
    });
  });
});
