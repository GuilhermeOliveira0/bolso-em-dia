import { describe, expect, it } from "vitest";
import { parseStatementPeriod } from "@/lib/expenses/statement-period";

const now = new Date("2026-06-25T12:00:00");

describe("parseStatementPeriod", () => {
  it("uses the current month by default", () => {
    expect(parseStatementPeriod({}, now)).toMatchObject({
      preset: "current-month",
      startDate: "2026-06-01",
      endDate: "2026-07-01",
      label: "Junho de 2026",
    });
  });

  it("builds last month and rolling ranges", () => {
    expect(parseStatementPeriod({ period: "last-month" }, now)).toMatchObject({
      startDate: "2026-05-01",
      endDate: "2026-06-01",
    });
    expect(parseStatementPeriod({ period: "last-7-days" }, now)).toMatchObject({
      startDate: "2026-06-19",
      endDate: "2026-06-26",
    });
    expect(parseStatementPeriod({ period: "last-30-days" }, now)).toMatchObject({
      startDate: "2026-05-27",
      endDate: "2026-06-26",
    });
  });

  it("uses direct date fields as an inclusive range with an exclusive end", () => {
    expect(
      parseStatementPeriod(
        { startDate: "2026-06-10", endDate: "2026-06-12" },
        now,
      ),
    ).toMatchObject({
      startDate: "2026-06-10",
      endDate: "2026-06-13",
      customStartDate: "2026-06-10",
      customEndDate: "2026-06-12",
    });
  });

  it("falls back safely when a custom range is invalid", () => {
    expect(
      parseStatementPeriod(
        { startDate: "2026-06-12", endDate: "2026-06-10" },
        now,
      ),
    ).toMatchObject({
      preset: "current-month",
      startDate: "2026-06-01",
      endDate: "2026-07-01",
    });
  });
});
