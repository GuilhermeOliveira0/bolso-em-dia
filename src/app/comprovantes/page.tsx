import Link from "next/link";
import { redirect } from "next/navigation";
import { PrivateHeader } from "@/components/navigation/PrivateHeader";
import { ReceiptList } from "@/components/receipts/ReceiptList";
import { ReceiptUploadForm } from "@/components/receipts/ReceiptUploadForm";
import { getAuthenticatedUser } from "@/lib/auth/session";
import { createServerReceiptRepository } from "@/lib/receipts/server-receipt-repository";
import { createReceiptPreviewUrl } from "@/lib/receipts/receipt-storage";
import { createClient } from "@/lib/supabase/server";
import type { ReceiptWithPreview } from "@/types/finance";

export const dynamic = "force-dynamic";

export default async function ReceiptsPage() {
  const session = await getAuthenticatedUser();
  if (!session.ok) redirect("/login");

  try {
    const repository = await createServerReceiptRepository();
    const supabase = await createClient();
    const receipts = await repository.listByUser(session.user.id);
    const receiptsWithPreview: ReceiptWithPreview[] = await Promise.all(
      receipts.map(async (receipt) => ({
        ...receipt,
        previewUrl: await createReceiptPreviewUrl(supabase, receipt.filePath),
      })),
    );

    return (
      <main className="app-shell receipts-shell">
        <PrivateHeader
          activePath="/comprovantes"
          email={session.user.email}
          name={session.user.name}
        />

        <section className="receipts-intro">
          <div>
            <p className="eyebrow">Comprovantes</p>
            <h1>Guarde seus comprovantes Pix.</h1>
            <p>
              Envie apenas imagens nesta fatia. O arquivo fica privado e nenhum gasto e criado
              automaticamente.
            </p>
          </div>
          <Link className="primary-link" href="/gastos">
            Cadastrar gasto
          </Link>
        </section>

        <div className="receipt-workspace">
          <ReceiptUploadForm />
          <ReceiptList receipts={receiptsWithPreview} />
        </div>
      </main>
    );
  } catch {
    return (
      <main className="app-shell receipts-shell">
        <PrivateHeader
          activePath="/comprovantes"
          email={session.user.email}
          name={session.user.name}
        />
        <section className="dashboard-error" role="alert">
          <p>Nao foi possivel carregar seus comprovantes agora.</p>
          <span>Seus arquivos nao foram alterados. Tente novamente em alguns instantes.</span>
          <Link className="primary-link" href="/comprovantes">
            Tentar novamente
          </Link>
        </section>
      </main>
    );
  }
}
