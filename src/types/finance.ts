export type ExpenseSource = "manual";

export type User = {
  id: string;
  email: string;
  name?: string;
  createdAt: string;
};

export type Category = {
  id: string;
  name: string;
  color: string;
  isDefault: boolean;
};

export type ExpenseType = {
  id: string;
  name: string;
  description: string;
  sortOrder: number;
};

export type PaymentMethod = {
  id: string;
  name: string;
};

export type Expense = {
  id: string;
  userId: string;
  amountInCents: number;
  description: string;
  date: string;
  categoryId: string;
  expenseTypeId: string;
  paymentMethod: string;
  source: ExpenseSource;
  createdAt: string;
  updatedAt: string;
};

export type ExpenseDraft = {
  amount: string;
  description: string;
  date: string;
  categoryId: string;
  expenseTypeId: string;
  paymentMethod: string;
};

export type ExpenseFormErrors = Partial<Record<keyof ExpenseDraft, string>>;
