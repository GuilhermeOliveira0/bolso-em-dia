"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";

type AuthMode = "login" | "signup";

type AuthFormProps = {
  mode: AuthMode;
  isConfigured: boolean;
  configMessage?: string;
};

export function AuthForm({ mode, isConfigured, configMessage }: AuthFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/gastos";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const isLogin = mode === "login";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!isConfigured) {
      setError(configMessage ?? "Supabase ainda não está configurado.");
      return;
    }

    setIsSubmitting(true);
    setError("");
    setMessage("");

    const supabase = createClient();
    const result = isLogin
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({
          email,
          password,
          options: { data: { name: name.trim() } },
        });

    if (result.error) {
      setError(result.error.message);
      setIsSubmitting(false);
      return;
    }

    if (!isLogin && !result.data.session) {
      setMessage("Conta criada. Confirme seu e-mail se o Supabase exigir confirmação.");
      setIsSubmitting(false);
      return;
    }

    router.replace(redirectTo);
    router.refresh();
  }

  return (
    <form className="auth-form" method="post" onSubmit={handleSubmit}>
      {!isConfigured ? (
        <div className="setup-alert" role="alert">
          <strong>Configuração necessária</strong>
          <span>{configMessage}</span>
          <code>NEXT_PUBLIC_SUPABASE_URL</code>
          <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code>
        </div>
      ) : null}

      {!isLogin ? (
        <label className="field" htmlFor="name">
          <span>Nome</span>
          <input
            autoComplete="name"
            id="name"
            maxLength={80}
            name="name"
            placeholder="Como você quer ser chamado"
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
          />
        </label>
      ) : null}

      <label className="field" htmlFor="email">
        <span>E-mail</span>
        <input
          autoComplete="email"
          id="email"
          name="email"
          placeholder="voce@email.com"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
      </label>

      <label className="field" htmlFor="password">
        <span>Senha</span>
        <input
          autoComplete={isLogin ? "current-password" : "new-password"}
          id="password"
          minLength={6}
          name="password"
          placeholder="Minimo de 6 caracteres"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
      </label>

      {error ? (
        <p className="error-message" role="alert">
          {error}
        </p>
      ) : null}

      {message ? (
        <p className="success-message" role="status">
          {message}
        </p>
      ) : null}

      <button className="primary-action" disabled={isSubmitting || !isConfigured} type="submit">
        {isSubmitting ? "Aguarde..." : isLogin ? "Entrar" : "Criar conta"}
      </button>

      <p className="auth-switch">
        {isLogin ? "Ainda não tem conta?" : "Já tem conta?"}{" "}
        <Link href={isLogin ? "/cadastro" : "/login"}>
          {isLogin ? "Criar conta" : "Entrar"}
        </Link>
      </p>
    </form>
  );
}
