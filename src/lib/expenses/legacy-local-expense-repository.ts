import type { CreateExpenseResult, ExpenseRepository } from "./expense-repository";
import { validateExpenseDraft } from "./expense-schema";
import type { Expense, ExpenseDraft } from "@/types/finance";

const LEGACY_STORAGE_KEY = "bolso-em-dia:expenses:v1";

function readExpenses(): Expense[] {
  if (typeof window === "undefined") return [];

  try {
    const parsed = JSON.parse(window.localStorage.getItem(LEGACY_STORAGE_KEY) ?? "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeExpenses(expenses: Expense[]): void {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(LEGACY_STORAGE_KEY, JSON.stringify(expenses));
  }
}

export class LegacyLocalExpenseRepository implements ExpenseRepository {
  async listByUser(userId: string): Promise<Expense[]> {
    return readExpenses()
      .filter((expense) => expense.userId === userId)
      .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt));
  }

  async listByUserInDateRange(
    userId: string,
    startDate: string,
    endDate: string,
  ): Promise<Expense[]> {
    return (await this.listByUser(userId)).filter(
      (expense) => expense.date >= startDate && expense.date < endDate,
    );
  }

  async createManual(userId: string, draft: ExpenseDraft): Promise<CreateExpenseResult> {
    const validation = validateExpenseDraft(draft);
    if (!validation.ok) return { ok: false, errors: validation.errors };
    if (!userId) {
      return { ok: false, errors: { amount: "Usuário obrigatório para salvar gasto." } };
    }

    const now = new Date().toISOString();
    const expense: Expense = {
      id: crypto.randomUUID(),
      userId,
      amountInCents: validation.amountInCents,
      description: validation.data.description,
      date: validation.data.date,
      categoryId: validation.data.categoryId,
      expenseTypeId: validation.data.expenseTypeId,
      paymentMethod: validation.data.paymentMethod,
      source: "manual",
      createdAt: now,
      updatedAt: now,
    };

    writeExpenses([...readExpenses(), expense]);
    return { ok: true, expense };
  }
}
