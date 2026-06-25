import Link from "next/link";
import { PrivateHeader } from "@/components/navigation/PrivateHeader";
import { AppIcon } from "@/components/ui/AppIcon";
import { getCategoryName } from "@/lib/categories/default-categories";
import type {
  DashboardGroup,
  DashboardPeriod,
  DashboardSummary,
} from "@/lib/dashboard/dashboard-summary";
import { getExpenseTypeName } from "@/lib/expense-types/default-expense-types";
import { formatCentsToCurrency } from "@/lib/expenses/money";
import type { Expense } from "@/types/finance";

const MONTHS = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

type DashboardViewProps = {
  email: string;
  name: string;
  period: DashboardPeriod;
  summary: DashboardSummary;
  availableYears: number[];
};

export function DashboardView({ email, name, period, summary, availableYears }: DashboardViewProps) {
  const latestExpenses = summary.expenses.slice(0, 3);

  return (
    <main className="app-shell dashboard-shell">
      <PrivateHeader activePath="/dashboard" email={email} name={name} />

      <section className="mobile-total-card">
        <span>Gasto total do mês</span>
        <strong>{formatCentsToCurrency(summary.totalInCents)}</strong>
        <small>
          <AppIcon className="app-icon" name="check" />
          No controle
        </small>
      </section>

      <section className="dashboard-intro">
        <form className="period-filter" method="get">
          <label>
            <span>Mês</span>
            <select defaultValue={period.month} name="month">
              {MONTHS.map((month, index) => (
                <option key={month} value={index + 1}>
                  {month}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>Ano</span>
            <select defaultValue={period.year} name="year">
              {availableYears.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </label>
          <button className="primary-action" type="submit">
            Aplicar
          </button>
        </form>
      </section>

      {summary.expenseCount === 0 ? (
        <section className="dashboard-empty" aria-live="polite">
          <p>Nenhum gasto encontrado em {MONTHS[period.month - 1]} de {period.year}.</p>
          <span>Cadastre um gasto para visualizar seu resumo financeiro.</span>
          <Link className="primary-link" href="/lancamentos">
            Cadastrar despesa
          </Link>
        </section>
      ) : (
        <>
          <section className="metric-grid" aria-label="Indicadores do período">
            <MetricCard
              icon="wallet"
              label="Total do mês"
              tone="primary"
              value={summary.totalInCents}
            />
            <MetricCard
              icon="home"
              label="Necessário"
              tone="blue"
              value={summary.necessaryInCents}
            />
            <MetricCard
              icon="martini"
              label="Lazer"
              tone="purple"
              value={summary.leisureInCents}
            />
            <MetricCard
              icon="shopping-bag"
              label="Supérfluo"
              tone="accent"
              value={summary.superfluousInCents}
            />
            <MetricCard
              icon="lightbulb"
              label="Economia"
              tone="success"
              value={summary.possibleSavingsInCents}
            />
          </section>

          <section className="dashboard-grid">
            <div className="dashboard-main-column">
              <AlertCard savingsInCents={summary.possibleSavingsInCents} />
              <SummaryList groups={summary.byCategory} title="Resumo por categoria" />
            </div>
            <ExpenseRanking expenses={latestExpenses} title="Últimos gastos" />
          </section>
        </>
      )}
    </main>
  );
}

function MetricCard({
  label,
  value,
  icon,
  tone = "default",
}: {
  label: string;
  value: number;
  icon: "wallet" | "home" | "martini" | "shopping-bag" | "lightbulb";
  tone?: "default" | "primary" | "accent" | "success" | "blue" | "purple";
}) {
  return (
    <article className={`metric-card is-${tone}`}>
      <span className="metric-header">
        <b>{label}</b>
        <AppIcon className="app-icon" name={icon} />
      </span>
      <strong>{formatCentsToCurrency(value)}</strong>
    </article>
  );
}

function AlertCard({ savingsInCents }: { savingsInCents: number }) {
  return (
    <article className="dashboard-panel">
      <h2>
        <AppIcon className="app-icon" name="bell" />
        Alertas inteligentes
      </h2>
      <div className="alert-item">
        <AppIcon className="app-icon" name="lightbulb" />
        <div>
          <h3>Atenção aos supérfluos</h3>
          <p>
            Reduzindo parte dos gastos não essenciais, você pode economizar até{" "}
            {formatCentsToCurrency(savingsInCents)} neste período.
          </p>
          <small>
            Estimamos a economia possível como 50% dos gastos marcados como Supérfluo no
            período. Necessário, Importante, Lazer, Investimento, Dívida e A receber não entram
            nesse cálculo.
          </small>
        </div>
      </div>
    </article>
  );
}

function SummaryList({ groups, title }: { groups: DashboardGroup[]; title: string }) {
  const highestValue = groups[0]?.totalInCents ?? 0;
  return (
    <article className="dashboard-panel">
      <h2>
        <AppIcon className="app-icon" name="chart" />
        {title}
      </h2>
      <ul className="summary-list">
        {groups.slice(0, 4).map((group) => (
          <li key={group.id}>
            <div>
              <span>{group.name}</span>
              <strong>{formatCentsToCurrency(group.totalInCents)}</strong>
            </div>
            <div className="summary-track" aria-hidden="true">
              <span style={{ width: `${highestValue ? (group.totalInCents / highestValue) * 100 : 0}%` }} />
            </div>
          </li>
        ))}
      </ul>
    </article>
  );
}

function ExpenseRanking({ expenses, title }: { expenses: Expense[]; title: string }) {
  return (
    <article className="dashboard-panel latest-panel">
      <h2>
        <AppIcon className="app-icon" name="list" />
        {title}
      </h2>
      <ol className="ranking-list">
        {expenses.map((expense) => (
          <li key={expense.id}>
            <div>
              <strong>{expense.description || "Gasto sem descrição"}</strong>
              <span>
                {getCategoryName(expense.categoryId)} | {getExpenseTypeName(expense.expenseTypeId)}
              </span>
            </div>
            <b>- {formatCentsToCurrency(expense.amountInCents)}</b>
          </li>
        ))}
      </ol>
    </article>
  );
}
