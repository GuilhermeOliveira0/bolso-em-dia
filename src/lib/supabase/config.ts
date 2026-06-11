export type SupabaseConfigStatus =
  | { ok: true; url: string; anonKey: string }
  | { ok: false; message: string };

export function getSupabaseConfig(): SupabaseConfigStatus {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (!url || !anonKey) {
    return {
      ok: false,
      message:
        "Configure NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY para usar login e dados privados.",
    };
  }

  return { ok: true, url, anonKey };
}

export function isSupabaseConfigured(): boolean {
  return getSupabaseConfig().ok;
}

export function requireSupabaseConfig(): { url: string; anonKey: string } {
  const config = getSupabaseConfig();

  if (!config.ok) {
    throw new Error(config.message);
  }

  return config;
}
