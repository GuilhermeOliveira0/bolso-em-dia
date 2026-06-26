import { isKnownCategoryId } from "@/lib/categories/default-categories";
import { DEFAULT_EXPENSE_TYPES } from "@/lib/expense-types/default-expense-types";
import { DEFAULT_PAYMENT_METHODS } from "@/lib/payment-methods/default-payment-methods";
import type { Expense } from "@/types/finance";

export type StatementFilters = {
  query: string;
  categoryId: string;
  expenseTypeId: string;
  paymentMethod: string;
};

const expenseTypeIds = new Set(DEFAULT_EXPENSE_TYPES.map((type) => type.id));
const paymentMethodIds = new Set(DEFAULT_PAYMENT_METHODS.map((method) => method.id));

function getSingleValue(value: string | string[] | undefined): string {
  return (Array.isArray(value) ? value[0] : value)?.trim() ?? "";
}

export function normalizeStatementText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();
}

export function parseStatementFilters(
  query: Record<string, string | string[] | undefined>,
): StatementFilters {
  const categoryId = getSingleValue(query.categoryId);
  const expenseTypeId = getSingleValue(query.expenseTypeId);
  const paymentMethod = getSingleValue(query.paymentMethod);

  return {
    query: getSingleValue(query.q).slice(0, 80),
    categoryId: categoryId && isKnownCategoryId(categoryId) ? categoryId : "",
    expenseTypeId: expenseTypeId && expenseTypeIds.has(expenseTypeId) ? expenseTypeId : "",
    paymentMethod: paymentMethod && paymentMethodIds.has(paymentMethod) ? paymentMethod : "",
  };
}

export function filterStatementExpenses(
  expenses: Expense[],
  filters: StatementFilters,
  getSearchableText: (expense: Expense) => string,
): Expense[] {
  const normalizedQuery = normalizeStatementText(filters.query);

  return expenses.filter((expense) => {
    const matchesQuery =
      !normalizedQuery || normalizeStatementText(getSearchableText(expense)).includes(normalizedQuery);
    const matchesCategory = !filters.categoryId || expense.categoryId === filters.categoryId;
    const matchesType = !filters.expenseTypeId || expense.expenseTypeId === filters.expenseTypeId;
    const matchesPayment = !filters.paymentMethod || expense.paymentMethod === filters.paymentMethod;

    return matchesQuery && matchesCategory && matchesType && matchesPayment;
  });
}
