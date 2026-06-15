import { SupabaseExpenseRepository, type ExpenseRepository } from "./expense-repository";
import { createClient } from "@/lib/supabase/server";

export async function createServerExpenseRepository(): Promise<ExpenseRepository> {
  return new SupabaseExpenseRepository(await createClient());
}
