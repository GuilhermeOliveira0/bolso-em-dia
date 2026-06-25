type AuthErrorLike = {
  code?: string;
  message?: string;
  status?: number;
};

const GENERIC_AUTH_ERROR =
  "Nao foi possivel concluir a autenticacao agora. Tente novamente em instantes.";

function normalize(value?: string): string {
  return value?.toLowerCase().trim() ?? "";
}

export function getFriendlyAuthError(error: AuthErrorLike): string {
  const code = normalize(error.code);
  const message = normalize(error.message);

  if (code === "over_email_send_rate_limit" || message.includes("email rate limit")) {
    return "O limite de envio de e-mails do Supabase foi atingido. Aguarde alguns minutos e tente novamente.";
  }

  if (code === "email_address_invalid" || message.includes("email address") && message.includes("invalid")) {
    return "Use um e-mail valido de um provedor real. Alguns dominios de teste sao recusados pelo Supabase.";
  }

  if (code === "weak_password" || message.includes("password")) {
    return "Use uma senha mais forte, com pelo menos 6 caracteres.";
  }

  if (code === "invalid_credentials" || message.includes("invalid login credentials")) {
    return "E-mail ou senha incorretos.";
  }

  if (code === "email_not_confirmed" || message.includes("email not confirmed")) {
    return "Confirme seu e-mail antes de entrar.";
  }

  if (error.status === 429) {
    return "Muitas tentativas em pouco tempo. Aguarde alguns minutos e tente novamente.";
  }

  return GENERIC_AUTH_ERROR;
}
