import type { SupabaseClient } from "@supabase/supabase-js";
import type { Expense, ExpenseDraft, ExpenseFormErrors } from "@/types/finance";
import type { Database } from "@/types/database";
import { validateExpenseDraft } from "./expense-schema";

export type CreateExpenseResult =
  | { ok: true; expense: Expense }
  | { ok: false; errors: ExpenseFormErrors };

export interface ExpenseRepository {
  listByUser(userId: string): Promise<Expense[]>;
  listByUserInDateRange(userId: string, startDate: string, endDate: string): Promise<Expense[]>;
  createManual(userId: string, draft: ExpenseDraft): Promise<CreateExpenseResult>;
  createFromReceipt(
    userId: string,
    draft: ExpenseDraft,
    receiptId: string,
  ): Promise<CreateExpenseResult>;
}

const EXPENSE_COLUMNS =
  "id,user_id,amount,description,date,category,expense_type,payment_method,source,created_at,updated_at";

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
      .select(EXPENSE_COLUMNS)
      .eq("user_id", userId)
      .order("date", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error("Não foi possível listar seus gastos agora.");
    }

    return (data ?? []).map(mapExpenseRow);
  }

  async listByUserInDateRange(
    userId: string,
    startDate: string,
    endDate: string,
  ): Promise<Expense[]> {
    if (!userId) {
      return [];
    }

    const { data, error } = await this.supabase
      .from("expenses")
      .select(EXPENSE_COLUMNS)
      .eq("user_id", userId)
      .gte("date", startDate)
      .lt("date", endDate)
      .order("date", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error("Não foi possível listar seus gastos agora.");
    }

    return (data ?? []).map(mapExpenseRow);
  }

  private async create(
    userId: string,
    draft: ExpenseDraft,
    source: Expense["source"],
  ): Promise<CreateExpenseResult> {
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
        source,
        created_at: now,
        updated_at: now,
      })
      .select(EXPENSE_COLUMNS)
      .single();

    if (error || !data) {
      return {
        ok: false,
        errors: { amount: "Não foi possível salvar o gasto. Verifique a configuração do banco." },
      };
    }

    return { ok: true, expense: mapExpenseRow(data) };
  }

  async createManual(userId: string, draft: ExpenseDraft): Promise<CreateExpenseResult> {
    return this.create(userId, draft, "manual");
  }

  async createFromReceipt(
    userId: string,
    draft: ExpenseDraft,
    receiptId: string,
  ): Promise<CreateExpenseResult> {
    if (!receiptId) {
      return { ok: false, errors: { amount: "Selecione um comprovante antes de salvar." } };
    }

    return this.create(userId, draft, "ocr");
  }
}
