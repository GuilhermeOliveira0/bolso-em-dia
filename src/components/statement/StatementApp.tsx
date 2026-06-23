"use client";

import { useMemo, useState } from "react";
import { PrivateHeader } from "@/components/navigation/PrivateHeader";
import { AppIcon } from "@/components/ui/AppIcon";
import { getCategoryName } from "@/lib/categories/default-categories";
import { getExpenseTypeName } from "@/lib/expense-types/default-expense-types";
import { formatCentsToCurrency } from "@/lib/expenses/money";
import { getPaymentMethodName } from "@/lib/payment-methods/default-payment-methods";
import type { AuthenticatedUser } from "@/lib/users/current-user";
import type { Expense } from "@/types/finance";

type StatementFilter = "all" | "necessario" | "lazer" | "superfluo" | "pix";

type StatementAppProps = {
  user: AuthenticatedUser;
  expenses: Expense[];
};

const filters: { id: StatementFilter; label: string }[] = [
  { id: "all", label: "Todos" },
  { id: "necessario", label: "Necessários" },
  { id: "lazer", label: "Lazer" },
  { id: "superfluo", label: "Supérfluos" },
  { id: "pix", label: "Pix" },
];

export function StatementApp({ user, expenses }: StatementAppProps) {
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<StatementFilter>("all");

  const filteredExpenses = useMemo(() => {
    const normalizedQuery = normalize(query);

    return expenses.filter((expense) => {
      const categoryName = getCategoryName(expense.categoryId);
      const typeName = getExpenseTypeName(expense.expenseTypeId);
      const paymentName = getPaymentMethodName(expense.paymentMethod);
      const searchableText = normalize(
        `${expense.description} ${categoryName} ${typeName} ${paymentName}`,
      );
      const matchesQuery = !normalizedQuery || searchableText.includes(normalizedQuery);
      const matchesFilter =
        activeFilter === "all" ||
        expense.expenseTypeId === activeFilter ||
        expense.paymentMethod === activeFilter;

      return matchesQuery && matchesFilter;
    });
  }, [activeFilter, expenses, query]);

  const totalInCents = filteredExpenses.reduce(
    (total, expense) => total + expense.amountInCents,
    0,
  );
  const groupedExpenses = groupExpensesByDate(filteredExpenses);

  return (
    <main className="app-shell statement-shell">
      <PrivateHeader activePath="/extrato" email={user.email} name={user.name} />

      <section className="statement-mobile-head">
        <span>Gastos em {currentMonthLabel()}</span>
        <strong>{formatCentsToCurrency(totalInCents)}</strong>
      </section>

      <section className="panel statement-panel">
        <div className="statement-header">
          <div>
            <h1>Extrato de gastos</h1>
            <p>Acompanhe e filtre todas as suas movimentações.</p>
          </div>

          <div className="statement-search-area">
            <label className="statement-search">
              <AppIcon className="app-icon" name="search" />
              <input
                placeholder="Buscar despesa, categoria ou local..."
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </label>
            <button className="statement-filter-button" type="button">
              <AppIcon className="app-icon" name="faders" />
              <span className="sr-only">Filtros</span>
            </button>
          </div>
        </div>

        <div className="statement-pills" aria-label="Filtros do extrato">
          {filters.map((filter) => (
            <button
              aria-pressed={activeFilter === filter.id}
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              type="button"
            >
              {filter.label}
            </button>
          ))}
        </div>

        {filteredExpenses.length === 0 ? (
          <section className="empty-state">
            <p>Nenhum gasto encontrado.</p>
            <span>Ajuste a busca ou cadastre uma nova despesa em Cadastrar.</span>
          </section>
        ) : (
          <div className="transaction-list">
            {groupedExpenses.map((group) => (
              <section className="statement-day-group" key={group.label}>
                <h2>{group.label}</h2>
                {group.expenses.map((expense) => (
                  <StatementItem expense={expense} key={expense.id} />
                ))}
              </section>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

function StatementItem({ expense }: { expense: Expense }) {
  const categoryName = getCategoryName(expense.categoryId);
  const typeName = getExpenseTypeName(expense.expenseTypeId);
  const paymentName = getPaymentMethodName(expense.paymentMethod);

  return (
    <article className="transaction-item">
      <div className="tx-left">
        <span className={`tx-icon tx-icon-${expense.categoryId}`} aria-hidden="true">
          <AppIcon className="app-icon" name={getCategoryIcon(expense.categoryId)} />
        </span>
        <div className="tx-info">
          <div className="tx-main">
            <h3>
              {expense.description || "Gasto sem descrição"}
              <span className="tag-tipo">{typeName}</span>
            </h3>
            <p>
              {categoryName} • {paymentName}
            </p>
          </div>
        </div>
      </div>
      <strong className="tx-amount">- {formatCentsToCurrency(expense.amountInCents)}</strong>
    </article>
  );
}

function groupExpensesByDate(expenses: Expense[]) {
  const formatter = new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
  });
  const today = new Date().toISOString().slice(0, 10);
  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterday = yesterdayDate.toISOString().slice(0, 10);
  const groups = new Map<string, Expense[]>();

  for (const expense of expenses) {
    const label =
      expense.date === today
        ? "Hoje"
        : expense.date === yesterday
          ? `Ontem, ${formatter.format(new Date(`${expense.date}T00:00:00`))}`
          : formatter.format(new Date(`${expense.date}T00:00:00`));
    groups.set(label, [...(groups.get(label) ?? []), expense]);
  }

  return Array.from(groups.entries()).map(([label, groupExpenses]) => ({
    label,
    expenses: groupExpenses,
  }));
}

function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();
}

function currentMonthLabel(): string {
  return new Intl.DateTimeFormat("pt-BR", { month: "long" }).format(new Date());
}

function getCategoryIcon(categoryId: string) {
  const icons = {
    alimentacao: "hamburger",
    assinaturas: "monitor",
    compras: "shopping-bag",
    contas: "lightbulb",
    mercado: "shopping-cart",
    saude: "pill",
    transporte: "car",
  } as const;

  return icons[categoryId as keyof typeof icons] ?? "receipt";
}
