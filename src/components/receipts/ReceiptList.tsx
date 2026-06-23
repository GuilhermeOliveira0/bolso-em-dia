"use client";

/* eslint-disable @next/next/no-img-element */
import type { ReceiptWithPreview } from "@/types/finance";

type ReceiptListProps = {
  receipts: ReceiptWithPreview[];
  onReadReceipt?: (receiptId: string) => void;
  readingReceiptId?: string;
};

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "short",
  timeStyle: "short",
});

function formatFileSize(sizeInBytes: number): string {
  if (sizeInBytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(sizeInBytes / 1024))} KB`;
  }

  return `${(sizeInBytes / 1024 / 1024).toFixed(1).replace(".", ",")} MB`;
}

export function ReceiptList({ receipts, onReadReceipt, readingReceiptId }: ReceiptListProps) {
  if (receipts.length === 0) {
    return (
      <section className="panel receipt-list-panel" aria-labelledby="receipt-list-title">
        <div className="section-heading">
          <p className="eyebrow">Arquivo privado</p>
          <h2 id="receipt-list-title">Meus comprovantes</h2>
        </div>
        <div className="empty-state">
          <p>Nenhum comprovante enviado ainda.</p>
          <span>Envie uma imagem para guardar o comprovante com segurança.</span>
        </div>
      </section>
    );
  }

  return (
    <section className="panel receipt-list-panel" aria-labelledby="receipt-list-title">
      <div className="section-heading">
        <p className="eyebrow">Arquivo privado</p>
        <h2 id="receipt-list-title">Meus comprovantes</h2>
        <p>Arquivos recentes com preview temporário e metadados seguros.</p>
      </div>

      <ul className="receipt-list">
        {receipts.map((receipt) => (
          <li className="receipt-item" key={receipt.id}>
            <div className="receipt-preview">
              {receipt.previewUrl ? (
                <img
                  alt={`Preview do comprovante ${receipt.fileName}`}
                  loading="lazy"
                  src={receipt.previewUrl}
                />
              ) : (
                <span>Preview indisponível</span>
              )}
            </div>
            <div className="receipt-details">
              <div className="receipt-title-row">
                <strong>{receipt.fileName}</strong>
                <span className="status-badge">{receipt.status}</span>
              </div>
              <dl>
                <div>
                  <dt>Tamanho</dt>
                  <dd>{formatFileSize(receipt.fileSize)}</dd>
                </div>
                <div>
                  <dt>Tipo</dt>
                  <dd>{receipt.fileType.replace("image/", "").toUpperCase()}</dd>
                </div>
                <div>
                  <dt>Enviado em</dt>
                  <dd>{dateFormatter.format(new Date(receipt.createdAt))}</dd>
                </div>
              </dl>
              {onReadReceipt ? (
                <form
                  onSubmit={(event) => {
                    event.preventDefault();
                    onReadReceipt(receipt.id);
                  }}
                >
                  <button
                    className="receipt-read-button"
                    disabled={readingReceiptId === receipt.id || Boolean(receipt.expenseId)}
                    type="submit"
                  >
                    {readingReceiptId === receipt.id ? "Lendo..." : "Ler comprovante"}
                  </button>
                </form>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
