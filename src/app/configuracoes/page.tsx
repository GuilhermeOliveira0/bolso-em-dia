import { redirect } from "next/navigation";
import { PrivateHeader } from "@/components/navigation/PrivateHeader";
import { AccountSettingsPanel } from "@/components/settings/AccountSettingsPanel";
import { getAuthenticatedUser } from "@/lib/auth/session";
import { createServerUserSettingsRepository } from "@/lib/user-settings/server-user-settings-repository";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const session = await getAuthenticatedUser();
  if (!session.ok) redirect("/login?redirect=%2Fconfiguracoes");

  const settingsRepository = await createServerUserSettingsRepository();
  const settings = await settingsRepository.listFinanceOptions(session.user.id);

  return (
    <main className="app-shell settings-page-shell">
      <PrivateHeader
        activePath="/configuracoes"
        email={session.user.email}
        name={session.user.name}
      />
      <AccountSettingsPanel
        email={session.user.email}
        financeOptions={settings.options}
        name={session.user.name}
        settingsMessage={settings.settingsAvailable ? "" : settings.message}
      />
    </main>
  );
}
