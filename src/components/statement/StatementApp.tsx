"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { deleteExpenseAction, updateExpenseAction } from "@/app/extrato/actions";
import { ExpenseForm } from "@/components/expense/ExpenseForm";
import { PrivateHeader } from "@/components/navigation/PrivateHeader";
import { AppIcon } from "@/components/ui/AppIcon";
import { getCategoryName } from "@/lib/categories/default-categories";
import { getExpenseTypeName } from "@/lib/expense-types/default-expense-types";
import { formatCentsToCurrency } from "@/lib/expenses/money";
import {
  STATEMENT_PERIOD_OPTIONS,
  type StatementPeriod,
} from "@/lib/expenses/statement-period";
import { getPaymentMethodName } from "@/lib/payment-methods/default-payment-methods";
import type { AuthenticatedUser } from "@/lib/users/current-user";
import type { Expense, ExpenseDraft, ExpenseFormErrors } from "@/types/finance";

type StatementFilter = "all" | `type:${string}` | `category:${string}` | `payment:${string}`;

type StatementAppProps = {
  user: AuthenticatedUser;
  expenses: Expense[];
  period: StatementPeriod;
};

const filters: { id: StatementFilter; label: string }[] = [
  { id: "all", label: "Todos" },
  { id: "type:necessario", label: "Necessários" },
  { id: "type:lazer", label: "Lazer" },
  { id: "type:superfluo", label: "Supérfluos" },
  { id: "payment:pix", label: "Pix" },
  { id: "category:mercado", label: "Mercado" },
  { id: "category:combustivel", label: "Combustível" },
  { id: "category:mecanica", label: "Mecânica" },
];

export function StatementApp({ user, expenses, period }: StatementAppProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<StatementFilter>("all");
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [editDraft, setEditDraft] = useState<ExpenseDraft | null>(null);
  const [editErrors, setEditErrors] = useState<ExpenseFormErrors>({});
  const [editingMessage, setEditingMessage] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [deletingExpense, setDeletingExpense] = useState<Expense | null>(null);
  const [deleteMessage, setDeleteMessage] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

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
        activeFilter === `type:${expense.expenseTypeId}` ||
        activeFilter === `category:${expense.categoryId}` ||
        activeFilter === `payment:${expense.paymentMethod}`;

      return matchesQuery && matchesFilter;
    });
  }, [activeFilter, expenses, query]);

  const totalInCents = filteredExpenses.reduce(
    (total, expense) => total + expense.amountInCents,
    0,
  );
  const groupedExpenses = groupExpensesByDate(filteredExpenses);

  function startEditing(expense: Expense) {
    setEditingExpense(expense);
    setEditDraft(expenseToDraft(expense));
    setEditErrors({});
    setEditingMessage("");
  }

  function handleEditChange(field: keyof ExpenseDraft, value: string) {
    setEditDraft((currentDraft) =>
      currentDraft ? { ...currentDraft, [field]: value } : currentDraft,
    );
    setEditErrors((currentErrors) => ({ ...currentErrors, [field]: undefined }));
    setEditingMessage("");
  }

  async function handleEditSubmit() {
    if (!editingExpense || !editDraft) {
      return;
    }

    setIsEditing(true);
    setEditingMessage("");

    const result = await updateExpenseAction(editingExpense.id, editDraft);

    if (!result.ok) {
      setEditErrors(result.errors);
      setEditingMessage(result.message ?? "Revise os campos antes de salvar.");
      setIsEditing(false);
      return;
    }

    setEditingExpense(null);
    setEditDraft(null);
    setIsEditing(false);
    router.refresh();
  }

  async function handleDeleteConfirm() {
    if (!deletingExpense) {
      return;
    }

    setIsDeleting(true);
    setDeleteMessage("");

    const result = await deleteExpenseAction(deletingExpense.id);

    if (!result.ok) {
      setDeleteMessage(result.message);
      setIsDeleting(false);
      return;
    }

    setDeletingExpense(null);
    setIsDeleting(false);
    router.refresh();
  }

  return (
    <main className="app-shell statement-shell">
      <PrivateHeader activePath="/extrato" email={user.email} name={user.name} />

      <section className="statement-mobile-head">
        <span>{period.label}</span>
        <strong>{formatCentsToCurrency(totalInCents)}</strong>
      </section>

      <section className="panel statement-panel">
        <div className="statement-header">
          <div>
            <h1>Extrato de gastos</h1>
            <p>Acompanhe e filtre suas movimentações em {period.label.toLowerCase()}.</p>
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
            <span className="statement-total-chip">{formatCentsToCurrency(totalInCents)}</span>
          </div>
        </div>

        <form className="statement-period-filter" method="get">
          <label>
            <span>Período</span>
            <select defaultValue={period.preset} name="period">
              {STATEMENT_PERIOD_OPTIONS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>Início</span>
            <input defaultValue={period.customStartDate} name="startDate" type="date" />
          </label>
          <label>
            <span>Fim</span>
            <input defaultValue={period.customEndDate} name="endDate" type="date" />
          </label>
          <button className="primary-action" type="submit">
            Aplicar
          </button>
        </form>

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
            <span>Ajuste a busca, o período ou cadastre uma nova despesa em Cadastrar.</span>
          </section>
        ) : (
          <div className="transaction-list">
            {groupedExpenses.map((group) => (
              <section className="statement-day-group" key={group.label}>
                <h2>{group.label}</h2>
                {group.expenses.map((expense) => (
                  <StatementItem
                    expense={expense}
                    key={expense.id}
                    onDelete={() => {
                      setDeletingExpense(expense);
                      setDeleteMessage("");
                    }}
                    onEdit={() => startEditing(expense)}
                  />
                ))}
              </section>
            ))}
          </div>
        )}
      </section>

      {editingExpense && editDraft ? (
        <div className="statement-dialog-backdrop" role="presentation">
          <article
            aria-labelledby="edit-expense-title"
            aria-modal="true"
            className="statement-dialog"
            role="dialog"
          >
            <div className="statement-dialog-header">
              <div>
                <span>Editar despesa</span>
                <h2 id="edit-expense-title">{editingExpense.description || "Gasto sem descrição"}</h2>
              </div>
              <button
                aria-label="Fechar edição"
                className="icon-action"
                type="button"
                onClick={() => setEditingExpense(null)}
              >
                ×
              </button>
            </div>
            {editingMessage ? (
              <p className="error-message" role="alert">
                {editingMessage}
              </p>
            ) : null}
            <ExpenseForm
              draft={editDraft}
              errors={editErrors}
              isSubmitting={isEditing}
              onChange={handleEditChange}
              onSubmit={handleEditSubmit}
            />
          </article>
        </div>
      ) : null}

      {deletingExpense ? (
        <div className="statement-dialog-backdrop" role="presentation">
          <article
            aria-labelledby="delete-expense-title"
            aria-modal="true"
            className="statement-dialog statement-confirm-dialog"
            role="dialog"
          >
            <div className="statement-dialog-header">
              <div>
                <span>Excluir despesa</span>
                <h2 id="delete-expense-title">Confirmar exclusão?</h2>
              </div>
            </div>
            <p>
              A despesa <strong>{deletingExpense.description || "sem descrição"}</strong> será
              removida do seu extrato. Comprovantes vinculados continuam privados e não serão
              apagados.
            </p>
            {deleteMessage ? (
              <p className="error-message" role="alert">
                {deleteMessage}
              </p>
            ) : null}
            <div className="statement-dialog-actions">
              <button
                className="secondary-action"
                disabled={isDeleting}
                type="button"
                onClick={() => setDeletingExpense(null)}
              >
                Cancelar
              </button>
              <button
                className="danger-action"
                disabled={isDeleting}
                type="button"
                onClick={handleDeleteConfirm}
              >
                {isDeleting ? "Excluindo..." : "Excluir despesa"}
              </button>
            </div>
          </article>
        </div>
      ) : null}
    </main>
  );
}

function StatementItem({
  expense,
  onDelete,
  onEdit,
}: {
  expense: Expense;
  onDelete: () => void;
  onEdit: () => void;
}) {
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
      <div className="tx-right">
        <strong className="tx-amount">- {formatCentsToCurrency(expense.amountInCents)}</strong>
        <span className="tx-actions">
          <button aria-label="Editar despesa" type="button" onClick={onEdit}>
            <AppIcon className="app-icon" name="pencil" />
          </button>
          <button aria-label="Excluir despesa" type="button" onClick={onDelete}>
            <AppIcon className="app-icon" name="trash" />
          </button>
        </span>
      </div>
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

function expenseToDraft(expense: Expense): ExpenseDraft {
  return {
    amount: formatCentsToCurrency(expense.amountInCents).replace("R$", "").trim(),
    description: expense.description,
    date: expense.date,
    categoryId: expense.categoryId,
    expenseTypeId: expense.expenseTypeId,
    paymentMethod: expense.paymentMethod,
  };
}

function getCategoryIcon(categoryId: string) {
  const icons = {
    alimentacao: "hamburger",
    assinaturas: "monitor",
    combustivel: "fuel",
    compras: "shopping-bag",
    contas: "lightbulb",
    lazer: "martini",
    mecanica: "wrench",
    mercado: "shopping-cart",
    moradia: "home",
    saude: "pill",
    sitio: "leaf",
    transporte: "car",
  } as const;

  return icons[categoryId as keyof typeof icons] ?? "receipt";
}
