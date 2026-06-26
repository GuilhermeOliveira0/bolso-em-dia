import Link from "next/link";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { AccountSettingsButton } from "@/components/settings/AccountSettingsButton";
import { AppIcon } from "@/components/ui/AppIcon";
import { BrandLogo } from "@/components/ui/BrandLogo";

type PrivateHeaderProps = {
  email: string;
  name: string;
  activePath: "/dashboard" | "/lancamentos" | "/extrato" | "/comprovantes" | "/configuracoes";
};

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: "squares" },
  { href: "/lancamentos", label: "Cadastrar", icon: "plus" },
  { href: "/extrato", label: "Extrato", icon: "list" },
] as const;

function PrivateNavigation({
  activePath,
  className,
}: {
  activePath: PrivateHeaderProps["activePath"];
  className: string;
}) {
  return (
    <nav className={className} aria-label="Navegação principal">
      {navItems.map((item) => (
        <Link
          aria-current={activePath === item.href ? "page" : undefined}
          href={item.href}
          key={item.href}
        >
          <AppIcon className="app-icon nav-svg" name={item.icon} />
          <span>{item.label}</span>
        </Link>
      ))}
    </nav>
  );
}

export function PrivateHeader({
  email,
  name,
  activePath,
}: PrivateHeaderProps) {
  const initial = (name || email || "B").slice(0, 1).toUpperCase();

  return (
    <>
      <header className="private-topbar">
        <div className="account-summary">
          <span className="brand-mark" aria-hidden="true">
            <BrandLogo className="brand-logo" />
          </span>
          <div className="account-copy">
            <span>Bolso em Dia</span>
            <strong title={email}>Olá, {name}</strong>
          </div>
        </div>

        <PrivateNavigation
          activePath={activePath}
          className="private-navigation private-navigation-desktop"
        />

        <div className="profile-area">
          <AccountSettingsButton
            email={email}
            initial={initial}
          />
          <LogoutButton />
        </div>
      </header>

      <PrivateNavigation
        activePath={activePath}
        className="private-navigation private-navigation-mobile"
      />
    </>
  );
}
