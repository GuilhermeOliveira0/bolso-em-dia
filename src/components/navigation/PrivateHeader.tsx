import Link from "next/link";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { AppIcon } from "@/components/ui/AppIcon";

type PrivateHeaderProps = {
  email: string;
  name: string;
  activePath: "/dashboard" | "/lancamentos" | "/extrato" | "/comprovantes";
};

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: "squares" },
  { href: "/lancamentos", label: "Cadastrar", icon: "plus" },
  { href: "/extrato", label: "Extrato", icon: "list" },
] as const;

export function PrivateHeader({ email, name, activePath }: PrivateHeaderProps) {
  const initial = (name || email || "B").slice(0, 1).toUpperCase();

  return (
    <header className="private-topbar">
      <div className="account-summary">
        <span className="brand-mark" aria-hidden="true">
          B
        </span>
        <div className="account-copy">
          <span>Bolso em Dia</span>
          <strong title={email}>Ola, {name}</strong>
        </div>
      </div>

      <nav className="private-navigation" aria-label="Navegacao principal">
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

      <div className="profile-area">
        <span className="avatar-chip" title={email}>
          {initial}
        </span>
        <LogoutButton />
      </div>
    </header>
  );
}
