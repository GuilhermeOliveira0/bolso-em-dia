import Link from "next/link";
import { LogoutButton } from "@/components/auth/LogoutButton";

type PrivateHeaderProps = {
  email: string;
  name: string;
  activePath: "/dashboard" | "/gastos" | "/comprovantes";
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
          <span className="nav-dot" aria-hidden="true" />
          Dashboard
        </Link>
        <Link aria-current={activePath === "/gastos" ? "page" : undefined} href="/gastos">
          <span className="nav-dot" aria-hidden="true" />
          Gastos
        </Link>
        <Link
          aria-current={activePath === "/comprovantes" ? "page" : undefined}
          href="/comprovantes"
        >
          <span className="nav-dot" aria-hidden="true" />
          Comprovantes
        </Link>
      </nav>
      <LogoutButton />
    </header>
  );
}
