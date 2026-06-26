"use server";

import { revalidatePath } from "next/cache";
import type { DeleteExpenseResult, UpdateExpenseResult } from "@/lib/expenses/expense-repository";
import { createServerExpenseRepository } from "@/lib/expenses/server-expense-repository";
import { getAuthenticatedUser } from "@/lib/auth/session";
import { createServerUserSettingsRepository } from "@/lib/user-settings/server-user-settings-repository";
import type { ExpenseDraft } from "@/types/finance";

function revalidateFinancialViews() {
  revalidatePath("/extrato");
  revalidatePath("/dashboard");
  revalidatePath("/lancamentos");
  revalidatePath("/gastos");
}

export async function updateExpenseAction(
  expenseId: string,
  draft: ExpenseDraft,
): Promise<UpdateExpenseResult> {
  const session = await getAuthenticatedUser();

  if (!session.ok) {
    return { ok: false, errors: {}, message: session.message };
  }

  const [repository, settingsRepository] = await Promise.all([
    createServerExpenseRepository(),
    createServerUserSettingsRepository(),
  ]);
  const settings = await settingsRepository.listFinanceOptions(session.user.id);
  const result = await repository.updateManual(session.user.id, expenseId, draft, settings.options);

  if (result.ok) {
    revalidateFinancialViews();
  }

  return result;
}

export async function deleteExpenseAction(expenseId: string): Promise<DeleteExpenseResult> {
  const session = await getAuthenticatedUser();

  if (!session.ok) {
    return { ok: false, message: session.message };
  }

  const repository = await createServerExpenseRepository();
  const result = await repository.deleteByUser(session.user.id, expenseId);

  if (result.ok) {
    revalidateFinancialViews();
  }

  return result;
}
