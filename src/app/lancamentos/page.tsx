import { redirect } from "next/navigation";
import { LaunchpadApp } from "@/components/launchpad/LaunchpadApp";
import { getAuthenticatedUser } from "@/lib/auth/session";
import { buildReceiptsWithPreview } from "@/lib/receipts/receipt-preview";
import { createServerReceiptRepository } from "@/lib/receipts/server-receipt-repository";
import { createServerUserSettingsRepository } from "@/lib/user-settings/server-user-settings-repository";

export const dynamic = "force-dynamic";

export default async function LaunchpadPage() {
  const session = await getAuthenticatedUser();

  if (!session.ok) {
    redirect("/login?redirect=/lancamentos");
  }

  const [repository, settingsRepository] = await Promise.all([
    createServerReceiptRepository(),
    createServerUserSettingsRepository(),
  ]);
  const [receipts, settings] = await Promise.all([
    repository.listByUser(session.user.id),
    settingsRepository.listFinanceOptions(session.user.id),
  ]);
  const receiptsWithPreview = await buildReceiptsWithPreview(receipts);

  return (
    <LaunchpadApp
      financeOptions={settings.options}
      settingsMessage={settings.settingsAvailable ? "" : settings.message}
      receipts={receiptsWithPreview}
      user={{
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
      }}
    />
  );
}
