"use server";

import type { CreateExpenseResult } from "@/lib/expenses/expense-repository";
import { createServerExpenseRepository } from "@/lib/expenses/server-expense-repository";
import { getAuthenticatedUser } from "@/lib/auth/session";
import type { Expense, ExpenseDraft } from "@/types/finance";

export type ListExpensesResult =
  | { ok: true; expenses: Expense[] }
  | { ok: false; message: string };

export async function listExpensesAction(): Promise<ListExpensesResult> {
  const session = await getAuthenticatedUser();

  if (!session.ok) {
    return { ok: false, message: session.message };
  }

  const repository = await createServerExpenseRepository();
  const expenses = await repository.listByUser(session.user.id);

  return { ok: true, expenses };
}

export async function createManualExpenseAction(
  draft: ExpenseDraft,
): Promise<CreateExpenseResult> {
  const session = await getAuthenticatedUser();

  if (!session.ok) {
    return { ok: false, errors: { amount: session.message } };
  }

  const repository = await createServerExpenseRepository();

  return repository.createManual(session.user.id, draft);
}
