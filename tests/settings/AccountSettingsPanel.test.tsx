import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AccountSettingsPanel } from "@/components/settings/AccountSettingsPanel";
import { DEFAULT_FINANCE_OPTIONS } from "@/lib/user-settings/finance-options";

const refresh = vi.fn();
const replace = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh, replace }),
}));

vi.mock("@/app/settings-actions", () => ({
  createUserSettingOptionAction: vi.fn(),
  deleteUserSettingOptionAction: vi.fn(),
  updateAccountNameAction: vi.fn(),
  updateAccountPasswordAction: vi.fn(),
  updateUserSettingOptionAction: vi.fn(),
}));

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    auth: {
      signOut: vi.fn().mockResolvedValue({}),
    },
  }),
}));

function renderPanel() {
  render(
    <AccountSettingsPanel
      email="guilherme@example.com"
      financeOptions={DEFAULT_FINANCE_OPTIONS}
      initial="G"
      name="Guilherme"
    />,
  );
}

describe("AccountSettingsPanel", () => {
  it("mostra apenas a seção ativa e destaca o botão lateral selecionado", () => {
    renderPanel();

    expect(screen.getByRole("heading", { name: "Dados da conta" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Categorias" })).not.toBeInTheDocument();

    const sidebar = screen.getByRole("navigation", { name: "Menu de configurações" });
    const accountButton = within(sidebar).getByRole("button", { name: /Dados da Conta/i });
    const categoriesButton = within(sidebar).getByRole("button", { name: /Categorias/i });

    expect(accountButton).toHaveAttribute("aria-current", "page");
    expect(categoriesButton).not.toHaveAttribute("aria-current");

    fireEvent.click(categoriesButton);

    expect(screen.getByRole("heading", { name: "Categorias" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Dados da conta" })).not.toBeInTheDocument();
    expect(categoriesButton).toHaveAttribute("aria-current", "page");
    expect(accountButton).not.toHaveAttribute("aria-current");
  });

  it("navega entre tipos de gasto, formas de pagamento e mantém logout no menu", () => {
    renderPanel();

    const sidebar = screen.getByRole("navigation", { name: "Menu de configurações" });

    fireEvent.click(within(sidebar).getByRole("button", { name: /Tipos de Gasto/i }));
    expect(screen.getByRole("heading", { name: "Tipos de gasto" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Formas de pagamento" })).not.toBeInTheDocument();

    fireEvent.click(within(sidebar).getByRole("button", { name: /Formas de Pagamento/i }));
    expect(screen.getByRole("heading", { name: "Formas de pagamento" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Tipos de gasto" })).not.toBeInTheDocument();
    expect(within(sidebar).getByRole("button", { name: /Encerrar Sessão/i })).toBeInTheDocument();
  });

  it("bloqueia mutações quando as configurações persistidas não estão ativas", () => {
    render(
      <AccountSettingsPanel
        email="guilherme@example.com"
        financeOptions={DEFAULT_FINANCE_OPTIONS}
        initial="G"
        name="Guilherme"
        settingsMessage="Aplique a migration de configurações."
      />,
    );

    const sidebar = screen.getByRole("navigation", { name: "Menu de configurações" });
    fireEvent.click(within(sidebar).getByRole("button", { name: /Categorias/i }));
    fireEvent.change(screen.getByRole("textbox", { name: "Novo item em Categorias" }), {
      target: { value: "Teste" },
    });

    expect(screen.getByRole("button", { name: "Adicionar Categorias" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Editar Alimentação" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Excluir Alimentação" })).toBeDisabled();
  });
});
