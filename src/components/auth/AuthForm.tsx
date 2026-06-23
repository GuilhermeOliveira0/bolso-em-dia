"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useActionState } from "react";
import { loginAction, signupAction, type AuthActionState } from "@/app/auth-actions";
import { AppIcon } from "@/components/ui/AppIcon";

type AuthMode = "login" | "signup";

type AuthFormProps = {
  mode: AuthMode;
  isConfigured: boolean;
  configMessage?: string;
};

export function AuthForm({ mode, isConfigured, configMessage }: AuthFormProps) {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/lancamentos";

  const isLogin = mode === "login";
  const action = isLogin ? loginAction : signupAction;
  const initialState: AuthActionState = { error: "", message: "" };
  const [state, formAction, isSubmitting] = useActionState(
    action,
    initialState,
  );

  return (
    <form action={formAction} className="auth-form">
      <input name="redirectTo" type="hidden" value={redirectTo} />
      {!isConfigured ? (
        <div className="setup-alert" role="alert">
          <strong>Configuração necessária</strong>
          <span>{configMessage}</span>
          <code>NEXT_PUBLIC_SUPABASE_URL</code>
          <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code>
        </div>
      ) : null}

      {!isLogin ? (
        <label className="field auth-field" htmlFor="name">
          <span>Nome</span>
          <div className="auth-input-wrapper">
            <AppIcon name="user" />
            <input
              autoComplete="name"
              id="name"
              maxLength={80}
              name="name"
              placeholder="Como você quer ser chamado"
              type="text"
              required
            />
          </div>
        </label>
      ) : null}

      <label className="field auth-field" htmlFor="email">
        <span>E-mail</span>
        <div className="auth-input-wrapper">
          <AppIcon name="envelope" />
          <input
            autoComplete="email"
            id="email"
            name="email"
            placeholder="voce@email.com"
            type="email"
            required
          />
        </div>
      </label>

      <label className="field auth-field" htmlFor="password">
        <span>Senha</span>
        <div className="auth-input-wrapper">
          <AppIcon name="lock" />
          <input
            autoComplete={isLogin ? "current-password" : "new-password"}
            id="password"
            minLength={6}
            name="password"
            placeholder="Mínimo de 6 caracteres"
            type="password"
            required
          />
        </div>
      </label>

      {state.error || (!isConfigured && configMessage) ? (
        <p className="error-message" role="alert">
          {state.error || configMessage}
        </p>
      ) : null}

      {state.message ? (
        <p className="success-message" role="status">
          {state.message}
        </p>
      ) : null}

      <button className="primary-action auth-submit" disabled={isSubmitting || !isConfigured} type="submit">
        <span>{isSubmitting ? "Aguarde..." : isLogin ? "Entrar" : "Criar conta"}</span>
        <AppIcon name={isLogin ? "arrow-right" : "check"} />
      </button>

      <p className="auth-switch">
        {isLogin ? "Ainda não tem conta?" : "Já tem conta?"}{" "}
        <Link href={isLogin ? "/cadastro" : "/login"}>
          {isLogin ? "Cadastre-se" : "Faça login"}
        </Link>
      </p>
    </form>
  );
}
