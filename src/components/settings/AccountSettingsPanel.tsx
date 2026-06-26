"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
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
  initial: string;
  name: string;
  settingsMessage?: string;
};

type EditableKind = "category" | "expenseType" | "paymentMethod";
type SettingsOption = Category | ExpenseType | PaymentMethod;

const LABELS: Record<EditableKind, string> = {
  category: "Categoria",
  expenseType: "Tipo do gasto",
  paymentMethod: "Forma de pagamento",
};

const LIST_META: Record<
  EditableKind,
  { description: string; icon: "shopping-bag" | "squares" | "wallet"; placeholder: string; title: string }
> = {
  category: {
    description: "Agrupe seus gastos por assunto, como Mercado, Saúde ou Assinaturas.",
    icon: "shopping-bag",
    placeholder: "Nova categoria...",
    title: "Categorias",
  },
  expenseType: {
    description: "Defina a importância e o contexto da despesa.",
    icon: "squares",
    placeholder: "Novo tipo...",
    title: "Tipos de gasto",
  },
  paymentMethod: {
    description: "Cadastre Pix, cartões, dinheiro ou contas específicas.",
    icon: "wallet",
    placeholder: "Nova forma...",
    title: "Pagamentos",
  },
};

export function AccountSettingsPanel({
  email,
  financeOptions = DEFAULT_FINANCE_OPTIONS,
  initial,
  name,
  settingsMessage = "",
}: AccountSettingsPanelProps) {
  const router = useRouter();
  const [localOptions, setLocalOptions] = useState(financeOptions);
  const [profileName, setProfileName] = useState(name);
  const [password, setPassword] = useState("");
  const [newNames, setNewNames] = useState<Record<EditableKind, string>>({
    category: "",
    expenseType: "",
    paymentMethod: "",
  });
  const [editingNames, setEditingNames] = useState<Record<string, string>>({});
  const [confirmingDelete, setConfirmingDelete] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [pendingLabel, setPendingLabel] = useState("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setLocalOptions(financeOptions);
  }, [financeOptions]);

  function run(
    label: string,
    action: () => Promise<{ ok: boolean; message?: string }>,
    options: { refresh?: boolean } = {},
  ) {
    setMessage("");
    setPendingLabel(label);
    startTransition(async () => {
      const result = await action();
      setMessage(result.message ?? "Configuração atualizada.");
      setPendingLabel("");
      if (result.ok) {
        setPassword("");
        setConfirmingDelete(null);
        if (options.refresh ?? true) {
          router.refresh();
        }
      }
    });
  }

  function createOption(kind: EditableKind) {
    const optionName = newNames[kind];
    run(`Criando ${LABELS[kind].toLowerCase()}...`, async () => {
      const result = await createUserSettingOptionAction(kind, optionName);
      if (result.ok) {
        setNewNames((current) => ({ ...current, [kind]: "" }));
        if (result.option) {
          addLocalOption(kind, result.option);
        }
      }
      return result.ok ? { ok: true, message: `${LABELS[kind]} salva.` } : result;
    }, { refresh: false });
  }

  function updateOption(kind: EditableKind, id: string, fallbackName: string) {
    run(`Salvando ${LABELS[kind].toLowerCase()}...`, async () => {
      const nextName = editingNames[id] ?? fallbackName;
      const result = await updateUserSettingOptionAction(kind, id, nextName);
      if (result.ok) {
        updateLocalOption(kind, id, nextName);
      }
      return result.ok ? { ok: true, message: `${LABELS[kind]} atualizada.` } : result;
    }, { refresh: false });
  }

  function deleteOption(kind: EditableKind, id: string) {
    run(`Excluindo ${LABELS[kind].toLowerCase()}...`, async () => {
      const result = await deleteUserSettingOptionAction(kind, id);
      if (result.ok) {
        removeLocalOption(kind, id);
      }
      return result.ok ? { ok: true, message: `${LABELS[kind]} excluída.` } : result;
    }, { refresh: false });
  }

  function addLocalOption(kind: EditableKind, option: SettingsOption) {
    setLocalOptions((current) => {
      if (kind === "category") {
        return { ...current, categories: [...current.categories, option as Category] };
      }

      if (kind === "expenseType") {
        return { ...current, expenseTypes: [...current.expenseTypes, option as ExpenseType] };
      }

      return { ...current, paymentMethods: [...current.paymentMethods, option as PaymentMethod] };
    });
  }

  function updateLocalOption(kind: EditableKind, id: string, optionName: string) {
    setLocalOptions((current) => {
      if (kind === "category") {
        return {
          ...current,
          categories: current.categories.map((option) =>
            option.id === id ? { ...option, name: optionName } : option,
          ),
        };
      }

      if (kind === "expenseType") {
        return {
          ...current,
          expenseTypes: current.expenseTypes.map((option) =>
            option.id === id ? { ...option, name: optionName } : option,
          ),
        };
      }

      return {
        ...current,
        paymentMethods: current.paymentMethods.map((option) =>
          option.id === id ? { ...option, name: optionName } : option,
        ),
      };
    });
  }

  function removeLocalOption(kind: EditableKind, id: string) {
    setLocalOptions((current) => {
      if (kind === "category") {
        return { ...current, categories: current.categories.filter((option) => option.id !== id) };
      }

      if (kind === "expenseType") {
        return {
          ...current,
          expenseTypes: current.expenseTypes.filter((option) => option.id !== id),
        };
      }

      return {
        ...current,
        paymentMethods: current.paymentMethods.filter((option) => option.id !== id),
      };
    });
  }

  const isErrorMessage = /Não|Nao|inválid|invalid|Informe|Use uma senha/i.test(message);
  const isBusy = isPending || Boolean(pendingLabel);

  return (
    <section className="settings-page-grid" aria-label="Configurações da conta">
      <aside className="settings-hero">
        <span className="settings-kicker">Conta</span>
        <h1>Configurações</h1>
        <p>
          Ajuste seu perfil e mantenha categorias, tipos de gasto e formas de pagamento
          organizados para seus lançamentos.
        </p>
        <div className="settings-email-card">
          <AppIcon className="app-icon" name="envelope" />
          <strong>{email}</strong>
        </div>
      </aside>

      <div className="settings-mobile-profile" aria-label="Resumo do perfil">
        <div className="settings-avatar-large">{initial}</div>
        <h2>{name}</h2>
        <p>
          <AppIcon className="app-icon" name="envelope" />
          {email}
        </p>
      </div>

      <div className="settings-content">
        {settingsMessage ? <p className="info-message">{settingsMessage}</p> : null}
        {message ? (
          <p className={isErrorMessage ? "error-message" : "success-message"} role="status">
            {message}
          </p>
        ) : null}
        {pendingLabel ? (
          <p className="info-message" role="status">
            {pendingLabel}
          </p>
        ) : null}

        <section className="settings-glass-card settings-profile-card">
          <SettingsHeader icon="user" tag="Perfil" title="Dados da conta" />
          <div className="settings-field-group">
            <label htmlFor="settings-name">Nome</label>
            <div className="settings-input-inline">
              <input
                id="settings-name"
                maxLength={80}
                placeholder="Seu nome completo"
                value={profileName}
                onChange={(event) => setProfileName(event.target.value)}
              />
              <button
                className="settings-secondary-button"
                disabled={isBusy}
                type="button"
                onClick={() => run("Salvando nome...", () => updateAccountNameAction(profileName))}
              >
                Salvar nome
              </button>
            </div>
          </div>
          <div className="settings-field-group">
            <label htmlFor="settings-password">Nova senha</label>
            <div className="settings-input-inline">
              <input
                autoComplete="new-password"
                id="settings-password"
                minLength={6}
                placeholder="Mínimo de 6 caracteres"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
              <button
                className="settings-secondary-button"
                disabled={isBusy}
                type="button"
                onClick={() => run("Atualizando senha...", () => updateAccountPasswordAction(password))}
              >
                Trocar senha
              </button>
            </div>
          </div>
        </section>

        <SettingsList
          confirmingDelete={confirmingDelete}
          kind="category"
          newName={newNames.category}
          options={localOptions.categories}
          pending={isBusy}
          onCancelDelete={() => setConfirmingDelete(null)}
          onConfirmDelete={(id) => deleteOption("category", id)}
          onCreate={() => createOption("category")}
          onEditName={(id, value) => setEditingNames((current) => ({ ...current, [id]: value }))}
          onNewName={(value) => setNewNames((current) => ({ ...current, category: value }))}
          onRequestDelete={(id) => setConfirmingDelete(id)}
          onUpdate={(id, currentName) => updateOption("category", id, currentName)}
        />

        <div className="settings-split-grid">
          <SettingsList
            confirmingDelete={confirmingDelete}
            kind="expenseType"
            newName={newNames.expenseType}
            options={localOptions.expenseTypes}
            pending={isBusy}
            onCancelDelete={() => setConfirmingDelete(null)}
            onConfirmDelete={(id) => deleteOption("expenseType", id)}
            onCreate={() => createOption("expenseType")}
            onEditName={(id, value) => setEditingNames((current) => ({ ...current, [id]: value }))}
            onNewName={(value) => setNewNames((current) => ({ ...current, expenseType: value }))}
            onRequestDelete={(id) => setConfirmingDelete(id)}
            onUpdate={(id, currentName) => updateOption("expenseType", id, currentName)}
          />
          <SettingsList
            confirmingDelete={confirmingDelete}
            kind="paymentMethod"
            newName={newNames.paymentMethod}
            options={localOptions.paymentMethods}
            pending={isBusy}
            onCancelDelete={() => setConfirmingDelete(null)}
            onConfirmDelete={(id) => deleteOption("paymentMethod", id)}
            onCreate={() => createOption("paymentMethod")}
            onEditName={(id, value) => setEditingNames((current) => ({ ...current, [id]: value }))}
            onNewName={(value) => setNewNames((current) => ({ ...current, paymentMethod: value }))}
            onRequestDelete={(id) => setConfirmingDelete(id)}
            onUpdate={(id, currentName) => updateOption("paymentMethod", id, currentName)}
          />
        </div>
      </div>
    </section>
  );
}

function SettingsHeader({
  icon,
  tag,
  title,
  description,
}: {
  icon: "user" | "shopping-bag" | "squares" | "wallet";
  tag: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="settings-section-heading">
      <span>{tag}</span>
      <h2>
        <AppIcon className="app-icon" name={icon} />
        {title}
      </h2>
      {description ? <p>{description}</p> : null}
    </div>
  );
}

function SettingsList({
  confirmingDelete,
  kind,
  newName,
  options,
  pending,
  onCancelDelete,
  onConfirmDelete,
  onCreate,
  onEditName,
  onNewName,
  onRequestDelete,
  onUpdate,
}: {
  confirmingDelete: string | null;
  kind: EditableKind;
  newName: string;
  options: SettingsOption[];
  pending: boolean;
  onCancelDelete: () => void;
  onConfirmDelete: (id: string) => void;
  onCreate: () => void;
  onEditName: (id: string, value: string) => void;
  onNewName: (value: string) => void;
  onRequestDelete: (id: string) => void;
  onUpdate: (id: string, currentName: string) => void;
}) {
  const meta = LIST_META[kind];

  return (
    <section className="settings-glass-card" data-settings-kind={kind}>
      <SettingsHeader
        description={meta.description}
        icon={meta.icon}
        tag="Organização"
        title={meta.title}
      />
      <div className="settings-input-inline settings-create-row">
        <input
          aria-label={`Novo item em ${meta.title}`}
          placeholder={meta.placeholder}
          value={newName}
          onChange={(event) => onNewName(event.target.value)}
        />
        <button
          aria-label={`Adicionar ${meta.title}`}
          className="settings-primary-button"
          disabled={pending || !newName.trim()}
          type="button"
          onClick={onCreate}
        >
          <AppIcon className="app-icon" name="plus" />
          <span>Adicionar</span>
        </button>
      </div>

      <ul className="settings-option-list">
        {options.map((option) => {
          const isDefault = isDefaultOption(option);
          const isConfirming = confirmingDelete === option.id;

          return (
            <li className={isConfirming ? "is-confirming-delete" : ""} key={option.id}>
              <div className="settings-option-editor">
                <input
                  aria-label={`Editar ${option.name}`}
                  defaultValue={option.name}
                  onChange={(event) => onEditName(option.id, event.target.value)}
                />
                {isDefault ? <small>Sistema</small> : null}
              </div>
              {isConfirming ? (
                <div className="settings-confirm-actions">
                  <button
                    className="settings-confirm-delete"
                    disabled={pending}
                    type="button"
                    onClick={() => onConfirmDelete(option.id)}
                  >
                    Confirmar
                  </button>
                  <button
                    className="settings-cancel-delete"
                    disabled={pending}
                    type="button"
                    onClick={onCancelDelete}
                  >
                    Cancelar
                  </button>
                </div>
              ) : (
                <div className="settings-item-actions">
                  <button
                    aria-label={`Salvar ${option.name}`}
                    className="settings-icon-button edit"
                    disabled={pending}
                    type="button"
                    onClick={() => onUpdate(option.id, option.name)}
                  >
                    <AppIcon className="app-icon" name="pencil" />
                    <span>Editar</span>
                  </button>
                  <button
                    aria-label={`Excluir ${option.name}`}
                    className="settings-icon-button delete"
                    disabled={pending}
                    type="button"
                    onClick={() => onRequestDelete(option.id)}
                  >
                    <AppIcon className="app-icon" name="trash" />
                    <span>Excluir</span>
                  </button>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function isDefaultOption(option: SettingsOption): boolean {
  return "isDefault" in option ? option.isDefault : !isUuid(option.id);
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}
