"use client";

/* eslint-disable @next/next/no-img-element */
import { useState } from "react";
import { AppIcon } from "@/components/ui/AppIcon";
import { formatCentsToCurrency } from "@/lib/expenses/money";
import type { Receipt, ReceiptWithPreview } from "@/types/finance";

type ReceiptListProps = {
  receipts: ReceiptWithPreview[];
  onReadReceipt?: (receiptId: string) => void;
  readingReceiptId?: string;
};

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "short",
  timeStyle: "short",
});

const dateOnlyFormatter = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "short",
});

function formatDateTime(value: string | null | undefined): string {
  if (!value) {
    return "Data não informada";
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Data não informada" : dateFormatter.format(date);
}

function formatDate(value: string | null | undefined): string {
  if (!value) {
    return "Não extraída";
  }

  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? "Não extraída" : dateOnlyFormatter.format(date);
}

function formatFileSize(sizeInBytes: number): string {
  if (sizeInBytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(sizeInBytes / 1024))} KB`;
  }

  return `${(sizeInBytes / 1024 / 1024).toFixed(1).replace(".", ",")} MB`;
}

function getReceiptStatusLabel(receipt: Receipt): string {
  if (receipt.expenseId) {
    return "Vinculado";
  }

  if (receipt.ocrStatus === "processing" || receipt.status === "processing") {
    return "Processando";
  }

  if (receipt.ocrStatus === "processed" || receipt.status === "processed") {
    return "Lido";
  }

  if (receipt.ocrStatus === "failed" || receipt.status === "failed") {
    return "Falhou";
  }

  return "Aguardando leitura";
}

function getStatusTone(receipt: Receipt): "success" | "warning" | "danger" | "neutral" {
  if (receipt.expenseId || receipt.ocrStatus === "processed" || receipt.status === "processed") {
    return "success";
  }

  if (receipt.ocrStatus === "processing" || receipt.status === "processing") {
    return "warning";
  }

  if (receipt.ocrStatus === "failed" || receipt.status === "failed") {
    return "danger";
  }

  return "neutral";
}

function formatExtractedAmount(receipt: Receipt): string {
  return receipt.extractedAmountInCents
    ? formatCentsToCurrency(receipt.extractedAmountInCents)
    : "Não extraído";
}

export function ReceiptList({ receipts, onReadReceipt, readingReceiptId }: ReceiptListProps) {
  const [selectedReceipt, setSelectedReceipt] = useState<ReceiptWithPreview | null>(null);

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
        <p>Toque em um comprovante para ver detalhes técnicos e dados extraídos.</p>
      </div>

      <ul className="receipt-list">
        {receipts.map((receipt) => (
          <ReceiptCard
            key={receipt.id}
            receipt={receipt}
            readingReceiptId={readingReceiptId}
            onOpenDetails={() => setSelectedReceipt(receipt)}
            onReadReceipt={onReadReceipt}
          />
        ))}
      </ul>

      {selectedReceipt ? (
        <ReceiptDetailsDialog
          receipt={selectedReceipt}
          readingReceiptId={readingReceiptId}
          onClose={() => setSelectedReceipt(null)}
          onReadReceipt={onReadReceipt}
        />
      ) : null}
    </section>
  );
}

function ReceiptCard({
  receipt,
  readingReceiptId,
  onOpenDetails,
  onReadReceipt,
}: {
  receipt: ReceiptWithPreview;
  readingReceiptId?: string;
  onOpenDetails: () => void;
  onReadReceipt?: (receiptId: string) => void;
}) {
  const isReading = readingReceiptId === receipt.id;
  const isAnyReceiptReading = Boolean(readingReceiptId);

  return (
    <li
      className="receipt-item"
      role="button"
      tabIndex={0}
      onClick={onOpenDetails}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onOpenDetails();
        }
      }}
    >
      <ReceiptPreview receipt={receipt} />
      <div className="receipt-card-content">
        <div className="receipt-title-row">
          <div>
            <strong>{receipt.fileName}</strong>
            <span>Enviado em {formatDateTime(receipt.createdAt)}</span>
          </div>
          <span className="status-badge" data-tone={getStatusTone(receipt)}>
            {getReceiptStatusLabel(receipt)}
          </span>
        </div>

        <div className="receipt-card-actions">
          {onReadReceipt ? (
            <form
              onClick={(event) => event.stopPropagation()}
              onSubmit={(event) => {
                event.preventDefault();
                onReadReceipt(receipt.id);
              }}
            >
              <button
                className="receipt-read-button"
                disabled={isAnyReceiptReading || Boolean(receipt.expenseId)}
                type="submit"
              >
                {isReading ? "Lendo..." : "Ler comprovante"}
              </button>
            </form>
          ) : null}
          <span className="receipt-details-hint">Ver detalhes</span>
        </div>
      </div>
    </li>
  );
}

function ReceiptPreview({ receipt }: { receipt: ReceiptWithPreview }) {
  return (
    <div className="receipt-preview">
      {receipt.previewUrl ? (
        <img
          alt={`Preview do comprovante ${receipt.fileName}`}
          loading="lazy"
          src={receipt.previewUrl}
        />
      ) : (
        <span className="receipt-preview-fallback" aria-label="Preview indisponível">
          <AppIcon className="app-icon" name="receipt" />
        </span>
      )}
    </div>
  );
}

function ReceiptDetailsDialog({
  receipt,
  readingReceiptId,
  onClose,
  onReadReceipt,
}: {
  receipt: ReceiptWithPreview;
  readingReceiptId?: string;
  onClose: () => void;
  onReadReceipt?: (receiptId: string) => void;
}) {
  const isReading = readingReceiptId === receipt.id;

  return (
    <div className="receipt-dialog-backdrop" role="presentation">
      <article
        aria-labelledby="receipt-details-title"
        aria-modal="true"
        className="receipt-dialog"
        role="dialog"
      >
        <div className="receipt-dialog-header">
          <div>
            <span>Detalhes do comprovante</span>
            <h3 id="receipt-details-title">{receipt.fileName}</h3>
          </div>
          <button aria-label="Fechar detalhes" className="icon-action" type="button" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="receipt-dialog-preview">
          <ReceiptPreview receipt={receipt} />
        </div>

        <dl className="receipt-details-grid">
          <DetailItem label="Tamanho" value={formatFileSize(receipt.fileSize)} />
          <DetailItem label="Tipo" value={receipt.fileType.replace("image/", "").toUpperCase()} />
          <DetailItem label="Enviado em" value={formatDateTime(receipt.createdAt)} />
          <DetailItem label="Status OCR" value={getReceiptStatusLabel(receipt)} />
          <DetailItem label="Valor extraído" value={formatExtractedAmount(receipt)} />
          <DetailItem label="Data extraída" value={formatDate(receipt.extractedDate)} />
          <DetailItem label="Recebedor extraído" value={receipt.extractedRecipient || "Não extraído"} />
          <DetailItem
            label="Despesa vinculada"
            value={receipt.expenseId ? "Sim, já vinculada" : "Ainda não vinculada"}
          />
        </dl>

        <div className="receipt-dialog-actions">
          {onReadReceipt ? (
            <button
              className="receipt-read-button"
              disabled={Boolean(readingReceiptId) || Boolean(receipt.expenseId)}
              type="button"
              onClick={() => onReadReceipt(receipt.id)}
            >
              {isReading ? "Lendo..." : "Ler comprovante"}
            </button>
          ) : null}
          <button className="secondary-action" type="button" onClick={onClose}>
            Fechar
          </button>
        </div>
      </article>
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}
