import { beforeEach, describe, expect, it } from "vitest";
import { LegacyLocalExpenseRepository } from "@/lib/expenses/expense-repository";
import type { ExpenseDraft } from "@/types/finance";

const validDraft: ExpenseDraft = {
  amount: "100,50",
  description: "Mercado da semana",
  date: "2026-06-10",
  categoryId: "mercado",
  expenseTypeId: "necessario",
  paymentMethod: "debito",
};

describe("LegacyLocalExpenseRepository", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("creates a manual expense for the current user", async () => {
    const repository = new LegacyLocalExpenseRepository();

    const result = await repository.createManual("user-a", validDraft);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.expense.userId).toBe("user-a");
      expect(result.expense.source).toBe("manual");
      expect(result.expense.amountInCents).toBe(10050);
    }
  });

  it("does not persist invalid expenses", async () => {
    const repository = new LegacyLocalExpenseRepository();

    const result = await repository.createManual("user-a", { ...validDraft, amount: "" });
    const expenses = await repository.listByUser("user-a");

    expect(result.ok).toBe(false);
    expect(expenses).toHaveLength(0);
  });

  it("lists only expenses owned by the requested user", async () => {
    const repository = new LegacyLocalExpenseRepository();

    await repository.createManual("user-a", validDraft);
    await repository.createManual("user-b", {
      ...validDraft,
      description: "Compra de outro usuário",
      categoryId: "compras",
    });

    const expenses = await repository.listByUser("user-a");

    expect(expenses).toHaveLength(1);
    expect(expenses[0].userId).toBe("user-a");
    expect(expenses[0].description).toBe("Mercado da semana");
  });

  it("does not create an expense without an owner", async () => {
    const repository = new LegacyLocalExpenseRepository();

    const result = await repository.createManual("", validDraft);
    const expenses = await repository.listByUser("");

    expect(result.ok).toBe(false);
    expect(expenses).toHaveLength(0);
  });
});
