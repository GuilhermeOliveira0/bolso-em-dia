import Link from "next/link";
import { LogoutButton } from "@/components/auth/LogoutButton";

type PrivateHeaderProps = {
  email: string;
  name: string;
  activePath: "/dashboard" | "/gastos";
};

export function PrivateHeader({ email, name, activePath }: PrivateHeaderProps) {
  return (
    <header className="private-topbar">
      <div className="account-summary">
        <span>Bolso em Dia</span>
        <strong title={email}>{name}</strong>
      </div>
      <nav className="private-navigation" aria-label="Navegação principal">
        <Link aria-current={activePath === "/dashboard" ? "page" : undefined} href="/dashboard">
          Dashboard
        </Link>
        <Link aria-current={activePath === "/gastos" ? "page" : undefined} href="/gastos">
          Gastos
        </Link>
      </nav>
      <LogoutButton />
    </header>
  );
}
