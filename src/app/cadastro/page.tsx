import { Suspense } from "react";
import { AuthForm } from "@/components/auth/AuthForm";
import { AuthPageShell } from "@/components/auth/AuthPageShell";
import { getSupabaseConfig } from "@/lib/supabase/config";

export default function SignupPage() {
  const config = getSupabaseConfig();

  return (
    <AuthPageShell
      eyebrow="Nova conta"
      title="Crie sua conta financeira."
      description="Use e-mail e senha para manter seus lançamentos separados dos dados de outras pessoas."
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
