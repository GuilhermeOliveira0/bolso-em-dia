import Link from "next/link";
import { redirect } from "next/navigation";
import { DashboardView } from "@/components/dashboard/DashboardView";
import { PrivateHeader } from "@/components/navigation/PrivateHeader";
import { getAuthenticatedUser } from "@/lib/auth/session";
import { buildDashboardSummary, parseDashboardPeriod } from "@/lib/dashboard/dashboard-summary";
import { SupabaseExpenseRepository } from "@/lib/expenses/expense-repository";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type DashboardPageProps = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const session = await getAuthenticatedUser();
  if (!session.ok) redirect("/login");

  const query = await searchParams;
  const period = parseDashboardPeriod(query.month, query.year);

  try {
    const supabase = await createClient();
    const repository = new SupabaseExpenseRepository(supabase);
    const expenses = await repository.listByUser(session.user.id);
    const summary = buildDashboardSummary(expenses, period);
    const availableYears = Array.from(new Set([period.year, new Date().getFullYear(), ...expenses.map((expense) => Number(expense.date.slice(0, 4)))])).sort((a, b) => b - a);
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
