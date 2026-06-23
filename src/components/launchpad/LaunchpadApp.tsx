"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createManualExpenseAction } from "@/app/gastos/actions";
import {
  confirmReceiptExpenseAction,
  processReceiptOcrAction,
  type ReceiptOcrReview,
  type ReceiptOcrReviewDraft,
} from "@/app/lancamentos/actions";
import { ExpenseForm } from "@/components/expense/ExpenseForm";
import { PrivateHeader } from "@/components/navigation/PrivateHeader";
import { ReceiptList } from "@/components/receipts/ReceiptList";
import {
  ReceiptOcrReviewForm,
  type ReceiptOcrReviewErrors,
} from "@/components/receipts/ReceiptOcrReviewForm";
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
  const router = useRouter();
  const [draft, setDraft] = useState<ExpenseDraft>(EMPTY_DRAFT);
  const [errors, setErrors] = useState<ExpenseFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [ocrReview, setOcrReview] = useState<ReceiptOcrReview | null>(null);
  const [ocrErrors, setOcrErrors] = useState<ReceiptOcrReviewErrors>({});
  const [ocrMessage, setOcrMessage] = useState("");
  const [readingReceiptId, setReadingReceiptId] = useState("");
  const [isConfirmingOcr, setIsConfirmingOcr] = useState(false);

  function handleChange(field: keyof ExpenseDraft, value: string) {
    setDraft((currentDraft) => ({ ...currentDraft, [field]: value }));
    setErrors((currentErrors) => ({ ...currentErrors, [field]: undefined }));
    setMessage("");
  }

  function handleOcrReviewChange(field: keyof ReceiptOcrReviewDraft, value: string) {
    setOcrReview((currentReview) =>
      currentReview ? { ...currentReview, [field]: value } : currentReview,
    );
    setOcrErrors((currentErrors) => ({ ...currentErrors, [field]: undefined }));
    setOcrMessage("");
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

  async function handleReadReceipt(receiptId: string) {
    setReadingReceiptId(receiptId);
    setOcrMessage("Lendo comprovante...");
    setOcrErrors({});

    const result = await processReceiptOcrAction(receiptId);

    if (!result.ok) {
      setOcrReview(null);
      setOcrMessage(result.message);
      setReadingReceiptId("");
      return;
    }

    setOcrReview(result.review);
    setOcrMessage(result.message);
    setReadingReceiptId("");
  }

  async function handleConfirmOcrExpense() {
    if (!ocrReview) {
      return;
    }

    setIsConfirmingOcr(true);
    setOcrMessage("");

    const result = await confirmReceiptExpenseAction(ocrReview);

    if (!result.ok) {
      setOcrErrors(result.errors);
      setIsConfirmingOcr(false);
      return;
    }

    setOcrReview(null);
    setOcrErrors({});
    setOcrMessage("Despesa criada a partir do comprovante. Ela já aparece no extrato.");
    setIsConfirmingOcr(false);
    router.refresh();
  }

  return (
    <main className="app-shell launchpad-shell">
      <PrivateHeader activePath="/lancamentos" email={user.email} name={user.name} />

      <section className="launchpad-form-grid">
        <aside className="prototype-upload-column">
          <ReceiptUploadForm />
          <ReceiptList
            receipts={receipts}
            readingReceiptId={readingReceiptId}
            onReadReceipt={handleReadReceipt}
          />
        </aside>

        <div className="launchpad-main-column">
          {ocrMessage ? (
            <p className={ocrReview ? "success-message" : "info-message"} role="status">
              {ocrMessage}
            </p>
          ) : null}

          {ocrReview ? (
            <ReceiptOcrReviewForm
              errors={ocrErrors}
              isSubmitting={isConfirmingOcr}
              review={ocrReview}
              onCancel={() => {
                setOcrReview(null);
                setOcrErrors({});
                setOcrMessage("");
              }}
              onChange={handleOcrReviewChange}
              onSubmit={handleConfirmOcrExpense}
            />
          ) : null}

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
        </div>
      </section>
    </main>
  );
}
