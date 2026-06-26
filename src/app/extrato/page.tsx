import { redirect } from "next/navigation";
import { StatementApp } from "@/components/statement/StatementApp";
import { getAuthenticatedUser } from "@/lib/auth/session";
import { createServerExpenseRepository } from "@/lib/expenses/server-expense-repository";
import { parseStatementFilters } from "@/lib/expenses/statement-filters";
import { parseStatementPeriod } from "@/lib/expenses/statement-period";
import { createServerUserSettingsRepository } from "@/lib/user-settings/server-user-settings-repository";

export const dynamic = "force-dynamic";

type StatementPageProps = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function StatementPage({ searchParams }: StatementPageProps) {
  const session = await getAuthenticatedUser();

  if (!session.ok) {
    redirect("/login?redirect=/extrato");
  }

  const query = await searchParams;
  const period = parseStatementPeriod(query);
  const filters = parseStatementFilters(query);
  const [repository, settingsRepository] = await Promise.all([
    createServerExpenseRepository(),
    createServerUserSettingsRepository(),
  ]);
  const expenses = await repository.listByUserInDateRange(
    session.user.id,
    period.startDate,
    period.endDate,
  );
  const settings = await settingsRepository.listFinanceOptions(session.user.id);

  return (
    <StatementApp
      expenses={expenses}
      filters={filters}
      financeOptions={settings.options}
      period={period}
      settingsMessage={settings.settingsAvailable ? "" : settings.message}
      user={{
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
      }}
    />
  );
}
