"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { uploadReceiptAction, type UploadReceiptResult } from "@/app/comprovantes/actions";
import { MAX_RECEIPT_FILE_SIZE_BYTES } from "@/lib/receipts/receipt-file-schema";

export function ReceiptUploadForm() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [result, setResult] = useState<UploadReceiptResult | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      const actionResult = await uploadReceiptAction(formData);
      setResult(actionResult);

      if (actionResult.ok) {
        formRef.current?.reset();
        router.refresh();
      }
    });
  }

  return (
    <section className="panel receipt-upload-panel" aria-labelledby="receipt-upload-title">
      <div className="section-heading">
        <p className="eyebrow">Comprovante Pix</p>
        <h2 id="receipt-upload-title">Enviar imagem</h2>
      </div>

      <form ref={formRef} className="receipt-form" onSubmit={handleSubmit}>
        <label className="field">
          <span>Imagem do comprovante</span>
          <input
            accept="image/png,image/jpeg,image/webp"
            name="receipt"
            required
            type="file"
          />
        </label>

        <p className="receipt-help">
          PNG, JPG, JPEG ou WEBP ate {MAX_RECEIPT_FILE_SIZE_BYTES / 1024 / 1024} MB.
          OCR e criacao automatica de gasto ficam para uma proxima fatia.
        </p>

        {result ? (
          <p className={result.ok ? "success-message" : "error-message"} role="status">
            {result.message}
          </p>
        ) : null}

        <button className="primary-action" disabled={isPending} type="submit">
          {isPending ? "Enviando..." : "Enviar comprovante"}
        </button>
      </form>
    </section>
  );
}
