"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  createUserSettingOptionAction,
  deleteUserSettingOptionAction,
  updateAccountNameAction,
  updateAccountPasswordAction,
  updateUserSettingOptionAction,
} from "@/app/settings-actions";
import { AppIcon } from "@/components/ui/AppIcon";
import {
  DEFAULT_FINANCE_OPTIONS,
  type FinanceOptions,
} from "@/lib/user-settings/finance-options";
import type { Category, ExpenseType, PaymentMethod } from "@/types/finance";

type AccountSettingsPanelProps = {
  email: string;
  financeOptions?: FinanceOptions;
  name: string;
  settingsMessage?: string;
};

type EditableKind = "category" | "expenseType" | "paymentMethod";

const LABELS: Record<EditableKind, string> = {
  category: "Categoria",
  expenseType: "Tipo do gasto",
  paymentMethod: "Forma de pagamento",
};

export function AccountSettingsPanel({
  email,
  financeOptions = DEFAULT_FINANCE_OPTIONS,
  name,
  settingsMessage = "",
}: AccountSettingsPanelProps) {
  const router = useRouter();
  const [profileName, setProfileName] = useState(name);
  const [password, setPassword] = useState("");
  const [newNames, setNewNames] = useState<Record<EditableKind, string>>({
    category: "",
    expenseType: "",
    paymentMethod: "",
  });
  const [editingNames, setEditingNames] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  function run(action: () => Promise<{ ok: boolean; message?: string }>) {
    setMessage("");
    startTransition(async () => {
      const result = await action();
      setMessage(result.message ?? "Configuração atualizada.");
      if (result.ok) {
        setPassword("");
        router.refresh();
      }
    });
  }

  function createOption(kind: EditableKind) {
    const optionName = newNames[kind];
    run(async () => {
      const result = await createUserSettingOptionAction(kind, optionName);
      if (result.ok) {
        setNewNames((current) => ({ ...current, [kind]: "" }));
      }
      return result.ok ? { ok: true, message: `${LABELS[kind]} salva.` } : result;
    });
  }

  function updateOption(kind: EditableKind, id: string, fallbackName: string) {
    run(async () => {
      const result = await updateUserSettingOptionAction(kind, id, editingNames[id] ?? fallbackName);
      return result.ok ? { ok: true, message: `${LABELS[kind]} atualizada.` } : result;
    });
  }

  function deleteOption(kind: EditableKind, id: string) {
    run(async () => {
      const result = await deleteUserSettingOptionAction(kind, id);
      return result.ok ? { ok: true, message: `${LABELS[kind]} excluída.` } : result;
    });
  }

  const isErrorMessage = /Não|Nao|inválid|invalid|Informe|Use uma senha/i.test(message);

  return (
    <section className="settings-page-grid" aria-label="Configurações da conta">
      <article className="settings-hero">
        <span>Conta</span>
        <h1>Configurações</h1>
        <p>
          Ajuste seu perfil e mantenha categorias, tipos de gasto e formas de pagamento
          organizados para seus lançamentos.
        </p>
        <strong>{email}</strong>
      </article>

      <div className="settings-content">
        {settingsMessage ? <p className="info-message">{settingsMessage}</p> : null}
        {message ? (
          <p className={isErrorMessage ? "error-message" : "success-message"} role="status">
            {message}
          </p>
        ) : null}

        <section className="settings-section settings-profile-card">
          <div className="settings-section-heading">
            <span>Perfil</span>
            <h2>Dados da conta</h2>
          </div>
          <div className="settings-profile-grid">
            <label className="field">
              <span>Nome</span>
              <input
                maxLength={80}
                value={profileName}
                onChange={(event) => setProfileName(event.target.value)}
              />
            </label>
            <button
              className="secondary-action"
              disabled={isPending}
              type="button"
              onClick={() => run(() => updateAccountNameAction(profileName))}
            >
              Salvar nome
            </button>
            <label className="field">
              <span>Nova senha</span>
              <input
                autoComplete="new-password"
                minLength={6}
                placeholder="Mínimo de 6 caracteres"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </label>
            <button
              className="secondary-action"
              disabled={isPending}
              type="button"
              onClick={() => run(() => updateAccountPasswordAction(password))}
            >
              Trocar senha
            </button>
          </div>
        </section>

        <div className="settings-lists-grid">
          <SettingsList
            description="Separe seus gastos por assunto, como Mercado, Saúde ou Assinaturas."
            kind="category"
            newName={newNames.category}
            options={financeOptions.categories}
            pending={isPending}
            title="Categorias"
            onCreate={() => createOption("category")}
            onDelete={(id) => deleteOption("category", id)}
            onEditName={(id, value) => setEditingNames((current) => ({ ...current, [id]: value }))}
            onNewName={(value) => setNewNames((current) => ({ ...current, category: value }))}
            onUpdate={(id, currentName) => updateOption("category", id, currentName)}
          />
          <SettingsList
            description="Defina o contexto do gasto, como Necessário, Lazer ou Supérfluo."
            kind="expenseType"
            newName={newNames.expenseType}
            options={financeOptions.expenseTypes}
            pending={isPending}
            title="Tipos do gasto"
            onCreate={() => createOption("expenseType")}
            onDelete={(id) => deleteOption("expenseType", id)}
            onEditName={(id, value) => setEditingNames((current) => ({ ...current, [id]: value }))}
            onNewName={(value) => setNewNames((current) => ({ ...current, expenseType: value }))}
            onUpdate={(id, currentName) => updateOption("expenseType", id, currentName)}
          />
          <SettingsList
            description="Cadastre formas como Pix, cartão, dinheiro ou contas específicas."
            kind="paymentMethod"
            newName={newNames.paymentMethod}
            options={financeOptions.paymentMethods}
            pending={isPending}
            title="Formas de pagamento"
            onCreate={() => createOption("paymentMethod")}
            onDelete={(id) => deleteOption("paymentMethod", id)}
            onEditName={(id, value) => setEditingNames((current) => ({ ...current, [id]: value }))}
            onNewName={(value) => setNewNames((current) => ({ ...current, paymentMethod: value }))}
            onUpdate={(id, currentName) => updateOption("paymentMethod", id, currentName)}
          />
        </div>
      </div>
    </section>
  );
}

function SettingsList({
  description,
  title,
  options,
  newName,
  pending,
  onCreate,
  onDelete,
  onEditName,
  onNewName,
  onUpdate,
}: {
  description: string;
  kind: EditableKind;
  title: string;
  options: Array<Category | ExpenseType | PaymentMethod>;
  newName: string;
  pending: boolean;
  onCreate: () => void;
  onDelete: (id: string) => void;
  onEditName: (id: string, value: string) => void;
  onNewName: (value: string) => void;
  onUpdate: (id: string, currentName: string) => void;
}) {
  return (
    <section className="settings-section">
      <div className="settings-section-heading">
        <span>Organização</span>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
      <div className="settings-create-row">
        <input
          aria-label={`Novo item em ${title}`}
          placeholder="Novo nome"
          value={newName}
          onChange={(event) => onNewName(event.target.value)}
        />
        <button className="primary-action" disabled={pending || !newName.trim()} type="button" onClick={onCreate}>
          Adicionar
        </button>
      </div>

      <ul className="settings-option-list">
        {options.map((option) => (
          <li key={option.id}>
            {isDefaultOption(option) ? (
              <>
                <span>{option.name}</span>
                <small>Sistema</small>
              </>
            ) : (
              <>
                <input
                  aria-label={`Editar ${option.name}`}
                  defaultValue={option.name}
                  onChange={(event) => onEditName(option.id, event.target.value)}
                />
                <button
                  aria-label={`Salvar ${option.name}`}
                  disabled={pending}
                  type="button"
                  onClick={() => onUpdate(option.id, option.name)}
                >
                  <AppIcon className="app-icon" name="check" />
                </button>
                <button
                  aria-label={`Excluir ${option.name}`}
                  disabled={pending}
                  type="button"
                  onClick={() => onDelete(option.id)}
                >
                  <AppIcon className="app-icon" name="trash" />
                </button>
              </>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

function isDefaultOption(option: Category | ExpenseType | PaymentMethod): boolean {
  return "isDefault" in option ? option.isDefault : !isUuid(option.id);
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}
