import { describe, expect, it } from "vitest";
import {
  filterStatementExpenses,
  parseStatementFilters,
} from "@/lib/expenses/statement-filters";
import type { Expense } from "@/types/finance";

function expense(overrides: Partial<Expense>): Expense {
  return {
    id: "expense-1",
    userId: "user-a",
    amountInCents: 1000,
    description: "Mercado central",
    date: "2026-06-10",
    categoryId: "mercado",
    expenseTypeId: "necessario",
    paymentMethod: "pix",
    source: "manual",
    createdAt: "2026-06-10T12:00:00.000Z",
    updatedAt: "2026-06-10T12:00:00.000Z",
    ...overrides,
  };
}

describe("statement filters", () => {
  it("parses optional filters independently", () => {
    expect(parseStatementFilters({ q: "uber", categoryId: "mercado" })).toEqual({
      query: "uber",
      categoryId: "mercado",
      expenseTypeId: "",
      paymentMethod: "",
    });
  });

  it("combines search, category, type and payment filters", () => {
    const expenses = [
      expense({ id: "match", description: "Uber viagem", categoryId: "transporte", paymentMethod: "pix" }),
      expense({ id: "wrong-payment", description: "Uber viagem", categoryId: "transporte", paymentMethod: "credito" }),
      expense({ id: "wrong-query", description: "Mercado", categoryId: "transporte", paymentMethod: "pix" }),
    ];

    const filtered = filterStatementExpenses(
      expenses,
      {
        query: "uber",
        categoryId: "transporte",
        expenseTypeId: "necessario",
        paymentMethod: "pix",
      },
      (item) => item.description,
    );

    expect(filtered.map((item) => item.id)).toEqual(["match"]);
  });
});
