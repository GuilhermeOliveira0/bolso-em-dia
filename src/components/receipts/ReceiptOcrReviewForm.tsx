"use client";

import type { FormEvent } from "react";
import type { ReceiptOcrReview, ReceiptOcrReviewDraft } from "@/app/lancamentos/actions";
import { AppIcon } from "@/components/ui/AppIcon";
import { getExpenseCategoryOptions } from "@/lib/categories/default-categories";
import {
  buildFinanceOptionMaps,
  DEFAULT_FINANCE_OPTIONS,
  getOptionName,
  type FinanceOptions,
} from "@/lib/user-settings/finance-options";

export type ReceiptOcrReviewErrors = Partial<Record<keyof ReceiptOcrReviewDraft, string>>;

type ReceiptOcrReviewFormProps = {
  review: ReceiptOcrReview;
  errors: ReceiptOcrReviewErrors;
  financeOptions?: FinanceOptions;
  isSubmitting: boolean;
  onCancel: () => void;
  onChange: (field: keyof ReceiptOcrReviewDraft, value: string) => void;
  onSubmit: () => void;
};

function needsReview(review: ReceiptOcrReview, field: "amount" | "date" | "recipient") {
  return review.fieldsNeedReview.includes(field);
}

export function ReceiptOcrReviewForm({
  review,
  errors,
  financeOptions = DEFAULT_FINANCE_OPTIONS,
  isSubmitting,
  onCancel,
  onChange,
  onSubmit,
}: ReceiptOcrReviewFormProps) {
  const names = buildFinanceOptionMaps(financeOptions);
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit();
  }

  return (
    <article className="panel receipt-ocr-review-card" aria-labelledby="receipt-ocr-review-title">
      <div className="prototype-section-title">
        <AppIcon className="app-icon" name="receipt" />
        <div>
          <h2 id="receipt-ocr-review-title">Revise antes de salvar</h2>
          <p>Confira os dados extraídos. Nada será salvo como despesa sem sua confirmação.</p>
        </div>
      </div>

      <div className="ocr-confidence-row">
        <span>Confiança da leitura</span>
        <strong>{Math.round(review.confidence * 100)}%</strong>
      </div>

      <div
        className="ocr-classification-suggestion"
        data-confidence={review.classificationSuggestion.confidence}
      >
        {review.classificationSuggestion.confidence === "low" ? (
          <p>{review.classificationSuggestion.reason}</p>
        ) : (
          <p>
            Sugestão automática:{" "}
            <strong>
              {getOptionName(names.categoryNames, review.categoryId, "Categoria")} /{" "}
              {getOptionName(names.expenseTypeNames, review.expenseTypeId, "tipo")}
            </strong>{" "}
            com base em "{review.classificationSuggestion.matchedKeyword}".
          </p>
        )}
      </div>

      <form className="expense-form" onSubmit={handleSubmit} noValidate>
        <input name="receiptId" type="hidden" value={review.receiptId} />

        <div className="field-group">
          <label
            className="field"
            data-invalid={Boolean(errors.amount)}
            data-review={needsReview(review, "amount") || undefined}
            htmlFor="ocrAmount"
          >
            <span>Valor extraído</span>
            <div className="money-input">
              <b>R$</b>
              <input
                aria-invalid={Boolean(errors.amount)}
                id="ocrAmount"
                inputMode="decimal"
                name="amount"
                placeholder="0,00"
                value={review.amount}
                onChange={(event) => onChange("amount", event.target.value)}
              />
            </div>
            {errors.amount ? <small>{errors.amount}</small> : null}
            {needsReview(review, "amount") ? <small>Precisa revisar</small> : null}
          </label>

          <label
            className="field"
            data-invalid={Boolean(errors.date)}
            data-review={needsReview(review, "date") || undefined}
            htmlFor="ocrDate"
          >
            <span>Data extraída</span>
            <input
              aria-invalid={Boolean(errors.date)}
              id="ocrDate"
              name="date"
              type="date"
              value={review.date}
              onChange={(event) => onChange("date", event.target.value)}
            />
            {errors.date ? <small>{errors.date}</small> : null}
            {needsReview(review, "date") ? <small>Precisa revisar</small> : null}
          </label>
        </div>

        <label
          className="field"
          data-invalid={Boolean(errors.recipient)}
          data-review={needsReview(review, "recipient") || undefined}
          htmlFor="ocrRecipient"
        >
          <span>Recebedor extraído</span>
          <input
            aria-invalid={Boolean(errors.recipient)}
            id="ocrRecipient"
            maxLength={80}
            name="recipient"
            placeholder="Nome do recebedor"
            value={review.recipient}
            onChange={(event) => onChange("recipient", event.target.value)}
          />
          {errors.recipient ? <small>{errors.recipient}</small> : null}
          {needsReview(review, "recipient") ? <small>Precisa revisar</small> : null}
        </label>

        <label className="field" data-invalid={Boolean(errors.description)} htmlFor="ocrDescription">
          <span>Descrição sugerida</span>
          <input
            aria-invalid={Boolean(errors.description)}
            id="ocrDescription"
            maxLength={80}
            name="description"
            placeholder="Ex.: Pix mercado, almoço, consulta"
            value={review.description}
            onChange={(event) => onChange("description", event.target.value)}
          />
          {errors.description ? <small>{errors.description}</small> : null}
        </label>

        <label
          className="field"
          data-invalid={Boolean(errors.categoryId)}
          data-review={review.classificationSuggestion.confidence === "low" || undefined}
          htmlFor="ocrCategoryId"
        >
          <span>Categoria</span>
          <select
            aria-invalid={Boolean(errors.categoryId)}
            id="ocrCategoryId"
            name="categoryId"
            value={review.categoryId}
            onChange={(event) => onChange("categoryId", event.target.value)}
          >
            <option value="">Escolha uma categoria</option>
            {getExpenseCategoryOptions(review.categoryId, financeOptions.categories).map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          {errors.categoryId ? <small>{errors.categoryId}</small> : null}
          {review.classificationSuggestion.confidence === "low" ? (
            <small aria-hidden="true">Precisa revisar</small>
          ) : null}
        </label>

        <label
          className="field"
          data-invalid={Boolean(errors.expenseTypeId)}
          data-review={review.classificationSuggestion.confidence === "low" || undefined}
          htmlFor="ocrExpenseTypeId"
        >
          <span>Tipo do gasto</span>
          <select
            aria-invalid={Boolean(errors.expenseTypeId)}
            id="ocrExpenseTypeId"
            name="expenseTypeId"
            value={review.expenseTypeId}
            onChange={(event) => onChange("expenseTypeId", event.target.value)}
          >
            <option value="">Escolha um tipo</option>
            {financeOptions.expenseTypes.map((expenseType) => (
              <option key={expenseType.id} value={expenseType.id}>
                {expenseType.name}
              </option>
            ))}
          </select>
          {errors.expenseTypeId ? <small>{errors.expenseTypeId}</small> : null}
          {review.classificationSuggestion.confidence === "low" ? (
            <small aria-hidden="true">Precisa revisar</small>
          ) : null}
        </label>

        <label
          className="field"
          data-invalid={Boolean(errors.paymentMethod)}
          htmlFor="ocrPaymentMethod"
        >
          <span>Forma de pagamento</span>
          <select
            aria-invalid={Boolean(errors.paymentMethod)}
            id="ocrPaymentMethod"
            name="paymentMethod"
            value={review.paymentMethod}
            onChange={(event) => onChange("paymentMethod", event.target.value)}
          >
            <option value="">Escolha a forma</option>
            {financeOptions.paymentMethods.map((paymentMethod) => (
              <option key={paymentMethod.id} value={paymentMethod.id}>
                {paymentMethod.name}
              </option>
            ))}
          </select>
          {errors.paymentMethod ? <small>{errors.paymentMethod}</small> : null}
        </label>

        <div className="ocr-review-actions">
          <button className="secondary-action" type="button" onClick={onCancel}>
            Cancelar revisão
          </button>
          <button className="primary-action" disabled={isSubmitting} type="submit">
            {isSubmitting ? "Salvando..." : "Confirmar e salvar despesa"}
          </button>
        </div>
      </form>
    </article>
  );
}
