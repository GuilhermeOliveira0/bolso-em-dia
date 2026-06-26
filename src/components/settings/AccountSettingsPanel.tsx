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
type EditingTarget = { id: string; kind: EditableKind; originalName: string } | null;

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
  const [editingTarget, setEditingTarget] = useState<EditingTarget>(null);
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
      try {
        const result = await action();
        setMessage(result.message ?? "Configuração atualizada.");
        if (result.ok) {
          setPassword("");
          setConfirmingDelete(null);
          if (options.refresh ?? true) {
            router.refresh();
          }
        }
      } catch {
        setMessage("Não foi possível atualizar agora. Tente novamente.");
      } finally {
        setPendingLabel("");
      }
    });
  }

  function createOption(kind: EditableKind) {
    const optionName = newNames[kind].trim();
    if (!optionName) {
      setMessage("Informe um nome para salvar.");
      return;
    }

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
    const nextName = (editingNames[id] ?? fallbackName).trim();

    if (!nextName) {
      setMessage("Informe um nome para atualizar.");
      return;
    }

    run(`Salvando ${LABELS[kind].toLowerCase()}...`, async () => {
      const result = await updateUserSettingOptionAction(kind, id, nextName);
      if (result.ok) {
        updateLocalOption(kind, id, nextName);
        setEditingTarget(null);
      }
      return result.ok ? { ok: true, message: `${LABELS[kind]} atualizada.` } : result;
    }, { refresh: false });
  }

  function deleteOption(kind: EditableKind, id: string) {
    run(`Excluindo ${LABELS[kind].toLowerCase()}...`, async () => {
      const result = await deleteUserSettingOptionAction(kind, id);
      if (result.ok) {
        removeLocalOption(kind, id);
        setEditingTarget(null);
      }
      return result.ok ? { ok: true, message: `${LABELS[kind]} excluída.` } : result;
    }, { refresh: false });
  }

  function startEditing(kind: EditableKind, option: SettingsOption) {
    setMessage("");
    setConfirmingDelete(null);
    setEditingTarget({ id: option.id, kind, originalName: option.name });
    setEditingNames((current) => ({ ...current, [option.id]: option.name }));
  }

  function cancelEditing() {
    if (editingTarget) {
      setEditingNames((current) => {
        const next = { ...current };
        delete next[editingTarget.id];
        return next;
      });
    }
    setEditingTarget(null);
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
        <nav className="settings-section-nav" aria-label="Seções de configurações">
          <a href="#settings-account">
            <AppIcon className="app-icon" name="user" />
            Conta
          </a>
          <a href="#settings-categories">
            <AppIcon className="app-icon" name="shopping-bag" />
            Categorias
          </a>
          <a href="#settings-types">
            <AppIcon className="app-icon" name="squares" />
            Tipos
          </a>
          <a href="#settings-payments">
            <AppIcon className="app-icon" name="wallet" />
            Pagamentos
          </a>
        </nav>
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
        <nav className="settings-mobile-tabs" aria-label="Seções de configurações">
          <a href="#settings-account">Conta</a>
          <a href="#settings-categories">Categorias</a>
          <a href="#settings-types">Tipos</a>
          <a href="#settings-payments">Pagamentos</a>
        </nav>

        {settingsMessage ? <p className="settings-alert-message">{settingsMessage}</p> : null}
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

        <section className="settings-glass-card settings-profile-card" id="settings-account">
          <SettingsHeader icon="user" tag="Perfil" title="Dados da conta" />
          <div className="settings-profile-grid">
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
                  Salvar
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
                  Trocar
                </button>
              </div>
            </div>
          </div>
        </section>

        <SettingsList
          confirmingDelete={confirmingDelete}
          editingTarget={editingTarget}
          kind="category"
          newName={newNames.category}
          options={localOptions.categories}
          pending={isBusy}
          onCancelDelete={() => setConfirmingDelete(null)}
          onCancelEdit={cancelEditing}
          onConfirmDelete={(id) => deleteOption("category", id)}
          onCreate={() => createOption("category")}
          onEditName={(id, value) => setEditingNames((current) => ({ ...current, [id]: value }))}
          onNewName={(value) => setNewNames((current) => ({ ...current, category: value }))}
          onRequestDelete={(id) => setConfirmingDelete(id)}
          onStartEdit={(option) => startEditing("category", option)}
          onUpdate={(id, currentName) => updateOption("category", id, currentName)}
        />

        <div className="settings-split-grid">
          <SettingsList
            confirmingDelete={confirmingDelete}
            editingTarget={editingTarget}
            kind="expenseType"
            newName={newNames.expenseType}
            options={localOptions.expenseTypes}
            pending={isBusy}
            onCancelDelete={() => setConfirmingDelete(null)}
            onCancelEdit={cancelEditing}
            onConfirmDelete={(id) => deleteOption("expenseType", id)}
            onCreate={() => createOption("expenseType")}
            onEditName={(id, value) => setEditingNames((current) => ({ ...current, [id]: value }))}
            onNewName={(value) => setNewNames((current) => ({ ...current, expenseType: value }))}
            onRequestDelete={(id) => setConfirmingDelete(id)}
            onStartEdit={(option) => startEditing("expenseType", option)}
            onUpdate={(id, currentName) => updateOption("expenseType", id, currentName)}
          />
          <SettingsList
            confirmingDelete={confirmingDelete}
            editingTarget={editingTarget}
            kind="paymentMethod"
            newName={newNames.paymentMethod}
            options={localOptions.paymentMethods}
            pending={isBusy}
            onCancelDelete={() => setConfirmingDelete(null)}
            onCancelEdit={cancelEditing}
            onConfirmDelete={(id) => deleteOption("paymentMethod", id)}
            onCreate={() => createOption("paymentMethod")}
            onEditName={(id, value) => setEditingNames((current) => ({ ...current, [id]: value }))}
            onNewName={(value) => setNewNames((current) => ({ ...current, paymentMethod: value }))}
            onRequestDelete={(id) => setConfirmingDelete(id)}
            onStartEdit={(option) => startEditing("paymentMethod", option)}
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
  editingTarget,
  kind,
  newName,
  options,
  pending,
  onCancelDelete,
  onCancelEdit,
  onConfirmDelete,
  onCreate,
  onEditName,
  onNewName,
  onRequestDelete,
  onStartEdit,
  onUpdate,
}: {
  confirmingDelete: string | null;
  editingTarget: EditingTarget;
  kind: EditableKind;
  newName: string;
  options: SettingsOption[];
  pending: boolean;
  onCancelDelete: () => void;
  onCancelEdit: () => void;
  onConfirmDelete: (id: string) => void;
  onCreate: () => void;
  onEditName: (id: string, value: string) => void;
  onNewName: (value: string) => void;
  onRequestDelete: (id: string) => void;
  onStartEdit: (option: SettingsOption) => void;
  onUpdate: (id: string, currentName: string) => void;
}) {
  const meta = LIST_META[kind];

  return (
    <section className="settings-glass-card" data-settings-kind={kind} id={getSettingsSectionId(kind)}>
      <div className="settings-list-heading">
        <SettingsHeader
          description={meta.description}
          icon={meta.icon}
          tag="Organização"
          title={meta.title}
        />
        <span className="settings-item-count">{options.length} itens</span>
      </div>

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
          const isEditing = editingTarget?.id === option.id && editingTarget.kind === kind;

          return (
            <li
              className={`${isConfirming ? "is-confirming-delete" : ""} ${isEditing ? "is-editing" : ""}`.trim()}
              key={option.id}
            >
              {isEditing ? (
                <div className="settings-option-editor">
                  <input
                    aria-label={`Editar ${option.name}`}
                    autoFocus
                    defaultValue={option.name}
                    onChange={(event) => onEditName(option.id, event.target.value)}
                  />
                </div>
              ) : (
                <div className="settings-option-summary">
                  <span className="settings-option-name">{option.name}</span>
                  <small>{isDefault ? "Sistema" : "Personalizado"}</small>
                </div>
              )}

              {isConfirming ? (
                <div className="settings-confirm-actions">
                  <span>Excluir este item?</span>
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
              ) : isEditing ? (
                <div className="settings-edit-actions">
                  <button
                    className="settings-confirm-edit"
                    disabled={pending}
                    type="button"
                    onClick={() => onUpdate(option.id, option.name)}
                  >
                    Salvar
                  </button>
                  <button
                    className="settings-cancel-edit"
                    disabled={pending}
                    type="button"
                    onClick={onCancelEdit}
                  >
                    Cancelar
                  </button>
                </div>
              ) : (
                <div className="settings-item-actions">
                  <button
                    aria-label={`Editar ${option.name}`}
                    className="settings-icon-button edit"
                    disabled={pending}
                    title={`Editar ${option.name}`}
                    type="button"
                    onClick={() => onStartEdit(option)}
                  >
                    <AppIcon className="app-icon" name="pencil" />
                  </button>
                  <button
                    aria-label={`Excluir ${option.name}`}
                    className="settings-icon-button delete"
                    disabled={pending}
                    title={`Excluir ${option.name}`}
                    type="button"
                    onClick={() => onRequestDelete(option.id)}
                  >
                    <AppIcon className="app-icon" name="trash" />
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

function getSettingsSectionId(kind: EditableKind): string {
  if (kind === "category") {
    return "settings-categories";
  }

  if (kind === "expenseType") {
    return "settings-types";
  }

  return "settings-payments";
}

function isDefaultOption(option: SettingsOption): boolean {
  return "isDefault" in option ? option.isDefault : !isUuid(option.id);
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}
