import { createClient } from "@/lib/supabase/server";
import { SupabaseUserSettingsRepository } from "@/lib/user-settings/user-settings-repository";

export async function createServerUserSettingsRepository() {
  return new SupabaseUserSettingsRepository(await createClient());
}
