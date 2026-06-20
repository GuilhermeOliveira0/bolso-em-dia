import { redirect } from "next/navigation";
import { StatementApp } from "@/components/statement/StatementApp";
import { getAuthenticatedUser } from "@/lib/auth/session";
import { createServerExpenseRepository } from "@/lib/expenses/server-expense-repository";

export const dynamic = "force-dynamic";

export default async function StatementPage() {
  const session = await getAuthenticatedUser();

  if (!session.ok) {
    redirect("/login?redirect=/extrato");
  }

  const repository = await createServerExpenseRepository();
  const expenses = await repository.listByUser(session.user.id);

  return (
    <StatementApp
      expenses={expenses}
      user={{
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
      }}
    />
  );
}
