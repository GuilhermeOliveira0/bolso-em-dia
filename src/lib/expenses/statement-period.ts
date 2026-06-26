export type StatementPeriodPreset =
  | "current-month"
  | "last-month"
  | "last-7-days"
  | "last-30-days";

export type StatementPeriod = {
  preset: StatementPeriodPreset;
  startDate: string;
  endDate: string;
  customStartDate: string;
  customEndDate: string;
  label: string;
};

export const STATEMENT_PERIOD_OPTIONS: Array<{ id: StatementPeriodPreset; label: string }> = [
  { id: "current-month", label: "Este mês" },
  { id: "last-month", label: "Mês passado" },
  { id: "last-7-days", label: "Últimos 7 dias" },
  { id: "last-30-days", label: "Últimos 30 dias" },
];

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

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function formatMonthLabel(date: Date): string {
  const label = new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric",
  }).format(date);

  return label.charAt(0).toUpperCase() + label.slice(1);
}

function parseDateInput(value: string | string[] | undefined): string {
  const date = Array.isArray(value) ? value[0] : value;
  return /^\d{4}-\d{2}-\d{2}$/.test(date ?? "") ? date ?? "" : "";
}

function parsePreset(value: string | string[] | undefined): StatementPeriodPreset {
  const preset = Array.isArray(value) ? value[0] : value;
  return STATEMENT_PERIOD_OPTIONS.some((option) => option.id === preset)
    ? (preset as StatementPeriodPreset)
    : "current-month";
}

function buildCustomPeriod(
  query: Record<string, string | string[] | undefined>,
): StatementPeriod | null {
  const customStartDate = parseDateInput(query.startDate);
  const customEndDate = parseDateInput(query.endDate);

  if (!customStartDate && !customEndDate) {
    return null;
  }

  const startDate = customStartDate || customEndDate;
  const endDateInput = customEndDate || customStartDate;

  if (!startDate || !endDateInput || startDate > endDateInput) {
    return null;
  }

  return {
    preset: "current-month",
    startDate,
    endDate: toDateInput(addDays(new Date(`${endDateInput}T00:00:00`), 1)),
    customStartDate,
    customEndDate,
    label: startDate === endDateInput ? startDate : "Período selecionado",
  };
}

export function parseStatementPeriod(
  query: Record<string, string | string[] | undefined>,
  now = new Date(),
): StatementPeriod {
  const customPeriod = buildCustomPeriod(query);
  if (customPeriod) {
    return customPeriod;
  }

  const preset = parsePreset(query.period);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = addDays(today, 1);

  if (preset === "last-month") {
    const start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const end = startOfMonth(today);

    return {
      preset,
      startDate: toDateInput(start),
      endDate: toDateInput(end),
      customStartDate: "",
      customEndDate: "",
      label: formatMonthLabel(start),
    };
  }

  if (preset === "last-7-days" || preset === "last-30-days") {
    const days = preset === "last-7-days" ? 7 : 30;
    const start = addDays(today, -(days - 1));

    return {
      preset,
      startDate: toDateInput(start),
      endDate: toDateInput(tomorrow),
      customStartDate: "",
      customEndDate: "",
      label: preset === "last-7-days" ? "Últimos 7 dias" : "Últimos 30 dias",
    };
  }

  const start = startOfMonth(today);
  const end = new Date(today.getFullYear(), today.getMonth() + 1, 1);

  return {
    preset: "current-month",
    startDate: toDateInput(start),
    endDate: toDateInput(end),
    customStartDate: "",
    customEndDate: "",
    label: formatMonthLabel(today),
  };
}
