"use client";

import type { FormEvent } from "react";
import { getExpenseCategoryOptions } from "@/lib/categories/default-categories";
import {
  DEFAULT_FINANCE_OPTIONS,
  type FinanceOptions,
} from "@/lib/user-settings/finance-options";
import type { ExpenseDraft, ExpenseFormErrors } from "@/types/finance";

type ExpenseFormProps = {
  draft: ExpenseDraft;
  errors: ExpenseFormErrors;
  financeOptions?: FinanceOptions;
  isSubmitting: boolean;
  onChange: (field: keyof ExpenseDraft, value: string) => void;
  onSubmit: () => void;
};

export function ExpenseForm({
  draft,
  errors,
  financeOptions = DEFAULT_FINANCE_OPTIONS,
  isSubmitting,
  onChange,
  onSubmit,
}: ExpenseFormProps) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit();
  }

  return (
    <form className="expense-form" onSubmit={handleSubmit} noValidate>
      <div className="field-group">
        <label className="field" data-invalid={Boolean(errors.amount)} htmlFor="amount">
          <span>Valor</span>
          <div className="money-input">
            <b>R$</b>
            <input
              aria-invalid={Boolean(errors.amount)}
              id="amount"
              inputMode="decimal"
              name="amount"
              placeholder="0,00"
              value={draft.amount}
              onChange={(event) => onChange("amount", event.target.value)}
            />
          </div>
          {errors.amount ? <small>{errors.amount}</small> : null}
        </label>

        <label className="field" data-invalid={Boolean(errors.date)} htmlFor="date">
          <span>Data</span>
          <input
            aria-invalid={Boolean(errors.date)}
            id="date"
            name="date"
            type="date"
            value={draft.date}
            onChange={(event) => onChange("date", event.target.value)}
          />
          {errors.date ? <small>{errors.date}</small> : null}
        </label>
      </div>

      <label className="field" data-invalid={Boolean(errors.description)} htmlFor="description">
        <span>Descrição</span>
        <input
          aria-invalid={Boolean(errors.description)}
          id="description"
          maxLength={80}
          name="description"
          placeholder="Ex.: almoço, mercado, consulta"
          value={draft.description}
          onChange={(event) => onChange("description", event.target.value)}
        />
        {errors.description ? <small>{errors.description}</small> : null}
      </label>

      <label className="field" data-invalid={Boolean(errors.categoryId)} htmlFor="categoryId">
        <span>Categoria</span>
        <select
          aria-invalid={Boolean(errors.categoryId)}
          id="categoryId"
          name="categoryId"
          value={draft.categoryId}
          onChange={(event) => onChange("categoryId", event.target.value)}
        >
          <option value="">Escolha uma categoria</option>
          {getExpenseCategoryOptions(draft.categoryId, financeOptions.categories).map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        {errors.categoryId ? <small>{errors.categoryId}</small> : null}
      </label>

      <label className="field" data-invalid={Boolean(errors.expenseTypeId)} htmlFor="expenseTypeId">
        <span>Tipo do gasto</span>
        <select
          aria-invalid={Boolean(errors.expenseTypeId)}
          id="expenseTypeId"
          name="expenseTypeId"
          value={draft.expenseTypeId}
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
      </label>

      <label className="field" data-invalid={Boolean(errors.paymentMethod)} htmlFor="paymentMethod">
        <span>Forma de pagamento</span>
        <select
          aria-invalid={Boolean(errors.paymentMethod)}
          id="paymentMethod"
          name="paymentMethod"
          value={draft.paymentMethod}
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

      <button className="primary-action" disabled={isSubmitting} type="submit">
        {isSubmitting ? "Salvando..." : "Salvar despesa"}
      </button>
    </form>
  );
}
