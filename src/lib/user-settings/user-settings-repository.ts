import type { SupabaseClient } from "@supabase/supabase-js";
import { buildFinanceOptions, type FinanceOptions } from "@/lib/user-settings/finance-options";
import type { Database } from "@/types/database";
import type { Category, ExpenseType, PaymentMethod } from "@/types/finance";

export type UserSettingsResult =
  | { ok: true; options: FinanceOptions; settingsAvailable: true }
  | { ok: true; options: FinanceOptions; settingsAvailable: false; message: string };

export type SettingsMutationResult =
  | { ok: true }
  | { ok: false; message: string };

export type SettingsKind = "category" | "expenseType" | "paymentMethod";

const SETTINGS_UNAVAILABLE_MESSAGE =
  "As configurações personalizadas ainda não estão ativas. Aplique supabase/sql/004_user_finance_settings.sql no Supabase.";

const MUTATION_ERROR_MESSAGE =
  "Não foi possível salvar a configuração agora. Verifique se a migration 004 foi aplicada.";

function normalizeName(name: string): string {
  return name.trim().replace(/\s+/g, " ").slice(0, 50);
}

function mapCategory(row: Database["public"]["Tables"]["user_categories"]["Row"]): Category {
  return {
    id: row.id,
    name: row.name,
    color: row.color,
    isDefault: false,
  };
}

function mapExpenseType(row: Database["public"]["Tables"]["user_expense_types"]["Row"]): ExpenseType {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    sortOrder: row.sort_order,
  };
}

function mapPaymentMethod(row: Database["public"]["Tables"]["user_payment_methods"]["Row"]): PaymentMethod {
  return {
    id: row.id,
    name: row.name,
  };
}

export class SupabaseUserSettingsRepository {
  constructor(private readonly supabase: SupabaseClient<Database>) {}

  async listFinanceOptions(userId: string): Promise<UserSettingsResult> {
    if (!userId) {
      return {
        ok: true,
        options: buildFinanceOptions(),
        settingsAvailable: false,
        message: SETTINGS_UNAVAILABLE_MESSAGE,
      };
    }

    const [categories, expenseTypes, paymentMethods] = await Promise.all([
      this.supabase
        .from("user_categories")
        .select("id,user_id,name,color,is_active,created_at,updated_at")
        .eq("user_id", userId)
        .eq("is_active", true)
        .order("name", { ascending: true }),
      this.supabase
        .from("user_expense_types")
        .select("id,user_id,name,description,sort_order,is_active,created_at,updated_at")
        .eq("user_id", userId)
        .eq("is_active", true)
        .order("sort_order", { ascending: true })
        .order("name", { ascending: true }),
      this.supabase
        .from("user_payment_methods")
        .select("id,user_id,name,is_active,created_at,updated_at")
        .eq("user_id", userId)
        .eq("is_active", true)
        .order("name", { ascending: true }),
    ]);

    if (categories.error || expenseTypes.error || paymentMethods.error) {
      return {
        ok: true,
        options: buildFinanceOptions(),
        settingsAvailable: false,
        message: SETTINGS_UNAVAILABLE_MESSAGE,
      };
    }

    return {
      ok: true,
      options: buildFinanceOptions({
        categories: (categories.data ?? []).map(mapCategory),
        expenseTypes: (expenseTypes.data ?? []).map(mapExpenseType),
        paymentMethods: (paymentMethods.data ?? []).map(mapPaymentMethod),
      }),
      settingsAvailable: true,
    };
  }

  async createOption(userId: string, kind: SettingsKind, name: string): Promise<SettingsMutationResult> {
    const safeName = normalizeName(name);

    if (!userId || !safeName) {
      return { ok: false, message: "Informe um nome para salvar." };
    }

    const now = new Date().toISOString();
    const result =
      kind === "category"
        ? await this.supabase.from("user_categories").insert({
            user_id: userId,
            name: safeName,
            color: "#8b5cf6",
            created_at: now,
            updated_at: now,
          })
        : kind === "expenseType"
          ? await this.supabase.from("user_expense_types").insert({
              user_id: userId,
              name: safeName,
              description: "",
              sort_order: 100,
              created_at: now,
              updated_at: now,
            })
          : await this.supabase.from("user_payment_methods").insert({
              user_id: userId,
              name: safeName,
              created_at: now,
              updated_at: now,
            });

    return result.error ? { ok: false, message: MUTATION_ERROR_MESSAGE } : { ok: true };
  }

  async updateOption(
    userId: string,
    kind: SettingsKind,
    id: string,
    name: string,
  ): Promise<SettingsMutationResult> {
    const safeName = normalizeName(name);

    if (!userId || !id || !safeName) {
      return { ok: false, message: "Informe um nome para atualizar." };
    }

    const updatedAt = new Date().toISOString();
    const result =
      kind === "category"
        ? await this.supabase
            .from("user_categories")
            .update({ name: safeName, updated_at: updatedAt })
            .eq("id", id)
            .eq("user_id", userId)
        : kind === "expenseType"
          ? await this.supabase
              .from("user_expense_types")
              .update({ name: safeName, updated_at: updatedAt })
              .eq("id", id)
              .eq("user_id", userId)
          : await this.supabase
              .from("user_payment_methods")
              .update({ name: safeName, updated_at: updatedAt })
              .eq("id", id)
              .eq("user_id", userId);

    return result.error ? { ok: false, message: MUTATION_ERROR_MESSAGE } : { ok: true };
  }

  async deleteOption(userId: string, kind: SettingsKind, id: string): Promise<SettingsMutationResult> {
    if (!userId || !id) {
      return { ok: false, message: "Não foi possível localizar essa configuração." };
    }

    const updatedAt = new Date().toISOString();
    const result =
      kind === "category"
        ? await this.supabase
            .from("user_categories")
            .update({ is_active: false, updated_at: updatedAt })
            .eq("id", id)
            .eq("user_id", userId)
        : kind === "expenseType"
          ? await this.supabase
              .from("user_expense_types")
              .update({ is_active: false, updated_at: updatedAt })
              .eq("id", id)
              .eq("user_id", userId)
          : await this.supabase
              .from("user_payment_methods")
              .update({ is_active: false, updated_at: updatedAt })
              .eq("id", id)
              .eq("user_id", userId);

    return result.error ? { ok: false, message: MUTATION_ERROR_MESSAGE } : { ok: true };
  }
}
