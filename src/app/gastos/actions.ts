"use server";

import { createClient } from "@/lib/supabase/server";
import { SupabaseExpenseRepository, type CreateExpenseResult } from "@/lib/expenses/expense-repository";
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

  const supabase = await createClient();
  const repository = new SupabaseExpenseRepository(supabase);
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

  const supabase = await createClient();
  const repository = new SupabaseExpenseRepository(supabase);

  return repository.createManual(session.user.id, draft);
}
