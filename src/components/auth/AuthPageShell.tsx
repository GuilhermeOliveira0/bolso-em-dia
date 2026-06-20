import type { ReactNode } from "react";

type AuthPageShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
};

export function AuthPageShell({ eyebrow, title, description, children }: AuthPageShellProps) {
  return (
    <main className="auth-shell">
      <section className="auth-copy">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h1>{title}</h1>
          <p>{description}</p>
          <div className="auth-benefits" aria-label="Beneficios do Bolso em Dia">
            <span>Dados privados</span>
            <span>Gastos por usuário</span>
            <span>Uso rápido no celular</span>
          </div>
        </div>
      </section>
      <section className="panel auth-panel">{children}</section>
    </main>
  );
}
