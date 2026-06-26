"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createManualExpenseAction } from "@/app/gastos/actions";
import {
  confirmReceiptExpenseAction,
  processReceiptOcrAction,
  type ProcessReceiptOcrResult,
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
import {
  DEFAULT_FINANCE_OPTIONS,
  type FinanceOptions,
} from "@/lib/user-settings/finance-options";
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
  financeOptions?: FinanceOptions;
  settingsMessage?: string;
};

type OcrMessageTone = "info" | "success" | "error";

const OCR_FAILURE_MESSAGE =
  "Não conseguimos ler o comprovante agora. Você pode preencher manualmente.";
const OCR_CLIENT_TIMEOUT_MS = 65_000;

function processReceiptWithClientTimeout(receiptId: string): Promise<ProcessReceiptOcrResult> {
  let timeoutId: number | undefined;
  const timeoutResult = new Promise<ProcessReceiptOcrResult>((resolve) => {
    timeoutId = window.setTimeout(() => {
      resolve({
        ok: false,
        message: OCR_FAILURE_MESSAGE,
      });
    }, OCR_CLIENT_TIMEOUT_MS);
  });

  return Promise.race([processReceiptOcrAction(receiptId), timeoutResult]).finally(() => {
    if (timeoutId) {
      window.clearTimeout(timeoutId);
    }
  });
}

export function LaunchpadApp({
  user,
  receipts,
  financeOptions = DEFAULT_FINANCE_OPTIONS,
  settingsMessage = "",
}: LaunchpadAppProps) {
  const router = useRouter();
  const [draft, setDraft] = useState<ExpenseDraft>(EMPTY_DRAFT);
  const [errors, setErrors] = useState<ExpenseFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [ocrReview, setOcrReview] = useState<ReceiptOcrReview | null>(null);
  const [ocrErrors, setOcrErrors] = useState<ReceiptOcrReviewErrors>({});
  const [ocrMessage, setOcrMessage] = useState("");
  const [ocrMessageTone, setOcrMessageTone] = useState<OcrMessageTone>("info");
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
    if (readingReceiptId) {
      return;
    }

    setReadingReceiptId(receiptId);
    setOcrMessage("Lendo comprovante...");
    setOcrMessageTone("info");
    setOcrErrors({});

    const slowReadTimer = window.setTimeout(() => {
      setOcrMessage("Lendo comprovante... Isso pode levar um pouco na primeira leitura.");
    }, 5000);

    try {
      const result = await processReceiptWithClientTimeout(receiptId);

      if (!result.ok) {
        setOcrReview(null);
        setOcrMessage(result.message);
        setOcrMessageTone("error");
        return;
      }

      setOcrReview(result.review);
      setOcrMessage(result.message);
      setOcrMessageTone(result.review.confidence > 0 ? "success" : "error");
    } catch {
      setOcrReview(null);
      setOcrMessage(OCR_FAILURE_MESSAGE);
      setOcrMessageTone("error");
    } finally {
      window.clearTimeout(slowReadTimer);
      setReadingReceiptId("");
    }
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
    setOcrMessageTone("success");
    setIsConfirmingOcr(false);
    router.refresh();
  }

  const ocrMessageClassName =
    ocrMessageTone === "error"
      ? "error-message"
      : ocrMessageTone === "success"
        ? "success-message"
        : "info-message";

  return (
    <main className="app-shell launchpad-shell">
      <PrivateHeader
        activePath="/lancamentos"
        email={user.email}
        name={user.name}
      />

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
            <p
              className={ocrMessageClassName}
              role={ocrMessageTone === "error" ? "alert" : "status"}
            >
              {ocrMessage}
            </p>
          ) : null}

          {ocrReview ? (
            <ReceiptOcrReviewForm
              errors={ocrErrors}
              financeOptions={financeOptions}
              isSubmitting={isConfirmingOcr}
              review={ocrReview}
              onCancel={() => {
                setOcrReview(null);
                setOcrErrors({});
                setOcrMessage("");
                setOcrMessageTone("info");
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
              financeOptions={financeOptions}
              isSubmitting={isSubmitting}
              onChange={handleChange}
              onSubmit={handleSubmit}
            />
            {settingsMessage ? (
              <p className="info-message" role="status">
                {settingsMessage}
              </p>
            ) : null}
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
