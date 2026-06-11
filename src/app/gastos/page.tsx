import { redirect } from "next/navigation";
import { ManualExpenseApp } from "@/components/expense/ManualExpenseApp";
import { getAuthenticatedUser } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function ExpensesPage() {
  const session = await getAuthenticatedUser();

  if (!session.ok) {
    redirect("/login");
  }

  return (
    <ManualExpenseApp
      user={{
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
      }}
    />
  );
}
