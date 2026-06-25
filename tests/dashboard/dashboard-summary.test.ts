import { describe, expect, it } from "vitest";
import {
  buildDashboardSummary,
  getDashboardDateRange,
  getDashboardYears,
} from "@/lib/dashboard/dashboard-summary";
import type { Expense } from "@/types/finance";

function expense(overrides: Partial<Expense>): Expense {
  return {
    id: "expense-1",
    userId: "user-a",
    amountInCents: 1000,
    description: "Gasto de teste",
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

describe("buildDashboardSummary", () => {
  it("uses only expenses from the selected month and year", () => {
    const summary = buildDashboardSummary(
      [
        expense({ id: "june", amountInCents: 12000, date: "2026-06-10" }),
        expense({ id: "may", amountInCents: 5000, date: "2026-05-31" }),
        expense({ id: "last-year", amountInCents: 7000, date: "2025-06-10" }),
      ],
      { month: 6, year: 2026 },
    );

    expect(summary.totalInCents).toBe(12000);
    expect(summary.expenseCount).toBe(1);
  });

  it("calculates type totals and the explicit savings estimate", () => {
    const summary = buildDashboardSummary(
      [
        expense({ id: "necessary", amountInCents: 20000, expenseTypeId: "necessario" }),
        expense({ id: "leisure", amountInCents: 8000, expenseTypeId: "lazer" }),
        expense({ id: "optional", amountInCents: 6000, expenseTypeId: "superfluo" }),
      ],
      { month: 6, year: 2026 },
    );

    expect(summary.necessaryInCents).toBe(20000);
    expect(summary.leisureInCents).toBe(8000);
    expect(summary.superfluousInCents).toBe(6000);
    expect(summary.possibleSavingsInCents).toBe(3000);
  });

  it("calculates possible savings as 50 percent of Superfluo only", () => {
    const summary = buildDashboardSummary(
      [
        expense({ id: "superfluous", amountInCents: 20000, expenseTypeId: "superfluo" }),
        expense({ id: "necessary", amountInCents: 20000, expenseTypeId: "necessario" }),
        expense({ id: "important", amountInCents: 20000, expenseTypeId: "importante" }),
        expense({ id: "leisure", amountInCents: 20000, expenseTypeId: "lazer" }),
        expense({ id: "investment", amountInCents: 20000, expenseTypeId: "investimento" }),
        expense({ id: "debt", amountInCents: 20000, expenseTypeId: "divida" }),
        expense({ id: "receivable", amountInCents: 20000, expenseTypeId: "a_receber" }),
      ],
      { month: 6, year: 2026 },
    );

    expect(summary.superfluousInCents).toBe(20000);
    expect(summary.possibleSavingsInCents).toBe(10000);
  });

  it("sets possible savings to zero when there are no Superfluo expenses", () => {
    const summary = buildDashboardSummary(
      [
        expense({ id: "necessary", amountInCents: 20000, expenseTypeId: "necessario" }),
        expense({ id: "receivable", amountInCents: 20000, expenseTypeId: "a_receber" }),
      ],
      { month: 6, year: 2026 },
    );

    expect(summary.superfluousInCents).toBe(0);
    expect(summary.possibleSavingsInCents).toBe(0);
  });

  it("ignores expenses without a valid date in the selected period", () => {
    const summary = buildDashboardSummary(
      [
        expense({ id: "valid", amountInCents: 12000, date: "2026-06-10" }),
        expense({ id: "empty-date", amountInCents: 5000, date: "" }),
        expense({ id: "invalid-date", amountInCents: 7000, date: "sem-data" }),
      ],
      { month: 6, year: 2026 },
    );

    expect(summary.expenseCount).toBe(1);
    expect(summary.totalInCents).toBe(12000);
  });

  it("groups summaries and ranks the five largest expenses", () => {
    const expenses = Array.from({ length: 7 }, (_, index) =>
      expense({
        id: `expense-${index}`,
        amountInCents: (index + 1) * 1000,
        categoryId: index < 4 ? "mercado" : "lazer",
        expenseTypeId: index < 4 ? "necessario" : "lazer",
      }),
    );

    const summary = buildDashboardSummary(expenses, { month: 6, year: 2026 });

    expect(summary.byCategory[0]).toMatchObject({ id: "lazer", totalInCents: 18000 });
    expect(summary.byCategory[1]).toMatchObject({ id: "mercado", totalInCents: 10000 });
    expect(summary.byType[0]).toMatchObject({ id: "lazer", totalInCents: 18000 });
    expect(summary.topExpenses).toHaveLength(5);
    expect(summary.topExpenses.map((item) => item.amountInCents)).toEqual([
      7000, 6000, 5000, 4000, 3000,
    ]);
  });

  it("returns a stable empty summary", () => {
    const summary = buildDashboardSummary([], { month: 6, year: 2026 });

    expect(summary.totalInCents).toBe(0);
    expect(summary.byCategory).toEqual([]);
    expect(summary.byType).toEqual([]);
    expect(summary.topExpenses).toEqual([]);
  });

  it("builds an exclusive date range for regular months and December", () => {
    expect(getDashboardDateRange({ month: 6, year: 2026 })).toEqual({
      startDate: "2026-06-01",
      endDate: "2026-07-01",
    });
    expect(getDashboardDateRange({ month: 12, year: 2026 })).toEqual({
      startDate: "2026-12-01",
      endDate: "2027-01-01",
    });
  });

  it("offers recent years while preserving an older selected year", () => {
    expect(getDashboardYears(2020, new Date("2026-06-11T12:00:00Z"))).toEqual([
      2026, 2025, 2024, 2023, 2022, 2021, 2020,
    ]);
  });
});
