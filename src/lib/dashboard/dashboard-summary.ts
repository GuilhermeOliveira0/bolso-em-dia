import { getCategoryName } from "@/lib/categories/default-categories";
import { calculatePossibleSavingsInCents } from "@/lib/dashboard/savings-calculation";
import { getExpenseTypeName } from "@/lib/expense-types/default-expense-types";
import type { Expense } from "@/types/finance";

export type DashboardPeriod = {
  month: number;
  year: number;
};

export type DashboardDateRange = {
  startDate: string;
  endDate: string;
};

export type DashboardGroup = {
  id: string;
  name: string;
  totalInCents: number;
};

export type DashboardSummary = {
  expenses: Expense[];
  expenseCount: number;
  totalInCents: number;
  necessaryInCents: number;
  leisureInCents: number;
  superfluousInCents: number;
  possibleSavingsInCents: number;
  byCategory: DashboardGroup[];
  byType: DashboardGroup[];
  topExpenses: Expense[];
};

function isExpenseInPeriod(expense: Expense, period: DashboardPeriod): boolean {
  if (!expense.date) {
    return false;
  }

  const [year, month] = expense.date.split("-").map(Number);
  return Number.isInteger(year) && Number.isInteger(month) && year === period.year && month === period.month;
}

function groupExpenses(
  expenses: Expense[],
  getId: (expense: Expense) => string,
  getName: (id: string) => string,
): DashboardGroup[] {
  const totals = new Map<string, number>();

  for (const expense of expenses) {
    const id = getId(expense);
    totals.set(id, (totals.get(id) ?? 0) + expense.amountInCents);
  }

  return Array.from(totals, ([id, totalInCents]) => ({
    id,
    name: getName(id),
    totalInCents,
  })).sort((a, b) => b.totalInCents - a.totalInCents || a.name.localeCompare(b.name));
}

export function buildDashboardSummary(
  expenses: Expense[],
  period: DashboardPeriod,
): DashboardSummary {
  const periodExpenses = expenses
    .filter((expense) => isExpenseInPeriod(expense, period))
    .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt));

  const totalForType = (typeId: string) =>
    periodExpenses
      .filter((expense) => expense.expenseTypeId === typeId)
      .reduce((total, expense) => total + expense.amountInCents, 0);

  const superfluousInCents = totalForType("superfluo");

  return {
    expenses: periodExpenses,
    expenseCount: periodExpenses.length,
    totalInCents: periodExpenses.reduce((total, expense) => total + expense.amountInCents, 0),
    necessaryInCents: totalForType("necessario"),
    leisureInCents: totalForType("lazer"),
    superfluousInCents,
    possibleSavingsInCents: calculatePossibleSavingsInCents(periodExpenses),
    byCategory: groupExpenses(periodExpenses, (expense) => expense.categoryId, getCategoryName),
    byType: groupExpenses(periodExpenses, (expense) => expense.expenseTypeId, getExpenseTypeName),
    topExpenses: [...periodExpenses]
      .sort((a, b) => b.amountInCents - a.amountInCents || b.date.localeCompare(a.date))
      .slice(0, 5),
  };
}

export function parseDashboardPeriod(
  monthValue: string | string[] | undefined,
  yearValue: string | string[] | undefined,
  now = new Date(),
): DashboardPeriod {
  const month = Number(Array.isArray(monthValue) ? monthValue[0] : monthValue);
  const year = Number(Array.isArray(yearValue) ? yearValue[0] : yearValue);

  return {
    month: Number.isInteger(month) && month >= 1 && month <= 12 ? month : now.getMonth() + 1,
    year: Number.isInteger(year) && year >= 2000 && year <= 2100 ? year : now.getFullYear(),
  };
}

export function getDashboardDateRange(period: DashboardPeriod): DashboardDateRange {
  const startDate = `${period.year}-${String(period.month).padStart(2, "0")}-01`;
  const nextMonth = period.month === 12 ? 1 : period.month + 1;
  const nextYear = period.month === 12 ? period.year + 1 : period.year;

  return {
    startDate,
    endDate: `${nextYear}-${String(nextMonth).padStart(2, "0")}-01`,
  };
}

export function getDashboardYears(selectedYear: number, now = new Date()): number[] {
  const currentYear = now.getFullYear();
  return Array.from(new Set([selectedYear, ...Array.from({ length: 6 }, (_, index) => currentYear - index)]))
    .sort((a, b) => b - a);
}
