"use client";

import { useEffect, useState } from "react";
import { ExpenseForm } from "@/components/expense/ExpenseForm";
import { ExpenseList } from "@/components/expense/ExpenseList";
import { PrivateHeader } from "@/components/navigation/PrivateHeader";
import { createManualExpenseAction, listExpensesAction } from "@/app/gastos/actions";
import type { AuthenticatedUser } from "@/lib/users/current-user";
import type { Expense, ExpenseDraft, ExpenseFormErrors } from "@/types/finance";

const EMPTY_DRAFT: ExpenseDraft = {
  amount: "",
  description: "",
  date: new Date().toISOString().slice(0, 10),
  categoryId: "",
  expenseTypeId: "",
  paymentMethod: "",
};

type ManualExpenseAppProps = {
  user: AuthenticatedUser;
};

export function ManualExpenseApp({ user }: ManualExpenseAppProps) {
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
    setMessage("Gasto salvo e exibido na listagem.");
    setIsSubmitting(false);
  }

  return (
    <main className="app-shell">
      <PrivateHeader activePath="/gastos" email={user.email} name={user.name} />

      <section className="hero">
        <div>
          <p className="eyebrow">Bolso em Dia</p>
          <h1>Cadastre gastos na sua conta.</h1>
          <p>
            Registre um gasto em poucos campos e mantenha a leitura do mes organizada por
            categoria, tipo e forma de pagamento.
          </p>
          <div className="quick-actions" aria-label="Resumo do fluxo">
            <span className="quick-pill">Conta privada</span>
            <span className="quick-pill">Cadastro rapido</span>
            <span className="quick-pill">Lista atualizada</span>
          </div>
        </div>
      </section>

      <section className="workspace" aria-label="Cadastro manual de gastos">
        <article className="panel form-panel">
          <div className="section-heading">
            <p className="eyebrow">Novo gasto</p>
            <h2>Registro manual</h2>
            <p>Campos essenciais primeiro para o cadastro continuar simples no celular.</p>
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

        <article className="panel list-panel">
          <div className="section-heading">
            <p className="eyebrow">Listagem</p>
            <h2>Gastos cadastrados</h2>
            <p>Uma visao em formato de recibo para conferir valor, data e classificacao.</p>
          </div>
          {isLoading ? (
            <section className="empty-state" aria-live="polite">
              <p>Carregando gastos...</p>
              <span>Buscando apenas os lancamentos da sua conta.</span>
            </section>
          ) : (
            <ExpenseList expenses={expenses} />
          )}
        </article>
      </section>
    </main>
  );
}
