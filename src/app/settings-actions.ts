"use server";

import { revalidatePath } from "next/cache";
import { getFriendlyAuthError } from "@/lib/auth/auth-errors";
import { getAuthenticatedUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { createServerUserSettingsRepository } from "@/lib/user-settings/server-user-settings-repository";
import type { SettingsKind, SettingsMutationResult } from "@/lib/user-settings/user-settings-repository";

export type AccountActionResult =
  | { ok: true; message: string }
  | { ok: false; message: string };

function revalidatePrivateViews() {
  revalidatePath("/dashboard");
  revalidatePath("/extrato");
  revalidatePath("/lancamentos");
  revalidatePath("/gastos");
}

function normalizeName(value: string): string {
  return value.trim().replace(/\s+/g, " ").slice(0, 80);
}

function isSettingsKind(value: string): value is SettingsKind {
  return value === "category" || value === "expenseType" || value === "paymentMethod";
}

export async function updateAccountNameAction(name: string): Promise<AccountActionResult> {
  const session = await getAuthenticatedUser();

  if (!session.ok) {
    return { ok: false, message: session.message };
  }

  const safeName = normalizeName(name);

  if (!safeName) {
    return { ok: false, message: "Informe um nome para o perfil." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ data: { name: safeName } });

  if (error) {
    return { ok: false, message: getFriendlyAuthError(error) };
  }

  revalidatePrivateViews();
  return { ok: true, message: "Nome atualizado." };
}

export async function updateAccountPasswordAction(password: string): Promise<AccountActionResult> {
  const session = await getAuthenticatedUser();

  if (!session.ok) {
    return { ok: false, message: session.message };
  }

  if (password.trim().length < 6) {
    return { ok: false, message: "Use uma senha com pelo menos 6 caracteres." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    return { ok: false, message: getFriendlyAuthError(error) };
  }

  return { ok: true, message: "Senha atualizada." };
}

export async function createUserSettingOptionAction(
  kind: string,
  name: string,
): Promise<SettingsMutationResult> {
  const session = await getAuthenticatedUser();

  if (!session.ok) {
    return { ok: false, message: session.message };
  }

  if (!isSettingsKind(kind)) {
    return { ok: false, message: "Tipo de configuração inválido." };
  }

  const repository = await createServerUserSettingsRepository();
  const result = await repository.createOption(session.user.id, kind, name);

  if (result.ok) {
    revalidatePrivateViews();
  }

  return result;
}

export async function updateUserSettingOptionAction(
  kind: string,
  id: string,
  name: string,
): Promise<SettingsMutationResult> {
  const session = await getAuthenticatedUser();

  if (!session.ok) {
    return { ok: false, message: session.message };
  }

  if (!isSettingsKind(kind)) {
    return { ok: false, message: "Tipo de configuração inválido." };
  }

  const repository = await createServerUserSettingsRepository();
  const result = await repository.updateOption(session.user.id, kind, id, name);

  if (result.ok) {
    revalidatePrivateViews();
  }

  return result;
}

export async function deleteUserSettingOptionAction(
  kind: string,
  id: string,
): Promise<SettingsMutationResult> {
  const session = await getAuthenticatedUser();

  if (!session.ok) {
    return { ok: false, message: session.message };
  }

  if (!isSettingsKind(kind)) {
    return { ok: false, message: "Tipo de configuração inválido." };
  }

  const repository = await createServerUserSettingsRepository();
  const result = await repository.deleteOption(session.user.id, kind, id);

  if (result.ok) {
    revalidatePrivateViews();
  }

  return result;
}
