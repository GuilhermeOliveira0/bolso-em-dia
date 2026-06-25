import { describe, expect, it } from "vitest";
import { validateExpenseDraft } from "@/lib/expenses/expense-schema";
import type { ExpenseDraft } from "@/types/finance";

const validDraft: ExpenseDraft = {
  amount: "25,90",
  description: "Almoço",
  date: "2026-06-10",
  categoryId: "alimentacao",
  expenseTypeId: "necessario",
  paymentMethod: "pix",
};

describe("validateExpenseDraft", () => {
  it("accepts a valid manual expense draft", () => {
    const result = validateExpenseDraft(validDraft);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.amountInCents).toBe(2590);
    }
  });

  it("rejects missing amount", () => {
    const result = validateExpenseDraft({ ...validDraft, amount: "" });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.amount).toBe("Informe o valor do gasto.");
    }
  });

  it("rejects zero or negative amount", () => {
    const zero = validateExpenseDraft({ ...validDraft, amount: "0" });
    const negative = validateExpenseDraft({ ...validDraft, amount: "-10" });

    expect(zero.ok).toBe(false);
    if (!zero.ok) {
      expect(zero.errors.amount).toBe("O valor precisa ser maior que zero.");
    }

    expect(negative.ok).toBe(false);
    if (!negative.ok) {
      expect(negative.errors.amount).toBe("Informe um valor válido.");
    }
  });

  it("requires date, category, type and payment method", () => {
    const result = validateExpenseDraft({
      ...validDraft,
      date: "",
      categoryId: "",
      expenseTypeId: "",
      paymentMethod: "",
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.date).toBe("Informe a data do gasto.");
      expect(result.errors.categoryId).toBe("Escolha uma categoria.");
      expect(result.errors.expenseTypeId).toBe("Escolha o tipo do gasto.");
      expect(result.errors.paymentMethod).toBe("Escolha a forma de pagamento.");
    }
  });

  it("accepts the new default categories and A Receber expense type", () => {
    const result = validateExpenseDraft({
      ...validDraft,
      categoryId: "mecanica",
      expenseTypeId: "a_receber",
    });

    expect(result.ok).toBe(true);
  });

  it("keeps legacy Transporte data valid for existing expenses", () => {
    const result = validateExpenseDraft({ ...validDraft, categoryId: "transporte" });

    expect(result.ok).toBe(true);
  });
});
