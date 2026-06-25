import { redirect } from "next/navigation";
import { StatementApp } from "@/components/statement/StatementApp";
import { getAuthenticatedUser } from "@/lib/auth/session";
import { createServerExpenseRepository } from "@/lib/expenses/server-expense-repository";
import { parseStatementPeriod } from "@/lib/expenses/statement-period";

export const dynamic = "force-dynamic";

type StatementPageProps = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function StatementPage({ searchParams }: StatementPageProps) {
  const session = await getAuthenticatedUser();

  if (!session.ok) {
    redirect("/login?redirect=/extrato");
  }

  const query = await searchParams;
  const period = parseStatementPeriod(query);
  const repository = await createServerExpenseRepository();
  const expenses = await repository.listByUserInDateRange(
    session.user.id,
    period.startDate,
    period.endDate,
  );

  return (
    <StatementApp
      expenses={expenses}
      period={period}
      user={{
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
      }}
    />
  );
}
