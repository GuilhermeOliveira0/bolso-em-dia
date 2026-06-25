import type { Expense } from "@/types/finance";

export const POSSIBLE_SAVINGS_RATE = 0.5;

export function calculatePossibleSavingsInCents(expenses: Expense[]): number {
  const superfluousTotalInCents = expenses
    .filter((expense) => expense.expenseTypeId === "superfluo")
    .reduce((total, expense) => total + expense.amountInCents, 0);

  return Math.round(superfluousTotalInCents * POSSIBLE_SAVINGS_RATE);
}
