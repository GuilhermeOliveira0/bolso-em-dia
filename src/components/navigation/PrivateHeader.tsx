import Link from "next/link";
import { LogoutButton } from "@/components/auth/LogoutButton";

type PrivateHeaderProps = {
  email: string;
  name: string;
  activePath: "/dashboard" | "/lancamentos" | "/comprovantes";
};

export function PrivateHeader({ email, name, activePath }: PrivateHeaderProps) {
  return (
    <header className="private-topbar">
      <div className="account-summary">
        <span className="brand-mark" aria-hidden="true">
          B
        </span>
        <div className="account-copy">
          <span>Bolso em Dia</span>
          <strong title={email}>{name}</strong>
        </div>
      </div>
      <nav className="private-navigation" aria-label="Navegacao principal">
        <Link aria-current={activePath === "/dashboard" ? "page" : undefined} href="/dashboard">
          <span className="nav-icon nav-icon-dashboard" aria-hidden="true" />
          Dashboard
        </Link>
        <Link
          aria-current={activePath === "/lancamentos" ? "page" : undefined}
          href="/lancamentos"
        >
          <span className="nav-icon nav-icon-plus" aria-hidden="true" />
          Lançamentos
        </Link>
        <Link
          aria-current={activePath === "/comprovantes" ? "page" : undefined}
          href="/comprovantes"
        >
          <span className="nav-icon nav-icon-receipt" aria-hidden="true" />
          Comprovantes
        </Link>
      </nav>
      <LogoutButton />
    </header>
  );
}
