import { ALL_KNOWN_CATEGORIES, DEFAULT_CATEGORIES } from "@/lib/categories/default-categories";
import { DEFAULT_EXPENSE_TYPES } from "@/lib/expense-types/default-expense-types";
import { DEFAULT_PAYMENT_METHODS } from "@/lib/payment-methods/default-payment-methods";
import type { Category, ExpenseType, PaymentMethod } from "@/types/finance";

export type FinanceOptions = {
  categories: Category[];
  expenseTypes: ExpenseType[];
  paymentMethods: PaymentMethod[];
};

export const DEFAULT_FINANCE_OPTIONS: FinanceOptions = {
  categories: DEFAULT_CATEGORIES,
  expenseTypes: DEFAULT_EXPENSE_TYPES,
  paymentMethods: DEFAULT_PAYMENT_METHODS,
};

export type FinanceOptionMaps = {
  categoryNames: Map<string, string>;
  expenseTypeNames: Map<string, string>;
  paymentMethodNames: Map<string, string>;
};

type HiddenDefaultOptions = Partial<Record<keyof FinanceOptions, string[]>>;

function mergeUserOptions<T extends { id: string }>(
  defaults: T[],
  userOptions: T[] = [],
  hiddenDefaultIds: string[] = [],
): T[] {
  const hidden = new Set(hiddenDefaultIds);
  const defaultIds = new Set(defaults.map((option) => option.id));
  const overrides = new Map(userOptions.filter((option) => defaultIds.has(option.id)).map((option) => [option.id, option]));
  const customOptions = userOptions.filter((option) => !defaultIds.has(option.id));

  return [
    ...defaults
      .filter((option) => !hidden.has(option.id))
      .map((option) => overrides.get(option.id) ?? option),
    ...customOptions,
  ];
}

export function buildFinanceOptions(
  customOptions: Partial<FinanceOptions> = {},
  hiddenDefaultOptions: HiddenDefaultOptions = {},
): FinanceOptions {
  return {
    categories: mergeUserOptions(
      DEFAULT_CATEGORIES,
      customOptions.categories,
      hiddenDefaultOptions.categories,
    ),
    expenseTypes: mergeUserOptions(
      DEFAULT_EXPENSE_TYPES,
      customOptions.expenseTypes,
      hiddenDefaultOptions.expenseTypes,
    ),
    paymentMethods: mergeUserOptions(
      DEFAULT_PAYMENT_METHODS,
      customOptions.paymentMethods,
      hiddenDefaultOptions.paymentMethods,
    ),
  };
}

export function buildFinanceOptionMaps(options: FinanceOptions): FinanceOptionMaps {
  return {
    categoryNames: new Map([
      ...ALL_KNOWN_CATEGORIES.map((category) => [category.id, category.name] as const),
      ...options.categories.map((category) => [category.id, category.name] as const),
    ]),
    expenseTypeNames: new Map(
      options.expenseTypes.map((expenseType) => [expenseType.id, expenseType.name] as const),
    ),
    paymentMethodNames: new Map(
      options.paymentMethods.map((paymentMethod) => [paymentMethod.id, paymentMethod.name] as const),
    ),
  };
}

export function getOptionName(
  names: Map<string, string>,
  id: string,
  fallback: string,
): string {
  return names.get(id) ?? fallback;
}

export function isCategoryAllowed(categoryId: string, options: FinanceOptions): boolean {
  return (
    ALL_KNOWN_CATEGORIES.some((category) => category.id === categoryId) ||
    options.categories.some((category) => category.id === categoryId)
  );
}

export function isExpenseTypeAllowed(expenseTypeId: string, options: FinanceOptions): boolean {
  return options.expenseTypes.some((expenseType) => expenseType.id === expenseTypeId);
}

export function isPaymentMethodAllowed(paymentMethod: string, options: FinanceOptions): boolean {
  return options.paymentMethods.some((method) => method.id === paymentMethod);
}
