import type { ExpenseType } from "@/types/finance";

export const DEFAULT_EXPENSE_TYPES: ExpenseType[] = [
  {
    id: "necessario",
    name: "Necessário",
    description: "Gasto essencial para rotina e segurança.",
    sortOrder: 1,
  },
  {
    id: "importante",
    name: "Importante",
    description: "Gasto relevante, mas com alguma flexibilidade.",
    sortOrder: 2,
  },
  {
    id: "lazer",
    name: "Lazer",
    description: "Gasto ligado a descanso, diversão ou convivência.",
    sortOrder: 3,
  },
  {
    id: "superfluo",
    name: "Supérfluo",
    description: "Gasto que pode ser reduzido com menor impacto.",
    sortOrder: 4,
  },
  {
    id: "investimento",
    name: "Investimento",
    description: "Gasto voltado a construção de patrimônio ou futuro.",
    sortOrder: 5,
  },
  {
    id: "divida",
    name: "Dívida",
    description: "Pagamento de dívida, parcela, juros ou financiamento.",
    sortOrder: 6,
  },
];

export function getExpenseTypeName(expenseTypeId: string): string {
  return DEFAULT_EXPENSE_TYPES.find((type) => type.id === expenseTypeId)?.name ?? "Tipo";
}
