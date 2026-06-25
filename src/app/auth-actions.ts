"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { getFriendlyAuthError } from "@/lib/auth/auth-errors";
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
    return "/lancamentos";
  }

  return redirectTo;
}

async function getEmailRedirectUrl(): Promise<string | undefined> {
  const requestHeaders = await headers();
  const origin = requestHeaders.get("origin");

  if (!origin) {
    return undefined;
  }

  try {
    const url = new URL("/login", origin);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return undefined;
    }

    return url.toString();
  } catch {
    return undefined;
  }
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
    return { error: getFriendlyAuthError(result.error), message: "" };
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
  const emailRedirectTo = await getEmailRedirectUrl();
  const result = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name },
      emailRedirectTo,
    },
  });

  if (result.error) {
    return { error: getFriendlyAuthError(result.error), message: "" };
  }

  if (!result.data.session) {
    return {
      error: "",
      message:
        "Conta criada no Supabase. Confirme seu e-mail para entrar ou desative a confirmacao de e-mail no Supabase Auth para liberar acesso imediato.",
    };
  }

  redirect(getRedirectPath(formData));
}
