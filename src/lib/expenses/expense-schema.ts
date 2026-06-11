import { z } from "zod";
import { DEFAULT_CATEGORIES } from "@/lib/categories/default-categories";
import { DEFAULT_EXPENSE_TYPES } from "@/lib/expense-types/default-expense-types";
import { DEFAULT_PAYMENT_METHODS } from "@/lib/payment-methods/default-payment-methods";
import type { ExpenseDraft, ExpenseFormErrors } from "@/types/finance";
import { parseCurrencyToCents } from "./money";

const categoryIds = new Set(DEFAULT_CATEGORIES.map((category) => category.id));
const expenseTypeIds = new Set(DEFAULT_EXPENSE_TYPES.map((type) => type.id));
const paymentMethodIds = new Set(DEFAULT_PAYMENT_METHODS.map((method) => method.id));

export const expenseDraftSchema = z
  .object({
    amount: z.string().trim().min(1, "Informe o valor do gasto."),
    description: z.string().trim().max(80, "Use até 80 caracteres."),
    date: z.string().trim().min(1, "Informe a data do gasto."),
    categoryId: z.string().trim().min(1, "Escolha uma categoria."),
    expenseTypeId: z.string().trim().min(1, "Escolha o tipo do gasto."),
    paymentMethod: z.string().trim().min(1, "Escolha a forma de pagamento."),
  })
  .superRefine((draft, ctx) => {
    const amountInCents = parseCurrencyToCents(draft.amount);

    if (amountInCents === null) {
      ctx.addIssue({
        code: "custom",
        path: ["amount"],
        message: "Informe um valor válido.",
      });
    } else if (amountInCents <= 0) {
      ctx.addIssue({
        code: "custom",
        path: ["amount"],
        message: "O valor precisa ser maior que zero.",
      });
    }

    if (draft.date && Number.isNaN(new Date(`${draft.date}T00:00:00`).getTime())) {
      ctx.addIssue({
        code: "custom",
        path: ["date"],
        message: "Informe uma data válida.",
      });
    }

    if (draft.categoryId && !categoryIds.has(draft.categoryId)) {
      ctx.addIssue({
        code: "custom",
        path: ["categoryId"],
        message: "Escolha uma categoria válida.",
      });
    }

    if (draft.expenseTypeId && !expenseTypeIds.has(draft.expenseTypeId)) {
      ctx.addIssue({
        code: "custom",
        path: ["expenseTypeId"],
        message: "Escolha um tipo válido.",
      });
    }

    if (draft.paymentMethod && !paymentMethodIds.has(draft.paymentMethod)) {
      ctx.addIssue({
        code: "custom",
        path: ["paymentMethod"],
        message: "Escolha uma forma de pagamento válida.",
      });
    }
  });

export type ValidExpenseDraft = z.infer<typeof expenseDraftSchema>;

export type ExpenseValidationResult =
  | { ok: true; data: ValidExpenseDraft; amountInCents: number }
  | { ok: false; errors: ExpenseFormErrors };

export function validateExpenseDraft(draft: ExpenseDraft): ExpenseValidationResult {
  const result = expenseDraftSchema.safeParse(draft);

  if (!result.success) {
    return {
      ok: false,
      errors: result.error.issues.reduce<ExpenseFormErrors>((errors, issue) => {
        const field = issue.path[0] as keyof ExpenseDraft | undefined;
        if (field && !errors[field]) {
          errors[field] = issue.message;
        }
        return errors;
      }, {}),
    };
  }

  const amountInCents = parseCurrencyToCents(result.data.amount);

  if (amountInCents === null) {
    return { ok: false, errors: { amount: "Informe um valor válido." } };
  }

  return { ok: true, data: result.data, amountInCents };
}
