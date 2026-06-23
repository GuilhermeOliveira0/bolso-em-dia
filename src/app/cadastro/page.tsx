import { Suspense } from "react";
import { AuthForm } from "@/components/auth/AuthForm";
import { AuthPageShell } from "@/components/auth/AuthPageShell";
import { getSupabaseConfig } from "@/lib/supabase/config";

export default function SignupPage() {
  const config = getSupabaseConfig();

  return (
    <AuthPageShell
      eyebrow="Nova conta"
      title="Crie sua conta"
      description="Cadastre-se para acompanhar seus gastos com segurança, rapidez e dados separados por usuário."
    >
      <Suspense>
        <AuthForm
          mode="signup"
          isConfigured={config.ok}
          configMessage={config.ok ? undefined : config.message}
        />
      </Suspense>
    </AuthPageShell>
  );
}
