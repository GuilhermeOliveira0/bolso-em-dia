"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type AuthActionState = {
  error: string;
  message: string;
};

function getFormValue(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function getRedirectPath(formData: FormData): string {
  const redirectTo = getFormValue(formData, "redirectTo");

  if (!redirectTo.startsWith("/") || redirectTo.startsWith("//")) {
    return "/gastos";
  }

  return redirectTo;
}

export async function loginAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = getFormValue(formData, "email");
  const password = getFormValue(formData, "password");

  if (!email || !password) {
    return { error: "Informe e-mail e senha para entrar.", message: "" };
  }

  const supabase = await createClient();
  const result = await supabase.auth.signInWithPassword({ email, password });

  if (result.error) {
    return { error: result.error.message, message: "" };
  }

  redirect(getRedirectPath(formData));
}

export async function signupAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const name = getFormValue(formData, "name");
  const email = getFormValue(formData, "email");
  const password = getFormValue(formData, "password");

  if (!name || !email || !password) {
    return { error: "Informe nome, e-mail e senha para criar sua conta.", message: "" };
  }

  const supabase = await createClient();
  const result = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name } },
  });

  if (result.error) {
    return { error: result.error.message, message: "" };
  }

  if (!result.data.session) {
    return {
      error: "",
      message: "Conta criada. Confirme seu e-mail se o Supabase exigir confirmação.",
    };
  }

  redirect(getRedirectPath(formData));
}
