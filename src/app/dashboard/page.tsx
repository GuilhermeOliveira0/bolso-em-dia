import Link from "next/link";
import { redirect } from "next/navigation";
import { DashboardView } from "@/components/dashboard/DashboardView";
import { PrivateHeader } from "@/components/navigation/PrivateHeader";
import { getAuthenticatedUser } from "@/lib/auth/session";
import {
  buildDashboardSummary,
  getDashboardDateRange,
  getDashboardYears,
  parseDashboardPeriod,
} from "@/lib/dashboard/dashboard-summary";
import { createServerExpenseRepository } from "@/lib/expenses/server-expense-repository";

export const dynamic = "force-dynamic";

type DashboardPageProps = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const session = await getAuthenticatedUser();
  if (!session.ok) redirect("/login");

  const query = await searchParams;
  const period = parseDashboardPeriod(query.month, query.year);

  try {
    const repository = await createServerExpenseRepository();
    const { startDate, endDate } = getDashboardDateRange(period);
    const expenses = await repository.listByUserInDateRange(
      session.user.id,
      startDate,
      endDate,
    );
    const summary = buildDashboardSummary(expenses, period);
    const availableYears = getDashboardYears(period.year);
    return <DashboardView availableYears={availableYears} email={session.user.email} name={session.user.name} period={period} summary={summary} />;
  } catch {
    return (
      <main className="app-shell dashboard-shell">
        <PrivateHeader activePath="/dashboard" email={session.user.email} name={session.user.name} />
        <section className="dashboard-error" role="alert">
          <p>Não foi possível carregar sua dashboard agora.</p>
          <span>Seus dados não foram alterados. Tente novamente em alguns instantes.</span>
          <Link className="primary-link" href="/dashboard">
            Tentar novamente
          </Link>
        </section>
      </main>
    );
  }
}
