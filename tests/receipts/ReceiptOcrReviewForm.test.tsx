import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { ReceiptOcrReview } from "@/app/lancamentos/actions";
import { ReceiptOcrReviewForm } from "@/components/receipts/ReceiptOcrReviewForm";

function buildReview(overrides: Partial<ReceiptOcrReview> = {}): ReceiptOcrReview {
  return {
    receiptId: "receipt-1",
    amount: "42,90",
    date: "2026-06-23",
    recipient: "iFood",
    description: "Pix para iFood",
    categoryId: "alimentacao",
    expenseTypeId: "lazer",
    paymentMethod: "pix",
    confidence: 0.82,
    fieldsNeedReview: [],
    classificationSuggestion: {
      confidence: "high",
      matchedKeyword: "ifood",
      reason: "Sugestão por palavra-chave no recebedor.",
    },
    ...overrides,
  };
}

describe("ReceiptOcrReviewForm", () => {
  it("mostra sugestão automática editável na revisão OCR", () => {
    const onChange = vi.fn();

    render(
      <ReceiptOcrReviewForm
        errors={{}}
        isSubmitting={false}
        review={buildReview()}
        onCancel={vi.fn()}
        onChange={onChange}
        onSubmit={vi.fn()}
      />,
    );

    expect(screen.getByText(/Sugestão automática/i)).toBeInTheDocument();
    expect(screen.getByText((text) => text.includes("Alimentação / Lazer"))).toBeInTheDocument();
    expect(screen.getByText(/ifood/i)).toBeInTheDocument();
    const categorySelect = screen.getByRole("combobox", { name: "Categoria" });
    const expenseTypeSelect = screen.getByRole("combobox", { name: "Tipo do gasto" });
    expect(categorySelect).toHaveValue("alimentacao");
    expect(expenseTypeSelect).toHaveValue("lazer");

    fireEvent.change(categorySelect, { target: { value: "mercado" } });
    fireEvent.change(expenseTypeSelect, { target: { value: "necessario" } });

    expect(onChange).toHaveBeenCalledWith("categoryId", "mercado");
    expect(onChange).toHaveBeenCalledWith("expenseTypeId", "necessario");
  });

  it("indica revisão manual quando a classificação tem baixa confiança", () => {
    render(
      <ReceiptOcrReviewForm
        errors={{}}
        isSubmitting={false}
        review={buildReview({
          categoryId: "",
          expenseTypeId: "",
          classificationSuggestion: {
            confidence: "low",
            matchedKeyword: "",
            reason: "Não encontramos uma palavra-chave confiável. Revise manualmente.",
          },
        })}
        onCancel={vi.fn()}
        onChange={vi.fn()}
        onSubmit={vi.fn()}
      />,
    );

    expect(screen.getByText(/Não encontramos uma palavra-chave confiável/i)).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "Categoria" })).toHaveValue("");
    expect(screen.getByRole("combobox", { name: "Tipo do gasto" })).toHaveValue("");
    expect(screen.getAllByText("Precisa revisar").length).toBeGreaterThanOrEqual(2);
  });
});
