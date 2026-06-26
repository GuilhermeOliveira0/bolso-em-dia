import type { SupabaseClient } from "@supabase/supabase-js";
import { DEFAULT_CATEGORIES as DEFAULT_CATEGORY_SOURCE } from "@/lib/categories/default-categories";
import { DEFAULT_EXPENSE_TYPES as DEFAULT_EXPENSE_TYPE_SOURCE } from "@/lib/expense-types/default-expense-types";
import { DEFAULT_PAYMENT_METHODS as DEFAULT_PAYMENT_METHOD_SOURCE } from "@/lib/payment-methods/default-payment-methods";
import { buildFinanceOptions, type FinanceOptions } from "@/lib/user-settings/finance-options";
import type { Database } from "@/types/database";
import type { Category, ExpenseType, PaymentMethod } from "@/types/finance";

export type UserSettingsResult =
  | { ok: true; options: FinanceOptions; settingsAvailable: true }
  | { ok: true; options: FinanceOptions; settingsAvailable: false; message: string };

export type SettingsMutationResult =
  | { ok: true; option?: Category | ExpenseType | PaymentMethod }
  | { ok: false; message: string };

export type SettingsKind = "category" | "expenseType" | "paymentMethod";

const SETTINGS_UNAVAILABLE_MESSAGE =
  "As configurações personalizadas ainda não estão ativas. Aplique supabase/sql/004_user_finance_settings.sql no Supabase.";

const MUTATION_ERROR_MESSAGE =
  "Não foi possível salvar a configuração agora. Verifique se a migration 004 foi aplicada.";

const CATEGORY_DEFAULTS = new Map(DEFAULT_CATEGORY_SOURCE.map((option) => [option.id, option]));
const EXPENSE_TYPE_DEFAULTS = new Map(DEFAULT_EXPENSE_TYPE_SOURCE.map((option) => [option.id, option]));
const PAYMENT_METHOD_DEFAULTS = new Map(DEFAULT_PAYMENT_METHOD_SOURCE.map((option) => [option.id, option]));

function normalizeName(name: string): string {
  return name.trim().replace(/\s+/g, " ").slice(0, 50);
}

function mapCategory(row: Database["public"]["Tables"]["user_categories"]["Row"]): Category {
  const defaultCategory = row.default_option_id ? CATEGORY_DEFAULTS.get(row.default_option_id) : null;

  return {
    id: row.default_option_id ?? row.id,
    name: row.name,
    color: defaultCategory?.color ?? row.color,
    isDefault: Boolean(defaultCategory),
  };
}

function mapExpenseType(row: Database["public"]["Tables"]["user_expense_types"]["Row"]): ExpenseType {
  const defaultExpenseType = row.default_option_id ? EXPENSE_TYPE_DEFAULTS.get(row.default_option_id) : null;

  return {
    id: row.default_option_id ?? row.id,
    name: row.name,
    description: defaultExpenseType?.description ?? row.description,
    sortOrder: defaultExpenseType?.sortOrder ?? row.sort_order,
  };
}

function mapPaymentMethod(row: Database["public"]["Tables"]["user_payment_methods"]["Row"]): PaymentMethod {
  return {
    id: row.default_option_id ?? row.id,
    name: row.name,
  };
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
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
        .select("id,user_id,name,color,is_active,default_option_id,is_hidden,created_at,updated_at")
        .eq("user_id", userId)
        .eq("is_active", true)
        .order("name", { ascending: true }),
      this.supabase
        .from("user_expense_types")
        .select("id,user_id,name,description,sort_order,is_active,default_option_id,is_hidden,created_at,updated_at")
        .eq("user_id", userId)
        .eq("is_active", true)
        .order("sort_order", { ascending: true })
        .order("name", { ascending: true }),
      this.supabase
        .from("user_payment_methods")
        .select("id,user_id,name,is_active,default_option_id,is_hidden,created_at,updated_at")
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

    const categoryRows = categories.data ?? [];
    const expenseTypeRows = expenseTypes.data ?? [];
    const paymentMethodRows = paymentMethods.data ?? [];

    return {
      ok: true,
      options: buildFinanceOptions({
        categories: categoryRows.filter((row) => !row.is_hidden).map(mapCategory),
        expenseTypes: expenseTypeRows.filter((row) => !row.is_hidden).map(mapExpenseType),
        paymentMethods: paymentMethodRows.filter((row) => !row.is_hidden).map(mapPaymentMethod),
      }, {
        categories: categoryRows
          .filter((row) => row.is_hidden && row.default_option_id)
          .map((row) => row.default_option_id as string),
        expenseTypes: expenseTypeRows
          .filter((row) => row.is_hidden && row.default_option_id)
          .map((row) => row.default_option_id as string),
        paymentMethods: paymentMethodRows
          .filter((row) => row.is_hidden && row.default_option_id)
          .map((row) => row.default_option_id as string),
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
    const id = crypto.randomUUID();

    if (kind === "category") {
      const result = await this.supabase.from("user_categories").insert({
        id,
        user_id: userId,
        name: safeName,
        color: "#8b5cf6",
        is_active: true,
        created_at: now,
        updated_at: now,
      });

      return result.error
        ? { ok: false, message: MUTATION_ERROR_MESSAGE }
        : {
            ok: true,
            option: {
              id,
              name: safeName,
              color: "#8b5cf6",
              isDefault: false,
            },
          };
    }

    if (kind === "expenseType") {
      const result = await this.supabase.from("user_expense_types").insert({
        id,
        user_id: userId,
        name: safeName,
        description: "",
        sort_order: 100,
        is_active: true,
        created_at: now,
        updated_at: now,
      });

      return result.error
        ? { ok: false, message: MUTATION_ERROR_MESSAGE }
        : {
            ok: true,
            option: {
              id,
              name: safeName,
              description: "",
              sortOrder: 100,
            },
          };
    }

    const result = await this.supabase.from("user_payment_methods").insert({
      id,
      user_id: userId,
      name: safeName,
      is_active: true,
      created_at: now,
      updated_at: now,
    });

    return result.error
      ? { ok: false, message: MUTATION_ERROR_MESSAGE }
      : {
          ok: true,
          option: {
            id,
            name: safeName,
          },
        };
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

    if (!isUuid(id)) {
      return this.upsertDefaultOption(userId, kind, id, safeName, false, updatedAt);
    }

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

    if (!isUuid(id)) {
      const defaultName = getDefaultOptionName(kind, id);
      return defaultName
        ? this.upsertDefaultOption(userId, kind, id, defaultName, true, updatedAt)
        : { ok: false, message: "Não foi possível localizar essa configuração." };
    }

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

  private async upsertDefaultOption(
    userId: string,
    kind: SettingsKind,
    defaultOptionId: string,
    name: string,
    isHidden: boolean,
    updatedAt: string,
  ): Promise<SettingsMutationResult> {
    const existing = await this.findDefaultOverride(userId, kind, defaultOptionId);

    if (existing.error) {
      return { ok: false, message: MUTATION_ERROR_MESSAGE };
    }

    if (kind === "category") {
      const defaultCategory = CATEGORY_DEFAULTS.get(defaultOptionId);

      if (!defaultCategory) {
        return { ok: false, message: "Não foi possível localizar essa configuração." };
      }

      const payload = {
        name,
        color: defaultCategory.color,
        is_active: true,
        is_hidden: isHidden,
        updated_at: updatedAt,
      };

      const result = existing.id
        ? await this.supabase
            .from("user_categories")
            .update(payload)
            .eq("id", existing.id)
            .eq("user_id", userId)
        : await this.supabase.from("user_categories").insert({
            id: crypto.randomUUID(),
            user_id: userId,
            default_option_id: defaultOptionId,
            created_at: updatedAt,
            ...payload,
          });

      return result.error
        ? { ok: false, message: MUTATION_ERROR_MESSAGE }
        : {
            ok: true,
            option: isHidden
              ? undefined
              : {
                  id: defaultOptionId,
                  name,
                  color: defaultCategory.color,
                  isDefault: true,
                },
          };
    }

    if (kind === "expenseType") {
      const defaultExpenseType = EXPENSE_TYPE_DEFAULTS.get(defaultOptionId);

      if (!defaultExpenseType) {
        return { ok: false, message: "Não foi possível localizar essa configuração." };
      }

      const payload = {
        name,
        description: defaultExpenseType.description,
        sort_order: defaultExpenseType.sortOrder,
        is_active: true,
        is_hidden: isHidden,
        updated_at: updatedAt,
      };

      const result = existing.id
        ? await this.supabase
            .from("user_expense_types")
            .update(payload)
            .eq("id", existing.id)
            .eq("user_id", userId)
        : await this.supabase.from("user_expense_types").insert({
            id: crypto.randomUUID(),
            user_id: userId,
            default_option_id: defaultOptionId,
            created_at: updatedAt,
            ...payload,
          });

      return result.error
        ? { ok: false, message: MUTATION_ERROR_MESSAGE }
        : {
            ok: true,
            option: isHidden
              ? undefined
              : {
                  id: defaultOptionId,
                  name,
                  description: defaultExpenseType.description,
                  sortOrder: defaultExpenseType.sortOrder,
                },
          };
    }

    const defaultPaymentMethod = PAYMENT_METHOD_DEFAULTS.get(defaultOptionId);

    if (!defaultPaymentMethod) {
      return { ok: false, message: "Não foi possível localizar essa configuração." };
    }

    const payload = {
      name,
      is_active: true,
      is_hidden: isHidden,
      updated_at: updatedAt,
    };

    const result = existing.id
      ? await this.supabase
          .from("user_payment_methods")
          .update(payload)
          .eq("id", existing.id)
          .eq("user_id", userId)
      : await this.supabase.from("user_payment_methods").insert({
          id: crypto.randomUUID(),
          user_id: userId,
          default_option_id: defaultOptionId,
          created_at: updatedAt,
          ...payload,
        });

    return result.error
      ? { ok: false, message: MUTATION_ERROR_MESSAGE }
      : {
          ok: true,
          option: isHidden
            ? undefined
            : {
                id: defaultOptionId,
                name,
              },
        };
  }

  private async findDefaultOverride(userId: string, kind: SettingsKind, defaultOptionId: string) {
    if (kind === "category") {
      const { data, error } = await this.supabase
        .from("user_categories")
        .select("id")
        .eq("user_id", userId)
        .eq("default_option_id", defaultOptionId)
        .eq("is_active", true)
        .maybeSingle();

      return { id: data?.id, error };
    }

    if (kind === "expenseType") {
      const { data, error } = await this.supabase
        .from("user_expense_types")
        .select("id")
        .eq("user_id", userId)
        .eq("default_option_id", defaultOptionId)
        .eq("is_active", true)
        .maybeSingle();

      return { id: data?.id, error };
    }

    const { data, error } = await this.supabase
      .from("user_payment_methods")
      .select("id")
      .eq("user_id", userId)
      .eq("default_option_id", defaultOptionId)
      .eq("is_active", true)
      .maybeSingle();

    return { id: data?.id, error };
  }
}

function getDefaultOptionName(kind: SettingsKind, id: string): string {
  if (kind === "category") {
    return CATEGORY_DEFAULTS.get(id)?.name ?? "";
  }

  if (kind === "expenseType") {
    return EXPENSE_TYPE_DEFAULTS.get(id)?.name ?? "";
  }

  return PAYMENT_METHOD_DEFAULTS.get(id)?.name ?? "";
}
