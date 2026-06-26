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

type AccountSettingsButtonProps = {
  email: string;
  name: string;
  initial: string;
  financeOptions?: FinanceOptions;
  settingsMessage?: string;
};

type EditableKind = "category" | "expenseType" | "paymentMethod";

const LABELS: Record<EditableKind, string> = {
  category: "Categoria",
  expenseType: "Tipo do gasto",
  paymentMethod: "Forma de pagamento",
};

export function AccountSettingsButton({
  email,
  name,
  initial,
  financeOptions = DEFAULT_FINANCE_OPTIONS,
  settingsMessage = "",
}: AccountSettingsButtonProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
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
      return result.ok
        ? { ok: true, message: `${LABELS[kind]} salva.` }
        : result;
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
    <>
      <button
        aria-label="Abrir configurações da conta"
        className="avatar-chip avatar-button"
        title={email}
        type="button"
        onClick={() => setIsOpen(true)}
      >
        {initial}
      </button>

      {isOpen ? (
        <div className="statement-dialog-backdrop settings-dialog-backdrop" role="presentation">
          <article
            aria-labelledby="settings-title"
            aria-modal="true"
            className="statement-dialog settings-dialog"
            role="dialog"
          >
            <div className="statement-dialog-header">
              <div>
                <span>Conta</span>
                <h2 id="settings-title">Configurações</h2>
              </div>
              <button
                aria-label="Fechar configurações"
                className="icon-action"
                type="button"
                onClick={() => setIsOpen(false)}
              >
                x
              </button>
            </div>

            <section className="settings-section">
              <h3>Perfil</h3>
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
            </section>

            {settingsMessage ? <p className="info-message">{settingsMessage}</p> : null}
            {message ? (
              <p className={isErrorMessage ? "error-message" : "success-message"} role="status">
                {message}
              </p>
            ) : null}

            <SettingsList
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
          </article>
        </div>
      ) : null}
    </>
  );
}

function SettingsList({
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
      <h3>{title}</h3>
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
