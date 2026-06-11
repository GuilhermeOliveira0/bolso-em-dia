import type { SupabaseClient } from "@supabase/supabase-js";
import type { Expense, ExpenseDraft, ExpenseFormErrors } from "@/types/finance";
import type { Database } from "@/types/database";
import { validateExpenseDraft } from "./expense-schema";

export type CreateExpenseResult =
  | { ok: true; expense: Expense }
  | { ok: false; errors: ExpenseFormErrors };

export interface ExpenseRepository {
  listByUser(userId: string): Promise<Expense[]>;
  createManual(userId: string, draft: ExpenseDraft): Promise<CreateExpenseResult>;
}

function createExpenseId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `expense-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function mapExpenseRow(row: Database["public"]["Tables"]["expenses"]["Row"]): Expense {
  return {
    id: row.id,
    userId: row.user_id,
    amountInCents: row.amount,
    description: row.description,
    date: row.date,
    categoryId: row.category,
    expenseTypeId: row.expense_type,
    paymentMethod: row.payment_method,
    source: row.source,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export class SupabaseExpenseRepository implements ExpenseRepository {
  constructor(private readonly supabase: SupabaseClient<Database>) {}

  async listByUser(userId: string): Promise<Expense[]> {
    if (!userId) {
      return [];
    }

    const { data, error } = await this.supabase
      .from("expenses")
      .select("*")
      .eq("user_id", userId)
      .order("date", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error("Não foi possível listar seus gastos agora.");
    }

    return (data ?? []).map(mapExpenseRow);
  }

  async createManual(userId: string, draft: ExpenseDraft): Promise<CreateExpenseResult> {
    const validation = validateExpenseDraft(draft);

    if (!validation.ok) {
      return { ok: false, errors: validation.errors };
    }

    if (!userId) {
      return { ok: false, errors: { amount: "Entre na sua conta antes de salvar gastos." } };
    }

    const now = new Date().toISOString();
    const { data, error } = await this.supabase
      .from("expenses")
      .insert({
        id: createExpenseId(),
        user_id: userId,
        amount: validation.amountInCents,
        description: validation.data.description,
        date: validation.data.date,
        category: validation.data.categoryId,
        expense_type: validation.data.expenseTypeId,
        payment_method: validation.data.paymentMethod,
        source: "manual",
        created_at: now,
        updated_at: now,
      })
      .select("*")
      .single();

    if (error || !data) {
      return {
        ok: false,
        errors: { amount: "Não foi possível salvar o gasto. Verifique a configuração do banco." },
      };
    }

    return { ok: true, expense: mapExpenseRow(data) };
  }
}

const LEGACY_STORAGE_KEY = "bolso-em-dia:expenses:v1";

// Legado de desenvolvimento: nao usar como persistencia segura multiusuario.
function readLegacyExpenses(): Expense[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(LEGACY_STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeLegacyExpenses(expenses: Expense[]): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(LEGACY_STORAGE_KEY, JSON.stringify(expenses));
}

export class LegacyLocalExpenseRepository implements ExpenseRepository {
  async listByUser(userId: string): Promise<Expense[]> {
    return readLegacyExpenses()
      .filter((expense) => expense.userId === userId)
      .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt));
  }

  async createManual(userId: string, draft: ExpenseDraft): Promise<CreateExpenseResult> {
    const validation = validateExpenseDraft(draft);

    if (!validation.ok) {
      return { ok: false, errors: validation.errors };
    }

    if (!userId) {
      return { ok: false, errors: { amount: "Usuário obrigatório para salvar gasto." } };
    }

    const now = new Date().toISOString();
    const expense: Expense = {
      id: createExpenseId(),
      userId,
      amountInCents: validation.amountInCents,
      description: validation.data.description,
      date: validation.data.date,
      categoryId: validation.data.categoryId,
      expenseTypeId: validation.data.expenseTypeId,
      paymentMethod: validation.data.paymentMethod,
      source: "manual",
      createdAt: now,
      updatedAt: now,
    };

    writeLegacyExpenses([...readLegacyExpenses(), expense]);

    return { ok: true, expense };
  }
}
