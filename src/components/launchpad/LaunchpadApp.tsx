"use client";

import { useState } from "react";
import { createManualExpenseAction } from "@/app/gastos/actions";
import { ExpenseForm } from "@/components/expense/ExpenseForm";
import { PrivateHeader } from "@/components/navigation/PrivateHeader";
import { ReceiptList } from "@/components/receipts/ReceiptList";
import { ReceiptUploadForm } from "@/components/receipts/ReceiptUploadForm";
import { AppIcon } from "@/components/ui/AppIcon";
import type { AuthenticatedUser } from "@/lib/users/current-user";
import type { ExpenseDraft, ExpenseFormErrors, ReceiptWithPreview } from "@/types/finance";

const EMPTY_DRAFT: ExpenseDraft = {
  amount: "",
  description: "",
  date: new Date().toISOString().slice(0, 10),
  categoryId: "",
  expenseTypeId: "",
  paymentMethod: "",
};

type LaunchpadAppProps = {
  user: AuthenticatedUser;
  receipts: ReceiptWithPreview[];
};

export function LaunchpadApp({ user, receipts }: LaunchpadAppProps) {
  const [draft, setDraft] = useState<ExpenseDraft>(EMPTY_DRAFT);
  const [errors, setErrors] = useState<ExpenseFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");

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
    setMessage("Despesa salva. Ela já aparece no extrato.");
    setIsSubmitting(false);
  }

  return (
    <main className="app-shell launchpad-shell">
      <PrivateHeader activePath="/lancamentos" email={user.email} name={user.name} />

      <section className="launchpad-form-grid">
        <aside className="prototype-upload-column">
          <ReceiptUploadForm />
          <ReceiptList receipts={receipts} />
        </aside>

        <article className="panel prototype-form-card">
          <div className="prototype-section-title">
            <AppIcon className="app-icon" name="receipt" />
            <h2>Cadastrar despesa</h2>
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
        </article>
      </section>
    </main>
  );
}
