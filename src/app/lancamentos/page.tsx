import { redirect } from "next/navigation";
import { LaunchpadApp } from "@/components/launchpad/LaunchpadApp";
import { getAuthenticatedUser } from "@/lib/auth/session";
import { buildReceiptsWithPreview } from "@/lib/receipts/receipt-preview";
import { createServerReceiptRepository } from "@/lib/receipts/server-receipt-repository";

export const dynamic = "force-dynamic";

export default async function LaunchpadPage() {
  const session = await getAuthenticatedUser();

  if (!session.ok) {
    redirect("/login?redirect=/lancamentos");
  }

  const repository = await createServerReceiptRepository();
  const receipts = await repository.listByUser(session.user.id);
  const receiptsWithPreview = await buildReceiptsWithPreview(receipts);

  return (
    <LaunchpadApp
      receipts={receiptsWithPreview}
      user={{
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
      }}
    />
  );
}
