"use client";

import { getCategoryName } from "@/lib/categories/default-categories";
import { getExpenseTypeName } from "@/lib/expense-types/default-expense-types";
import { formatCentsToCurrency } from "@/lib/expenses/money";
import { getPaymentMethodName } from "@/lib/payment-methods/default-payment-methods";
import type { Expense } from "@/types/finance";

type ExpenseListProps = {
  expenses: Expense[];
};

export function ExpenseList({ expenses }: ExpenseListProps) {
  if (expenses.length === 0) {
    return (
      <section className="empty-state" aria-live="polite">
        <p>Nenhum gasto cadastrado ainda.</p>
        <span>Cadastre o primeiro gasto manual para começar o controle.</span>
      </section>
    );
  }

  return (
    <ul className="expense-list" aria-label="Gastos cadastrados">
      {expenses.map((expense) => (
        <li className="expense-item" key={expense.id}>
          <div className="expense-main">
            <div>
              <strong>{formatCentsToCurrency(expense.amountInCents)}</strong>
              <span>{expense.description || "Gasto sem descrição"}</span>
            </div>
            <span className="expense-date-pill">{formatDate(expense.date)}</span>
          </div>
          <dl>
            <div>
              <dt>Categoria</dt>
              <dd>{getCategoryName(expense.categoryId)}</dd>
            </div>
            <div>
              <dt>Tipo</dt>
              <dd>{getExpenseTypeName(expense.expenseTypeId)}</dd>
            </div>
            <div>
              <dt>Pagamento</dt>
              <dd>{getPaymentMethodName(expense.paymentMethod)}</dd>
            </div>
          </dl>
        </li>
      ))}
    </ul>
  );
}

function formatDate(date: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(`${date}T00:00:00`));
}
