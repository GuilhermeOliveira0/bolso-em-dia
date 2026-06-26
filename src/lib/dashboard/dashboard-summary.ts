import { getCategoryName } from "@/lib/categories/default-categories";
import { calculatePossibleSavingsInCents } from "@/lib/dashboard/savings-calculation";
import { getExpenseTypeName } from "@/lib/expense-types/default-expense-types";
import {
  buildFinanceOptionMaps,
  DEFAULT_FINANCE_OPTIONS,
  getOptionName,
  type FinanceOptions,
} from "@/lib/user-settings/finance-options";
import type { Expense } from "@/types/finance";

export type DashboardPeriodMode = "all" | "month" | "custom";

export type DashboardPeriod = {
  mode: DashboardPeriodMode;
  month: number;
  year: number;
  startDate: string;
  endDate: string;
  label: string;
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

function toDateInput(date: Date): string {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

function addDays(date: Date, days: number): Date {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
}

function parseSingle(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function parseDate(value: string | string[] | undefined): string {
  const date = parseSingle(value);
  return /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : "";
}

function formatMonthLabel(month: number, year: number): string {
  const label = new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric",
  }).format(new Date(year, month - 1, 1));

  return label.charAt(0).toUpperCase() + label.slice(1);
}

function isExpenseInPeriod(expense: Expense, period: DashboardPeriod): boolean {
  if (period.mode === "all") {
    return Boolean(expense.date);
  }

  return Boolean(expense.date) && expense.date >= period.startDate && expense.date < period.endDate;
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
  financeOptions: FinanceOptions = DEFAULT_FINANCE_OPTIONS,
): DashboardSummary {
  const optionNames = buildFinanceOptionMaps(financeOptions);
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
    byCategory: groupExpenses(periodExpenses, (expense) => expense.categoryId, (id) =>
      getOptionName(optionNames.categoryNames, id, getCategoryName(id)),
    ),
    byType: groupExpenses(periodExpenses, (expense) => expense.expenseTypeId, (id) =>
      getOptionName(optionNames.expenseTypeNames, id, getExpenseTypeName(id)),
    ),
    topExpenses: [...periodExpenses]
      .sort((a, b) => b.amountInCents - a.amountInCents || b.date.localeCompare(a.date))
      .slice(0, 5),
  };
}

export function parseDashboardPeriod(
  query: Record<string, string | string[] | undefined>,
  now = new Date(),
): DashboardPeriod {
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();
  const mode = parseSingle(query.dashboardPeriod);
  const startDate = parseDate(query.startDate);
  const endDateInput = parseDate(query.endDate);

  if ((mode === "custom" || startDate || endDateInput) && (startDate || endDateInput)) {
    const rangeStart = startDate || endDateInput;
    const rangeEndInput = endDateInput || startDate;

    if (rangeStart && rangeEndInput && rangeStart <= rangeEndInput) {
      return {
        mode: "custom",
        month: currentMonth,
        year: currentYear,
        startDate: rangeStart,
        endDate: toDateInput(addDays(new Date(`${rangeEndInput}T00:00:00`), 1)),
        label: rangeStart === rangeEndInput ? rangeStart : "Período selecionado",
      };
    }
  }

  if (mode === "month") {
    const month = Number(parseSingle(query.month));
    const year = Number(parseSingle(query.year));
    const safeMonth = Number.isInteger(month) && month >= 1 && month <= 12 ? month : currentMonth;
    const safeYear = Number.isInteger(year) && year >= 2000 && year <= 2100 ? year : currentYear;
    const nextMonth = safeMonth === 12 ? 1 : safeMonth + 1;
    const nextYear = safeMonth === 12 ? safeYear + 1 : safeYear;

    return {
      mode: "month",
      month: safeMonth,
      year: safeYear,
      startDate: `${safeYear}-${String(safeMonth).padStart(2, "0")}-01`,
      endDate: `${nextYear}-${String(nextMonth).padStart(2, "0")}-01`,
      label: formatMonthLabel(safeMonth, safeYear),
    };
  }

  return {
    mode: "all",
    month: currentMonth,
    year: currentYear,
    startDate: "",
    endDate: "",
    label: "Todos os gastos",
  };
}

export function getDashboardDateRange(period: DashboardPeriod): DashboardDateRange | null {
  if (period.mode === "all") {
    return null;
  }

  return {
    startDate: period.startDate,
    endDate: period.endDate,
  };
}

export function getDashboardYears(selectedYear: number, now = new Date()): number[] {
  const currentYear = now.getFullYear();
  return Array.from(new Set([selectedYear, ...Array.from({ length: 6 }, (_, index) => currentYear - index)]))
    .sort((a, b) => b - a);
}
