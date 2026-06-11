import { Suspense } from "react";
import { AuthForm } from "@/components/auth/AuthForm";
import { AuthPageShell } from "@/components/auth/AuthPageShell";
import { getSupabaseConfig } from "@/lib/supabase/config";

export default function LoginPage() {
  const config = getSupabaseConfig();

  return (
    <AuthPageShell
      eyebrow="Acesso seguro"
      title="Entre para ver seus gastos."
      description="A área financeira é privada. Faça login para cadastrar e listar apenas os seus gastos."
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
