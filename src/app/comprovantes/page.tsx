import Link from "next/link";
import { redirect } from "next/navigation";
import { PrivateHeader } from "@/components/navigation/PrivateHeader";
import { ReceiptList } from "@/components/receipts/ReceiptList";
import { ReceiptUploadForm } from "@/components/receipts/ReceiptUploadForm";
import { getAuthenticatedUser } from "@/lib/auth/session";
import { buildReceiptsWithPreview } from "@/lib/receipts/receipt-preview";
import { createServerReceiptRepository } from "@/lib/receipts/server-receipt-repository";

export const dynamic = "force-dynamic";

export default async function ReceiptsPage() {
  const session = await getAuthenticatedUser();
  if (!session.ok) redirect("/login");

  try {
    const repository = await createServerReceiptRepository();
    const receipts = await repository.listByUser(session.user.id);
    const receiptsWithPreview = await buildReceiptsWithPreview(receipts);

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
              Envie apenas imagens nesta fatia. O arquivo fica privado, o OCR ainda não
              está ativo e nenhum gasto é criado automaticamente.
            </p>
            <div className="quick-actions" aria-label="Garantias desta área">
              <span className="quick-pill">Bucket privado</span>
              <span className="quick-pill">Imagem até 5 MB</span>
              <span className="quick-pill">Sem gasto automático</span>
            </div>
          </div>
          <Link className="primary-link" href="/lancamentos">
            Abrir lançamentos
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
          <p>Não foi possível carregar seus comprovantes agora.</p>
          <span>Seus arquivos não foram alterados. Tente novamente em alguns instantes.</span>
          <Link className="primary-link" href="/comprovantes">
            Tentar novamente
          </Link>
        </section>
      </main>
    );
  }
}
