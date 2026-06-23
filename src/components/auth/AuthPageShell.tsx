import type { ReactNode } from "react";
import { BrandLogo } from "@/components/ui/BrandLogo";

type AuthPageShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
};

export function AuthPageShell({ eyebrow, title, description, children }: AuthPageShellProps) {
  return (
    <main className="auth-shell">
      <div className="auth-orb auth-orb-one" aria-hidden="true" />
      <div className="auth-orb auth-orb-two" aria-hidden="true" />

      <section className="auth-panel" aria-labelledby="auth-title">
        <div className="auth-logo-area">
          <BrandLogo className="auth-brand-logo" />
          <p className="eyebrow">{eyebrow}</p>
          <div className="auth-title-copy">
            <h1 id="auth-title">Bolso em Dia</h1>
            <strong>{title}</strong>
          </div>
          <p>{description}</p>
        </div>

        {children}

        <div className="auth-benefits" aria-label="Benefícios do Bolso em Dia">
          <span>Dados privados</span>
          <span>Controle rápido</span>
          <span>Mobile-first</span>
        </div>
      </section>
    </main>
  );
}
