import Link from "next/link";
import { PrivateHeader } from "@/components/navigation/PrivateHeader";
import { getCategoryName } from "@/lib/categories/default-categories";
import type { DashboardGroup, DashboardPeriod, DashboardSummary } from "@/lib/dashboard/dashboard-summary";
import { getExpenseTypeName } from "@/lib/expense-types/default-expense-types";
import { formatCentsToCurrency } from "@/lib/expenses/money";
import type { Expense } from "@/types/finance";

const MONTHS = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

type DashboardViewProps = {
  email: string;
  name: string;
  period: DashboardPeriod;
  summary: DashboardSummary;
  availableYears: number[];
};

export function DashboardView({ email, name, period, summary, availableYears }: DashboardViewProps) {
  const latestExpenses = summary.expenses.slice(0, 5);

  return (
    <main className="app-shell dashboard-shell">
      <PrivateHeader activePath="/dashboard" email={email} name={name} />
      <section className="dashboard-intro">
        <div>
          <p className="eyebrow">Resumo financeiro</p>
          <h1>Dashboard</h1>
          <p>Veja rapidamente onde o dinheiro foi usado no período selecionado.</p>
        </div>
        <form className="period-filter" method="get">
          <label><span>Mês</span><select defaultValue={period.month} name="month">{MONTHS.map((month, index) => <option key={month} value={index + 1}>{month}</option>)}</select></label>
          <label><span>Ano</span><select defaultValue={period.year} name="year">{availableYears.map((year) => <option key={year} value={year}>{year}</option>)}</select></label>
          <button className="primary-action" type="submit">Aplicar</button>
        </form>
      </section>

      {summary.expenseCount === 0 ? (
        <section className="dashboard-empty" aria-live="polite">
          <p>Nenhum gasto encontrado em {MONTHS[period.month - 1].toLowerCase()} de {period.year}.</p>
          <span>Cadastre um gasto ou escolha outro período para visualizar seu resumo.</span>
          <Link className="primary-link" href="/gastos">Cadastrar gasto</Link>
        </section>
      ) : (
        <>
          <section className="metric-grid" aria-label="Indicadores do período">
            <MetricCard label="Total do mês" value={summary.totalInCents} />
            <MetricCard label="Necessário" value={summary.necessaryInCents} />
            <MetricCard label="Lazer" value={summary.leisureInCents} />
            <MetricCard label="Supérfluo" value={summary.superfluousInCents} />
            <MetricCard description="Estimativa de 50% dos gastos supérfluos." label="Economia possível" value={summary.possibleSavingsInCents} />
          </section>
          <section className="dashboard-grid">
            <SummaryList groups={summary.byCategory} title="Gastos por categoria" />
            <SummaryList groups={summary.byType} title="Gastos por tipo" />
          </section>
          <section className="dashboard-grid dashboard-lists">
            <ExpenseRanking expenses={latestExpenses} title="Últimos gastos" />
            <ExpenseRanking expenses={summary.topExpenses} title="Maiores gastos" />
          </section>
        </>
      )}
    </main>
  );
}

function MetricCard({ label, value, description }: { label: string; value: number; description?: string }) {
  return <article className="metric-card"><span>{label}</span><strong>{formatCentsToCurrency(value)}</strong>{description ? <small>{description}</small> : null}</article>;
}

function SummaryList({ groups, title }: { groups: DashboardGroup[]; title: string }) {
  const highestValue = groups[0]?.totalInCents ?? 0;
  return <article className="dashboard-panel"><h2>{title}</h2><ul className="summary-list">{groups.map((group) => <li key={group.id}><div><span>{group.name}</span><strong>{formatCentsToCurrency(group.totalInCents)}</strong></div><div className="summary-track" aria-hidden="true"><span style={{ width: `${(group.totalInCents / highestValue) * 100}%` }} /></div></li>)}</ul></article>;
}

function ExpenseRanking({ expenses, title }: { expenses: Expense[]; title: string }) {
  return <article className="dashboard-panel"><h2>{title}</h2><ol className="ranking-list">{expenses.map((expense) => <li key={expense.id}><div><strong>{expense.description || "Gasto sem descrição"}</strong><span>{getCategoryName(expense.categoryId)} · {getExpenseTypeName(expense.expenseTypeId)} · {formatDate(expense.date)}</span></div><b>{formatCentsToCurrency(expense.amountInCents)}</b></li>)}</ol></article>;
}

function formatDate(date: string): string {
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(`${date}T00:00:00`));
}
