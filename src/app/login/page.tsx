import { Suspense } from "react";
import { AuthForm } from "@/components/auth/AuthForm";
import { AuthPageShell } from "@/components/auth/AuthPageShell";
import { getSupabaseConfig } from "@/lib/supabase/config";

export default function LoginPage() {
  const config = getSupabaseConfig();

  return (
    <AuthPageShell
      eyebrow="Acesso seguro"
      title="Acesse sua conta"
      description="Seu controle financeiro inteligente, privado e rápido."
    >
      <Suspense>
        <AuthForm
          mode="login"
          isConfigured={config.ok}
          configMessage={config.ok ? undefined : config.message}
        />
      </Suspense>
    </AuthPageShell>
  );
}
