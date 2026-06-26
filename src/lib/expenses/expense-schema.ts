import { z } from "zod";
import {
  DEFAULT_FINANCE_OPTIONS,
  isCategoryAllowed,
  isExpenseTypeAllowed,
  isPaymentMethodAllowed,
  type FinanceOptions,
} from "@/lib/user-settings/finance-options";
import type { ExpenseDraft, ExpenseFormErrors } from "@/types/finance";
import { parseCurrencyToCents } from "./money";

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
  });

export type ValidExpenseDraft = z.infer<typeof expenseDraftSchema>;

export type ExpenseValidationResult =
  | { ok: true; data: ValidExpenseDraft; amountInCents: number }
  | { ok: false; errors: ExpenseFormErrors };

export function validateExpenseDraft(
  draft: ExpenseDraft,
  options: FinanceOptions = DEFAULT_FINANCE_OPTIONS,
): ExpenseValidationResult {
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

  if (!isCategoryAllowed(result.data.categoryId, options)) {
    return { ok: false, errors: { categoryId: "Escolha uma categoria válida." } };
  }

  if (!isExpenseTypeAllowed(result.data.expenseTypeId, options)) {
    return { ok: false, errors: { expenseTypeId: "Escolha um tipo válido." } };
  }

  if (!isPaymentMethodAllowed(result.data.paymentMethod, options)) {
    return { ok: false, errors: { paymentMethod: "Escolha uma forma de pagamento válida." } };
  }

  return { ok: true, data: result.data, amountInCents };
}
