"use client";

import { useEffect, useMemo, useState } from "react";
import { ExpenseForm } from "@/components/expense/ExpenseForm";
import { ExpenseList } from "@/components/expense/ExpenseList";
import { PrivateHeader } from "@/components/navigation/PrivateHeader";
import { ReceiptList } from "@/components/receipts/ReceiptList";
import { ReceiptUploadForm } from "@/components/receipts/ReceiptUploadForm";
import { createManualExpenseAction, listExpensesAction } from "@/app/gastos/actions";
import { formatCentsToCurrency } from "@/lib/expenses/money";
import type { AuthenticatedUser } from "@/lib/users/current-user";
import type {
  Expense,
  ExpenseDraft,
  ExpenseFormErrors,
  ReceiptWithPreview,
} from "@/types/finance";

const EMPTY_DRAFT: ExpenseDraft = {
  amount: "",
  description: "",
  date: new Date().toISOString().slice(0, 10),
  categoryId: "",
  expenseTypeId: "",
  paymentMethod: "",
};

type LaunchpadTab = "expense" | "receipt" | "statement";

type LaunchpadAppProps = {
  user: AuthenticatedUser;
  receipts: ReceiptWithPreview[];
};

const tabs: { id: LaunchpadTab; label: string; description: string }[] = [
  {
    id: "expense",
    label: "Nova despesa",
    description: "Cadastro manual rápido com valor, data e classificação.",
  },
  {
    id: "receipt",
    label: "Novo comprovante",
    description: "Upload seguro de imagem Pix, sem OCR nesta fatia.",
  },
  {
    id: "statement",
    label: "Extrato",
    description: "Lista limpa com todos os gastos cadastrados.",
  },
];

export function LaunchpadApp({ user, receipts }: LaunchpadAppProps) {
  const [activeTab, setActiveTab] = useState<LaunchpadTab>("expense");
  const [draft, setDraft] = useState<ExpenseDraft>(EMPTY_DRAFT);
  const [errors, setErrors] = useState<ExpenseFormErrors>({});
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let isActive = true;

    async function loadExpenses() {
      const result = await listExpensesAction();

      if (!isActive) {
        return;
      }

      if (!result.ok) {
        setLoadError(result.message);
        setExpenses([]);
      } else {
        setLoadError("");
        setExpenses(result.expenses);
      }

      setIsLoading(false);
    }

    loadExpenses();

    return () => {
      isActive = false;
    };
  }, []);

  const totalInCents = useMemo(
    () => expenses.reduce((total, expense) => total + expense.amountInCents, 0),
    [expenses],
  );

  function handleChange(field: keyof ExpenseDraft, value: string) {
    setDraft((currentDraft) => ({ ...currentDraft, [field]: value }));
    setErrors((currentErrors) => ({ ...currentErrors, [field]: undefined }));
    setMessage("");
  }

  async function handleSubmit() {
    setIsSubmitting(true);
    setMessage("");

    const result = await createManualExpenseAction(draft);

    if (!result.ok) {
      setErrors(result.errors);
      setIsSubmitting(false);
      return;
    }

    setDraft({ ...EMPTY_DRAFT, date: new Date().toISOString().slice(0, 10) });
    setErrors({});
    setExpenses((currentExpenses) =>
      [result.expense, ...currentExpenses].sort(
        (a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt),
      ),
    );
    setLoadError("");
    setMessage("Despesa salva e enviada para o Extrato.");
    setActiveTab("statement");
    setIsSubmitting(false);
  }

  return (
    <main className="app-shell launchpad-shell">
      <PrivateHeader activePath="/lancamentos" email={user.email} name={user.name} />

      <section className="launchpad-hero">
        <div>
          <p className="eyebrow">Bolso em Dia</p>
          <h1>Lançamentos sem atrito.</h1>
          <p>
            Cadastre uma despesa, guarde um comprovante Pix ou confira o extrato sem
            sair do mesmo fluxo.
          </p>
        </div>
        <div className="launchpad-total-card" aria-label="Resumo dos gastos carregados">
          <span>Gastos carregados</span>
          <strong>{formatCentsToCurrency(totalInCents)}</strong>
          <small>{expenses.length} item{expenses.length === 1 ? "" : "s"} no extrato</small>
        </div>
      </section>

      <section className="launchpad-tabs" aria-label="Fluxo de lançamentos">
        {tabs.map((tab) => (
          <button
            aria-current={activeTab === tab.id ? "page" : undefined}
            className="launchpad-tab"
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            type="button"
          >
            <strong>{tab.label}</strong>
            <span>{tab.description}</span>
          </button>
        ))}
      </section>

      <section className="launchpad-workspace">
        {activeTab === "expense" ? (
          <article className="panel launchpad-panel">
            <div className="section-heading">
              <p className="eyebrow">Nova despesa</p>
              <h2>Preenchimento manual</h2>
              <p>Campos essenciais, botões grandes e validação server-side preservada.</p>
            </div>
            <ExpenseForm
              draft={draft}
              errors={errors}
              isSubmitting={isSubmitting}
              onChange={handleChange}
              onSubmit={handleSubmit}
            />
            {message ? (
              <p className="success-message" role="status">
                {message}
              </p>
            ) : null}
            {loadError ? (
              <p className="error-message" role="alert">
                {loadError}
              </p>
            ) : null}
          </article>
        ) : null}

        {activeTab === "receipt" ? (
          <div className="launchpad-receipts-grid">
            <ReceiptUploadForm />
            <ReceiptList receipts={receipts} />
          </div>
        ) : null}

        {activeTab === "statement" ? (
          <article className="panel launchpad-panel">
            <div className="section-heading statement-heading">
              <div>
                <p className="eyebrow">Extrato</p>
                <h2>Gastos cadastrados</h2>
                <p>Leitura em cards para funcionar bem no celular sem tabela larga.</p>
              </div>
              <button className="secondary-action" onClick={() => setActiveTab("expense")} type="button">
                Nova despesa
              </button>
            </div>
            {isLoading ? (
              <section className="empty-state" aria-live="polite">
                <p>Carregando extrato...</p>
                <span>Buscando apenas os lançamentos da sua conta.</span>
              </section>
            ) : (
              <ExpenseList expenses={expenses} />
            )}
          </article>
        ) : null}
      </section>
    </main>
  );
}
