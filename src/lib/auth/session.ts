import { redirect } from "next/navigation";
import { getSupabaseConfig } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import { toAuthenticatedUser, type AuthenticatedUser } from "@/lib/users/current-user";

export type AuthSessionResult =
  | { ok: true; user: AuthenticatedUser }
  | { ok: false; reason: "missing-config" | "unauthenticated"; message: string };

export async function getAuthenticatedUser(): Promise<AuthSessionResult> {
  const config = getSupabaseConfig();

  if (!config.ok) {
    return { ok: false, reason: "missing-config", message: config.message };
  }

  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return {
      ok: false,
      reason: "unauthenticated",
      message: "Entre na sua conta para acessar seus gastos.",
    };
  }

  return { ok: true, user: toAuthenticatedUser(user) };
}

export async function requireAuthenticatedUser(): Promise<AuthenticatedUser> {
  const session = await getAuthenticatedUser();

  if (session.ok) {
    return session.user;
  }

  redirect("/login");
}
